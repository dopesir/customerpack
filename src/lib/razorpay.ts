import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && !keyId.includes('rzp_test_placeholder') && keySecret.length > 5) {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return null;
}

export async function createRazorpayOrder(
  amountInInr: number,
  packetId: string,
  plan: 'single' | 'five_pack' = 'single'
) {
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    // Generate simulated order for local dev / demo testing
    return {
      id: `order_mock_${Math.random().toString(36).substring(2, 10)}`,
      amount: amountInInr * 100,
      currency: 'INR',
      receipt: `rcpt_${packetId.substring(0, 8)}`,
      status: 'created',
      isDemoMode: true
    };
  }

  const options = {
    amount: amountInInr * 100, // paise
    currency: 'INR',
    receipt: `rcpt_${packetId.substring(0, 8)}`,
    notes: {
      packetId,
      plan
    }
  };

  const order = await razorpay.orders.create(options);
  return {
    ...order,
    isDemoMode: false
  };
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    // If order was a mock demo order, verify format
    if (orderId.startsWith('order_mock_') && (signature === 'demo_verified_sig' || paymentId.startsWith('pay_demo_'))) {
      return true;
    }
    return false;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

export function generateUpiPaymentString(amount: number, packetId: string): string {
  const pa = 'vendorpack@upi';
  const pn = 'VendorPack';
  const tn = `Pack_${packetId.substring(0, 8)}`;
  return `upi://pay?pa=${pa}&pn=${encodeURIComponent(pn)}&am=${amount}&cu=INR&tn=${encodeURIComponent(tn)}`;
}
