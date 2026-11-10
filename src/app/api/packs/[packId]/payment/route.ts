import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, generateUpiPaymentString } from '@/lib/razorpay';
import { getCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';

export async function POST(req: NextRequest, { params }: { params: { packId: string } }) {
  const { packId } = params;
  const authHeader = req.headers.get('x-access-token') || req.headers.get('authorization')?.replace('Bearer ', '');
  const urlToken = req.nextUrl.searchParams.get('token');
  const token = authHeader || urlToken || undefined;

  const pack = await getCustomerPack(packId);
  if (!pack || pack.isPurged) {
    return NextResponse.json({ error: 'Customer pack not found or has expired.' }, { status: 404 });
  }

  const isAuthorized = await verifyCustomerPackAccess(packId, token);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized access to customer pack.' }, { status: 403 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty
    }

    const plan = body.plan === 'five_pack' ? 'five_pack' : 'single';
    const priceSingle = parseInt(process.env.NEXT_PUBLIC_PRICE_SINGLE || '299', 10);
    const priceFivePack = parseInt(process.env.NEXT_PUBLIC_PRICE_FIVE_PACK || '799', 10);
    const amountInInr = plan === 'five_pack' ? priceFivePack : priceSingle;

    const order = await createRazorpayOrder(amountInInr, packId, plan);
    const upiPaymentString = generateUpiPaymentString(amountInInr, packId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      amountInInr,
      plan,
      isDemoMode: order.isDemoMode,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo',
      upiPaymentString
    });
  } catch (err: any) {
    console.error('Initialize pack payment error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to initialize payment.' }, { status: 500 });
  }
}