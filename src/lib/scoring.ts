import { AggregatedExtractedData, PreflightCheckResult, ScoringBreakdown } from './types';

/**
 * Transparent, deterministic Readiness Scoring Engine
 * Never estimated by an LLM guess; calculated via explicit weighted components.
 */
export function calculateReadinessScore(
  data: AggregatedExtractedData,
  validationResults: PreflightCheckResult[]
): ScoringBreakdown {
  // 1. Statutory Document Completeness (Max 40 pts)
  let completenessScore = 0;
  const docTypes = new Set(data.documents.map((d) => d.type));

  if (docTypes.has('gst_certificate') || data.gstin) {
    completenessScore += 15;
  }
  if (docTypes.has('pan_card') || data.pan) {
    completenessScore += 10;
  }
  if (docTypes.has('bank_proof') || data.bankAccountName || data.bankAccountNumber) {
    completenessScore += 10;
  }
  if (
    docTypes.has('udyam_certificate') ||
    docTypes.has('incorporation_certificate') ||
    docTypes.has('partnership_deed') ||
    data.udyamNumber
  ) {
    completenessScore += 5;
  }

  // 2. Identity & Tax Consistency (Max 30 pts)
  let consistencyScore = 0;
  const gstinCheck = validationResults.find((r) => r.id === 'gstin_pan_match');
  if (gstinCheck?.status === 'PASS') {
    consistencyScore += 15;
  } else if (gstinCheck?.status === 'REVIEW') {
    consistencyScore += 8;
  }

  const nameCheck = validationResults.find((r) => r.id === 'name_bank_match');
  if (nameCheck?.status === 'PASS') {
    consistencyScore += 15;
  } else if (nameCheck?.status === 'REVIEW') {
    consistencyScore += 8;
  }

  // 3. Banking Proof Clarity (Max 20 pts)
  let bankingScore = 0;
  const ifscCheck = validationResults.find((r) => r.id === 'ifsc_format');
  if (ifscCheck?.status === 'PASS') {
    bankingScore += 10;
  } else if (ifscCheck?.status === 'REVIEW') {
    bankingScore += 4;
  }

  const preprintedCheck = validationResults.find((r) => r.id === 'cheque_preprinted');
  if (preprintedCheck?.status === 'PASS') {
    bankingScore += 10;
  } else if (preprintedCheck?.status === 'REVIEW') {
    bankingScore += 5;
  } else if (docTypes.has('bank_proof') && data.bankAccountNumber) {
    bankingScore += 8;
  }

  // 4. OCR & Scan Quality (Max 10 pts)
  let ocrQualityScore = 5;
  if (data.documents.length > 0) {
    const avgConfidence =
      data.documents.reduce((acc, d) => acc + (d.confidence || 0.8), 0) / data.documents.length;
    if (avgConfidence >= 0.85) {
      ocrQualityScore = 10;
    } else if (avgConfidence >= 0.65) {
      ocrQualityScore = 7;
    } else {
      ocrQualityScore = 4;
    }
  }

  const totalScore = Math.min(
    100,
    Math.max(0, completenessScore + consistencyScore + bankingScore + ocrQualityScore)
  );

  let scoreBand: ScoringBreakdown['scoreBand'] = 'Submission-Ready';
  let scoreSummary = 'High consistency across all primary statutory proofs.';

  if (totalScore < 65) {
    scoreBand = 'Action Required';
    scoreSummary = 'Critical documents missing or primary tax identifiers need review.';
  } else if (totalScore < 85) {
    scoreBand = 'Review Advised';
    scoreSummary = 'Minor naming variations or optional proofs need human confirmation.';
  }

  return {
    completenessScore,
    consistencyScore,
    bankingScore,
    ocrQualityScore,
    totalScore,
    scoreBand,
    scoreSummary
  };
}
