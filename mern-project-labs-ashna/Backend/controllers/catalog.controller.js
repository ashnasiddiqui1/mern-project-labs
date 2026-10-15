import mongoose from 'mongoose';
import Product from '../models/product.model.js';

export async function addCatalogProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    const numericalPrice = Number(price);
    if (numericalPrice <= 0) {
      return res.status(400).json({
        error: 'Price must be greater than 0'
      });
    }

    const numericalStock = Number(stock);
    if (numericalStock < 0) {
      return res.status(400).json({
        error: 'Stock must be 0 or greater'
      });
    }

    const productRecord = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numericalPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numericalStock
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: productRecord
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message || 'Failed to create product'
    });
  }
}

export async function listCatalogProducts(req, res) {
  try {
    const { search, category } = req.query;
    const filterCriteria = {};

    if (search && String(search).trim() !== '') {
      filterCriteria.name = {
        $regex: String(search).trim(),
        $options: 'i'
      };
    }

    if (category && category !== 'All Categories' && category !== 'All') {
      filterCriteria.category = category;
    }

    const matchedProducts = await Product.find(filterCriteria);

    return res.status(200).json({
      success: true,
      count: matchedProducts.length,
      products: matchedProducts
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}

export async function fetchCatalogProductById(req, res) {
  try {
    const { id: productId } = req.params;

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

    return res.status(200).json({
      success: true,
      product: productDoc
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error'
    });
  }
}
