import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPack, saveCustomerPack, purgeCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';
import { matchCustomerRequirements } from '@/lib/matching';

export const maxDuration = 60;

function extractToken(req: NextRequest): string | undefined {
  const authHeader = req.headers.get('x-access-token') || req.headers.get('authorization')?.replace('Bearer ', '');
  const urlToken = req.nextUrl.searchParams.get('token');
  return authHeader || urlToken || undefined;
}

export async function GET(req: NextRequest, { params }: { params: { packId: string } }) {
  const { packId } = params;
  const token = extractToken(req);

  const pack = await getCustomerPack(packId);
  if (!pack || pack.isPurged) {
    return NextResponse.json({ error: 'Customer pack not found or has expired.' }, { status: 404 });
  }

  const isAuthorized = await verifyCustomerPackAccess(packId, token);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized access to customer pack.' }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    pack
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { packId: string } }) {
  const { packId } = params;
  const token = extractToken(req);

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

    if (body.supplierName !== undefined) pack.supplierName = body.supplierName.trim();
    if (body.customerName !== undefined) pack.customerName = body.customerName.trim();
    if (body.submissionRef !== undefined) pack.submissionRef = body.submissionRef.trim();
    if (body.deadline !== undefined) pack.deadline = body.deadline.trim();
    if (body.requirements !== undefined) pack.requirements = body.requirements;
    if (body.checksConfig !== undefined) pack.checksConfig = body.checksConfig;
    if (body.finalOrder !== undefined) pack.finalOrder = body.finalOrder;

    // If requirements or checksConfig changed, re-run matching
    const matchAnalysis = matchCustomerRequirements(
      pack.requirements,
      pack.supplierDocuments,
      pack.checksConfig,
      {
        supplierName: pack.supplierName,
        customerName: pack.customerName,
        extractedIdentity: pack.extractedIdentity
      }
    );

    pack.matchResults = matchAnalysis.matchResults;
    pack.validationResults = matchAnalysis.validationResults;
    pack.summary = matchAnalysis.summary;

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      pack
    });
  } catch (err: any) {
    console.error('Update customer pack error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update pack.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { packId: string } }) {
  const { packId } = params;
  const token = extractToken(req);

  const isAuthorized = await verifyCustomerPackAccess(packId, token);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized access to customer pack.' }, { status: 403 });
  }

  const success = await purgeCustomerPack(packId);
  if (success) {
    return NextResponse.json({
      success: true,
      message: 'All customer pack files, extracted data, and preflight records permanently purged.'
    });
  } else {
    return NextResponse.json({ error: 'Failed to purge customer pack.' }, { status: 500 });
  }
}