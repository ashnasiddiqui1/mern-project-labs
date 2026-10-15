import express from 'express';
import {
  addProductToWishlist,
  fetchCustomerWishlist,
  deleteProductFromWishlist
} from '../controllers/savedItems.controller.js';
import { authenticateCustomer } from '../middleware/verifyAuth.js';

const router = express.Router();

router.post('/:productId', authenticateCustomer, addProductToWishlist);
router.get('/', authenticateCustomer, fetchCustomerWishlist);
router.delete('/:productId', authenticateCustomer, deleteProductFromWishlist);

export default router;
