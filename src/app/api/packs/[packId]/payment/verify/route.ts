import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { getCustomerPack, saveCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';

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
    const body = await req.json();
    const { orderId, paymentId, signature, plan = 'single' } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required transaction identifiers (orderId, paymentId).' },
        { status: 400 }
      );
    }

    // In production, require a real key secret. Fail safely if not configured.
    const isProd = process.env.NODE_ENV === 'production';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (isProd && (!keySecret || keySecret.length < 8)) {
      return NextResponse.json(
        { error: 'Production payment credentials are not configured. Safe failure triggered.' },
        { status: 500 }
      );
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature || '');

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature could not be verified. No charge assumed.' },
        { status: 400 }
      );
    }

    pack.isPaid = true;
    pack.paymentId = paymentId;
    pack.paymentPlan = plan;
    pack.paidAt = new Date().toISOString();

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Submission pack unlocked.',
      packId: pack.id,
      isPaid: true
    });
  } catch (err: any) {
    console.error('Verify pack payment error:', err);
    return NextResponse.json({ error: err?.message || 'Payment verification failed.' }, { status: 500 });
  }
}