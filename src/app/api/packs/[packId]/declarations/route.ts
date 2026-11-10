import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPack, saveCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';
import { draftDeclaration } from '@/lib/declarations';

export const maxDuration = 60;

function extractToken(req: NextRequest): string | undefined {
  const authHeader = req.headers.get('x-access-token') || req.headers.get('authorization')?.replace('Bearer ', '');
  const urlToken = req.nextUrl.searchParams.get('token');
  return authHeader || urlToken || undefined;
}

export async function POST(req: NextRequest, { params }: { params: { packId: string } }) {
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
    const { templateKey = 'debarment', requirementId, variables = {} } = body;

    const mergedVars = {
      supplierName: variables.supplierName || pack.supplierName,
      customerName: variables.customerName || pack.customerName,
      address: variables.address || '',
      signatoryName: variables.signatoryName || '',
      signatoryTitle: variables.signatoryTitle || 'Proprietor / Authorized Signatory',
      date: variables.date || new Date().toISOString().split('T')[0],
      pan: variables.pan || pack.extractedIdentity?.pan || '',
      gstin: variables.gstin || pack.extractedIdentity?.gstin || ''
    };

    const declaration = draftDeclaration(templateKey, requirementId || 'req_debarment', mergedVars);

    // Remove any previous draft for the same requirement
    pack.declarations = pack.declarations.filter((d) => d.requirementId !== requirementId);
    pack.declarations.push(declaration);

    // Update match result for this requirement
    if (requirementId) {
      const matchIdx = pack.matchResults.findIndex((r) => r.requirementId === requirementId);
      if (matchIdx !== -1) {
        pack.matchResults[matchIdx].status = 'MATCHED';
        pack.matchResults[matchIdx].reason = `Declaration draft prepared on company letterhead format. Ready for signing & inclusion.`;
        pack.matchResults[matchIdx].draftDeclarationId = declaration.id;
      }
    }

    // Update summary counts
    pack.summary.matched = pack.matchResults.filter((r) => r.status === 'MATCHED' || r.status === 'USER_CONFIRMED').length;
    pack.summary.draftsAvailable = pack.matchResults.filter((r) => r.status === 'DRAFT_AVAILABLE').length;

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      declaration,
      pack
    });
  } catch (err: any) {
    console.error('Draft declaration error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate declaration.' }, { status: 500 });
  }
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
    const { declarationId, text, title, isIncludedInPack } = body;

    const decl = pack.declarations.find((d) => d.id === declarationId);
    if (!decl) {
      return NextResponse.json({ error: 'Declaration draft not found.' }, { status: 404 });
    }

    if (text !== undefined) decl.text = text;
    if (title !== undefined) decl.title = title;
    if (isIncludedInPack !== undefined) decl.isIncludedInPack = isIncludedInPack;

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      declaration: decl,
      pack
    });
  } catch (err: any) {
    console.error('Update declaration error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update declaration.' }, { status: 500 });
  }
}