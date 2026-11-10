import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';
import {
  generateCustomerPackPreflightReportPdf,
  generateCustomerPackSubmissionDossierPdf
} from '@/lib/pdf-builder';

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
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body may be empty
    }

    const type = body.type || 'preflight_report';
    // Watermark if not paid or if preview explicitly requested
    const isWatermarked = body.preview === true || !pack.isPaid;

    let pdfBytes: Uint8Array;
    let fileName = '';

    if (type === 'submission_dossier') {
      pdfBytes = await generateCustomerPackSubmissionDossierPdf(pack, isWatermarked);
      fileName = `Customer_Pack_Submission_Dossier_${pack.supplierName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    } else {
      pdfBytes = await generateCustomerPackPreflightReportPdf(pack, isWatermarked);
      fileName = `Customer_Pack_Preflight_Report_${pack.supplierName.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err: any) {
    console.error('PDF build error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate PDF.' }, { status: 500 });
  }
}