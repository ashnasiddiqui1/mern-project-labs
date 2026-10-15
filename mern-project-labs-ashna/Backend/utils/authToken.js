import jwt from 'jsonwebtoken';

export function createCustomerToken(customerId) {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: customerId },
    secretKey,
    { expiresIn: '1d' }
  );
}
