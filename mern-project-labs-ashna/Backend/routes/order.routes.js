import express from 'express';
import {
  initiatePaymentOrder,
  verifyRazorpayPayment,
  handlePaymentFailure,
  fetchCustomerOrders,
  fetchCustomerOrderById
} from '../controllers/checkout.controller.js';
import { authenticateCustomer } from '../middleware/verifyAuth.js';

const router = express.Router();

router.post('/create-payment-order', authenticateCustomer, initiatePaymentOrder);
router.post('/verify-payment', authenticateCustomer, verifyRazorpayPayment);
router.post('/payment-failed', authenticateCustomer, handlePaymentFailure);
router.get('/', authenticateCustomer, fetchCustomerOrders);
router.get('/:id', authenticateCustomer, fetchCustomerOrderById);

export default router;
