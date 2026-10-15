import Razorpay from 'razorpay';

export function getPaymentGateway() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Warning: Razorpay credentials are missing in environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}
