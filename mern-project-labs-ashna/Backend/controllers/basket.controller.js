import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

export async function addItemToBasket(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (productDoc.stock <= 0) {
      return res.status(400).json({
        error: 'Product is out of stock'
      });
    }

    const customerRecord = await Customer.findById(req.user._id);
    if (!customerRecord) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const cartEntryIndex = customerRecord.cart.findIndex(
      (entry) => entry.product.toString() === productId
    );

    if (cartEntryIndex > -1) {
      const nextQuantity = customerRecord.cart[cartEntryIndex].quantity + 1;
      if (nextQuantity > productDoc.stock) {
        return res.status(400).json({
          error: 'Cannot add more items than available in stock'
        });
      }
      customerRecord.cart[cartEntryIndex].quantity = nextQuantity;
    } else {
      customerRecord.cart.push({
        product: productId,
        quantity: 1
      });
    }

    await customerRecord.save();
    await customerRecord.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: customerRecord.cart
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function fetchCustomerBasket(req, res) {
  try {
    const customerRecord = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    if (!customerRecord) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      cart: customerRecord.cart
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function modifyBasketItemQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const numericalQty = Number(quantity);
    if (quantity === undefined || isNaN(numericalQty) || numericalQty < 1) {
      return res.status(400).json({
        error: 'Quantity must be a number greater than or equal to 1'
      });
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (numericalQty > productDoc.stock) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock'
      });
    }

    const customerRecord = await Customer.findById(req.user._id);
    if (!customerRecord) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const cartEntryIndex = customerRecord.cart.findIndex(
      (entry) => entry.product.toString() === productId
    );

    if (cartEntryIndex === -1) {
      return res.status(404).json({
        error: 'Product not found in cart'
      });
    }

    customerRecord.cart[cartEntryIndex].quantity = numericalQty;
    await customerRecord.save();
    await customerRecord.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: customerRecord.cart
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function deleteItemFromBasket(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const customerRecord = await Customer.findById(req.user._id);
    if (!customerRecord) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const cartEntryIndex = customerRecord.cart.findIndex(
      (entry) => entry.product.toString() === productId
    );

    if (cartEntryIndex === -1) {
      return res.status(404).json({
        error: 'Product not found in cart'
      });
    }

    customerRecord.cart.splice(cartEntryIndex, 1);
    await customerRecord.save();
    await customerRecord.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: customerRecord.cart
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}
