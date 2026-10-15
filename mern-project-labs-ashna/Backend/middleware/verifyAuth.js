import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export async function authenticateCustomer(req, res, next) {
  try {
    const sessionToken = req.cookies?.token;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = jwt.verify(sessionToken, process.env.JWT_SECRET);
    const activeCustomer = await Customer.findById(payload.id);

    if (!activeCustomer) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = activeCustomer;
    next();
  } catch (authError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export default authenticateCustomer;
