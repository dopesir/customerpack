import { NextRequest, NextResponse } from 'next/server';
import { getCustomerPack, saveCustomerPack, verifyCustomerPackAccess } from '@/lib/storage';
import { matchCustomerRequirements } from '@/lib/matching';

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
      // Body may be empty if simple re-check
    }

    if (body.checksConfig) {
      pack.checksConfig = body.checksConfig;
    }

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

    // Calculate transparent readiness score: 0 to 100
    const totalReqs = pack.requirements.length || 1;
    const matchedCount = matchAnalysis.summary.matched;
    const missingCount = matchAnalysis.summary.missing;
    const reviewCount = matchAnalysis.summary.needsReview;

    // Base: percentage of requirements matched (max 70 pts)
    const matchRatio = matchedCount / totalReqs;
    const baseScore = Math.round(matchRatio * 70);

    // Checks bonus/deductions (max 30 pts)
    let checksScore = 30;
    const passChecks = pack.validationResults.filter((r) => r.status === 'PASS').length;
    const totalChecks = pack.validationResults.length || 1;
    checksScore = Math.round((passChecks / totalChecks) * 30);

    pack.readinessScore = Math.min(100, Math.max(0, baseScore + checksScore));

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      pack,
      matchResults: pack.matchResults,
      validationResults: pack.validationResults,
      summary: pack.summary,
      readinessScore: pack.readinessScore
    });
  } catch (err: any) {
    console.error('Preflight check error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to run preflight check.' }, { status: 500 });
  }
}