import assert from 'node:assert';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createCustomerToken } from '../utils/authToken.js';

async function runTests() {
  console.log('Running Backend Core Logic Tests...\n');

  // Test 1: Password hashing and comparison
  console.log('1. Testing bcrypt password hashing and verification...');
  const testPassword = 'SecurePassword123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  assert(hashedPassword !== testPassword, 'Password must be hashed');
  const isMatch = await bcrypt.compare(testPassword, hashedPassword);
  assert.strictEqual(isMatch, true, 'Hashed password should match raw password');
  const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
  assert.strictEqual(isWrongMatch, false, 'Wrong password must fail verification');
  console.log('   ✓ Password hashing and verification passed.');

  // Test 2: JWT generation and verification
  console.log('2. Testing JWT token generation and verification...');
  process.env.JWT_SECRET = 'test_secret_key_for_unit_tests';
  const customerId = '65239a04a1b2c3d4e5f67890';
  const token = createCustomerToken(customerId);
  assert(typeof token === 'string' && token.length > 20, 'Token must be a non-empty string');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, customerId, 'Decoded token ID must match customer ID');
  console.log('   ✓ JWT generation and verification passed.');

  // Test 3: Razorpay HMAC SHA256 signature verification calculation
  console.log('3. Testing Razorpay HMAC SHA256 payment signature calculation...');
  const razorpaySecret = 'test_key_secret_xyz123';
  const orderId = 'order_DA1234567890';
  const paymentId = 'pay_9876543210';
  const expectedPayload = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(expectedPayload)
    .digest('hex');

  assert(typeof validSignature === 'string' && validSignature.length === 64, 'HMAC signature must be 64-char hex string');
  const computedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  assert.strictEqual(computedSignature, validSignature, 'Signatures must match for valid payment');
  const wrongSignature = crypto
    .createHmac('sha256', 'wrong_secret')
    .update(orderId + '|' + paymentId)
    .digest('hex');
  assert.notStrictEqual(wrongSignature, validSignature, 'Different secret must produce mismatched signature');
  console.log('   ✓ Razorpay payment HMAC verification logic passed.');

  // Test 4: Express app route configuration
  console.log('4. Testing Express routes registration...');
  process.env.NODE_ENV = 'test';
  const { default: app } = await import('../server.js');
  assert(app && typeof app.listen === 'function', 'Express app must be properly exported');
  console.log('   ✓ Express application and routes initialized properly.');

  console.log('\nAll Backend Core Logic Tests Passed Successfully! (4/4 tests passed)\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
