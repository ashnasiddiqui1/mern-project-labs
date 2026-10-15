import express from 'express';
import {
  addItemToBasket,
  fetchCustomerBasket,
  modifyBasketItemQuantity,
  deleteItemFromBasket
} from '../controllers/basket.controller.js';
import { authenticateCustomer } from '../middleware/verifyAuth.js';

const router = express.Router();

router.post('/:productId', authenticateCustomer, addItemToBasket);
router.get('/', authenticateCustomer, fetchCustomerBasket);
router.patch('/:productId', authenticateCustomer, modifyBasketItemQuantity);
router.delete('/:productId', authenticateCustomer, deleteItemFromBasket);

export default router;
