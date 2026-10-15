import express from 'express';
import {
  handleCustomerRegistration,
  handleCustomerLogin,
  fetchCustomerProfile,
  handleCustomerLogout
} from '../controllers/auth.controller.js';
import { authenticateCustomer } from '../middleware/verifyAuth.js';

const router = express.Router();

router.post('/register', handleCustomerRegistration);
router.post('/login', handleCustomerLogin);
router.get('/me', authenticateCustomer, fetchCustomerProfile);
router.post('/logout', authenticateCustomer, handleCustomerLogout);

export default router;
