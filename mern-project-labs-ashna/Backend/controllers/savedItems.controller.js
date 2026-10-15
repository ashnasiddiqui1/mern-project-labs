import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

export async function addProductToWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const targetProduct = await Product.findById(productId);
    if (!targetProduct) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const currentCustomer = await Customer.findById(req.user._id);
    if (!currentCustomer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const alreadySaved = currentCustomer.wishlist.some(
      (savedId) => savedId.toString() === productId
    );

    if (alreadySaved) {
      return res.status(409).json({
        error: 'Product already in wishlist'
      });
    }

    currentCustomer.wishlist.push(productId);
    await currentCustomer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function fetchCustomerWishlist(req, res) {
  try {
    const customerRecord = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    if (!customerRecord) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    return res.status(200).json({
      success: true,
      count: customerRecord.wishlist.length,
      wishlist: customerRecord.wishlist
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function deleteProductFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        error: 'Invalid product ID'
      });
    }

    const currentCustomer = await Customer.findById(req.user._id);
    if (!currentCustomer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    const itemPosition = currentCustomer.wishlist.findIndex(
      (savedId) => savedId.toString() === productId
    );

    if (itemPosition === -1) {
      return res.status(404).json({
        error: 'Product not in wishlist'
      });
    }

    currentCustomer.wishlist.splice(itemPosition, 1);
    await currentCustomer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}
