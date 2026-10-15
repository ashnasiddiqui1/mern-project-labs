import mongoose from 'mongoose';
import crypto from 'crypto';
import Order from '../models/order.model.js';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';
import { getPaymentGateway } from '../config/payment.js';

export async function initiatePaymentOrder(req, res) {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        error: 'Shipping address is required'
      });
    }

    const recipientName = shippingAddress.fullName?.trim();
    const recipientPhone = shippingAddress.phone?.trim();
    const addressStreet = (shippingAddress.addressLine || shippingAddress.address)?.trim();
    const city = shippingAddress.city?.trim();
    const state = shippingAddress.state?.trim();
    const pincode = shippingAddress.pincode?.trim();

    if (!recipientName || !recipientPhone || !addressStreet || !city || !state || !pincode) {
      return res.status(400).json({
        error: 'All shipping address fields are required'
      });
    }

    const numericPhoneDigits = recipientPhone.replace(/\D/g, '');
    if (numericPhoneDigits.length < 10 || numericPhoneDigits.length > 15) {
      return res.status(400).json({
        error: 'Please enter a valid phone number'
      });
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        error: 'Pincode must contain exactly 6 digits'
      });
    }

    const buyer = await Customer.findById(req.user._id);
    if (!buyer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    if (!buyer.cart || buyer.cart.length === 0) {
      return res.status(400).json({
        error: 'Your cart is empty'
      });
    }

    const snapshotItems = [];
    let grandTotal = 0;

    for (const cartEntry of buyer.cart) {
      const productDoc = await Product.findById(cartEntry.product);

      if (!productDoc) {
        return res.status(400).json({
          error: 'One or more products in your cart are no longer available'
        });
      }

      if (cartEntry.quantity > productDoc.stock) {
        return res.status(400).json({
          error: `Insufficient stock for ${productDoc.name}. Available: ${productDoc.stock}`
        });
      }

      snapshotItems.push({
        product: productDoc._id,
        name: productDoc.name,
        price: productDoc.price,
        quantity: cartEntry.quantity,
        image: productDoc.image
      });

      grandTotal += productDoc.price * cartEntry.quantity;
    }

    const pendingOrder = new Order({
      customer: buyer._id,
      items: snapshotItems,
      shippingAddress: {
        fullName: recipientName,
        phone: recipientPhone,
        addressLine: addressStreet,
        city,
        state,
        pincode
      },
      totalAmount: grandTotal,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    const paymentGateway = getPaymentGateway();
    const gatewayOrder = await paymentGateway.orders.create({
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      receipt: `order_${pendingOrder._id}`
    });

    pendingOrder.razorpayOrderId = gatewayOrder.id;
    await pendingOrder.save();

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: gatewayOrder.id,
      orderId: pendingOrder._id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to create payment order'
    });
  }
}

export async function verifyRazorpayPayment(req, res) {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: 'Missing payment verification details'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder || existingOrder.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (existingOrder.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order: existingOrder
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${existingOrder.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      existingOrder.paymentStatus = 'FAILED';
      await existingOrder.save();

      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Deduct stock for each purchased item
    for (const item of existingOrder.items) {
      const productDoc = await Product.findById(item.product);
      if (productDoc) {
        productDoc.stock = Math.max(0, productDoc.stock - item.quantity);
        await productDoc.save();
      }
    }

    existingOrder.paymentStatus = 'PAID';
    existingOrder.status = 'PLACED';
    existingOrder.razorpayPaymentId = razorpay_payment_id;
    await existingOrder.save();

    // Clear the customer's cart
    const buyer = await Customer.findById(req.user._id);
    if (buyer) {
      buyer.cart = [];
      await buyer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      order: existingOrder
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to verify payment'
    });
  }
}

export async function handlePaymentFailure(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const targetedOrder = await Order.findById(orderId);
    if (!targetedOrder || targetedOrder.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (targetedOrder.paymentStatus === 'PENDING') {
      targetedOrder.paymentStatus = 'FAILED';
      await targetedOrder.save();
    }

    return res.status(200).json({
      success: true,
      order: targetedOrder
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to update payment status'
    });
  }
}

export async function fetchCustomerOrders(req, res) {
  try {
    const customerOrders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customerOrders.length,
      orders: customerOrders
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch orders'
    });
  }
}

export async function fetchCustomerOrderById(req, res) {
  try {
    const { id: orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        error: 'Invalid order ID'
      });
    }

    const orderDoc = await Order.findById(orderId);
    if (!orderDoc) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    if (orderDoc.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Unauthorized to view this order'
      });
    }

    return res.status(200).json({
      success: true,
      order: orderDoc
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch order details'
    });
  }
}
