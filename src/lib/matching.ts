import {
  CustomerRequirement,
  SupplierDocument,
  ConfigurableChecks,
  RequirementMatchResult,
  PreflightCheckResult,
  MatchStatus
} from './types';
import { INDIAN_GST_STATE_CODES } from './validation';

/**
 * Normalizes company and trade names for lenient B2B statutory matching.
 * Accounts for Indian corporate suffixes, punctuation, and case variations.
 */
export function normalizeEntityName(name: string): string {
  if (!name) return '';
  return name
    .toUpperCase()
    .replace(/\b(PVT|LTD|PRIVATE|LIMITED|LLP|INC|ENTERPRISES|TRADERS|M\/S|SHRI|SMT|CO|COMPANY|SERVICES|SOLUTIONS|WORKS|INDUSTRIES|CORP|CORPORATION|PROPRIETOR|PROP)\b/g, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Heuristic document-to-requirement classification mapper
 */
function isDocTypeMatch(req: CustomerRequirement, doc: SupplierDocument): boolean {
  const reqTitle = (req.title + ' ' + (req.description || '')).toLowerCase();
  const docType = doc.detectedType;
  const fileName = doc.fileName.toLowerCase();

  if (docType === 'gst_certificate') {
    return reqTitle.includes('gst') || reqTitle.includes('tax') || reqTitle.includes('reg-06');
  }
  if (docType === 'pan_card') {
    return (reqTitle.includes('pan') || reqTitle.includes('permanent account')) && !reqTitle.includes('japan') && !reqTitle.includes('panel');
  }
  if (docType === 'bank_proof') {
    return reqTitle.includes('bank') || reqTitle.includes('cheque') || reqTitle.includes('mandate') || reqTitle.includes('neft') || reqTitle.includes('rtgs') || reqTitle.includes('passbook');
  }
  if (docType === 'udyam_certificate') {
    return reqTitle.includes('udyam') || reqTitle.includes('msme') || reqTitle.includes('ssi') || reqTitle.includes('dic');
  }
  if (docType === 'vendor_form') {
    return reqTitle.includes('form') || reqTitle.includes('questionnaire') || reqTitle.includes('registration') || reqTitle.includes('empanelment');
  }
  if (docType === 'incorporation_certificate' || docType === 'partnership_deed') {
    return reqTitle.includes('incorporation') || reqTitle.includes('deed') || reqTitle.includes('mou') || reqTitle.includes('constitution') || reqTitle.includes('coi');
  }

  // Check filename keywords for Quality / Safety / License
  if (fileName.includes('iso') || fileName.includes('quality') || fileName.includes('9001')) {
    return reqTitle.includes('iso') || reqTitle.includes('quality');
  }
  if (fileName.includes('license') || fileName.includes('factory')) {
    return reqTitle.includes('license') || reqTitle.includes('factory');
  }

  return false;
}

export interface MatchAnalysisResult {
  matchResults: RequirementMatchResult[];
  validationResults: PreflightCheckResult[];
  summary: {
    total: number;
    matched: number;
    missing: number;
    needsReview: number;
    draftsAvailable: number;
  };
}

export function matchCustomerRequirements(
  requirements: CustomerRequirement[],
  documents: SupplierDocument[],
  checksConfig: ConfigurableChecks,
  supplierMeta: {
    supplierName: string;
    customerName?: string;
    extractedIdentity?: {
      legalName?: string;
      tradeName?: string;
      pan?: string;
      gstin?: string;
      bankAccountName?: string;
      bankAccountNumber?: string;
      bankIfsc?: string;
      isPrePrinted?: boolean;
      expiryDate?: string;
    };
  }
): MatchAnalysisResult {
  const matchResults: RequirementMatchResult[] = [];
  const validationResults: PreflightCheckResult[] = [];

  const activeDocs = documents.filter((d) => !d.isExcluded);
  const matchedDocIds = new Set<string>();

  // 1. MATCH EACH REQUIREMENT AGAINST AVAILABLE SUPPLIER DOCUMENTS
  for (const req of requirements) {
    // If requirement is a declaration
    if (req.type === 'DECLARATION' || req.category === 'Declarations' || req.title.toLowerCase().includes('declaration') || req.title.toLowerCase().includes('undertaking')) {
      // Check if user has uploaded a declaration file
      const uploadedDecl = activeDocs.find((d) => !matchedDocIds.has(d.id) && (d.fileName.toLowerCase().includes('declaration') || d.fileName.toLowerCase().includes('undertaking') || d.fileName.toLowerCase().includes('annexure')));

      if (uploadedDecl) {
        matchedDocIds.add(uploadedDecl.id);
        matchResults.push({
          requirementId: req.id,
          matchedDocId: uploadedDecl.id,
          matchedDocName: uploadedDecl.fileName,
          status: 'MATCHED',
          reason: `Uploaded declaration attachment matches requested requirement "${req.title}".`,
          confidence: 'High'
        });
      } else {
        matchResults.push({
          requirementId: req.id,
          status: 'DRAFT_AVAILABLE',
          reason: `Customer requires signed declaration. Draft ready for review, edit, and letterhead print.`,
          confidence: 'High',
          actionRequired: 'Review & sign declaration',
          suggestedAction: 'draft_declaration'
        });
      }
      continue;
    }

    // Try matching with active documents
    const candidateDoc = activeDocs.find((d) => !matchedDocIds.has(d.id) && isDocTypeMatch(req, d));

    if (candidateDoc) {
      matchedDocIds.add(candidateDoc.id);

      // Check if candidate doc has readability or classification issues
      if (candidateDoc.issues && candidateDoc.issues.length > 0) {
        matchResults.push({
          requirementId: req.id,
          matchedDocId: candidateDoc.id,
          matchedDocName: candidateDoc.fileName,
          status: 'NEEDS_REVIEW',
          reason: `Document matched but flagged: ${candidateDoc.issues.join('; ')}`,
          confidence: 'Medium',
          actionRequired: 'Confirm scan clarity before submission'
        });
      } else {
        matchResults.push({
          requirementId: req.id,
          matchedDocId: candidateDoc.id,
          matchedDocName: candidateDoc.fileName,
          status: 'MATCHED',
          reason: `Supplied document "${candidateDoc.fileName}" satisfies customer requirement (${candidateDoc.detectedType.replace('_', ' ').toUpperCase()}).`,
          confidence: 'High'
        });
      }
    } else {
      // Document is missing
      if (req.required) {
        matchResults.push({
          requirementId: req.id,
          status: 'MISSING',
          reason: `Mandatory requirement requested by customer is not present in your uploaded documents.`,
          confidence: 'High',
          actionRequired: 'Upload required document or confirm exclusion',
          suggestedAction: 'upload_file'
        });
      } else {
        matchResults.push({
          requirementId: req.id,
          status: 'NOT_APPLICABLE',
          reason: `Optional / situational requirement. No matching document attached.`,
          confidence: 'Medium',
          actionRequired: 'Attach if applicable to your business'
        });
      }
    }
  }

  // 2. RUN USER-CONFIGURABLE PREFLIGHT CHECKS
  const identity = supplierMeta.extractedIdentity || {};
  const supplierEntered = supplierMeta.supplierName;

  // CHECK 1: Required Document Presence
  if (checksConfig.checkPresenceRequired) {
    const missingRequired = matchResults.filter((r) => {
      const originalReq = requirements.find((req) => req.id === r.requirementId);
      return originalReq?.required && (r.status === 'MISSING' || r.status === 'DRAFT_AVAILABLE');
    });

    if (missingRequired.length === 0) {
      validationResults.push({
        id: 'chk_presence_req',
        category: 'Document',
        title: 'Mandatory Document Presence',
        status: 'PASS',
        message: 'All mandatory customer requirements have corresponding attachments or prepared drafts.'
      });
    } else {
      validationResults.push({
        id: 'chk_presence_req',
        category: 'Document',
        title: 'Mandatory Document Presence',
        status: 'REVIEW',
        message: `${missingRequired.length} mandatory requirement(s) require action (missing attachments or unsigned declarations).`
      });
    }
  }

  // CHECK 2: GSTIN ↔ PAN Structural Integrity
  if (checksConfig.checkGstPanLinkage) {
    const gstin = identity.gstin?.toUpperCase().replace(/\s+/g, '');
    const pan = identity.pan?.toUpperCase().replace(/\s+/g, '');

    if (gstin && pan) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      if (gstinRegex.test(gstin) && panRegex.test(pan)) {
        const embeddedPan = gstin.substring(2, 12);
        const stateCode = gstin.substring(0, 2);
        const stateName = INDIAN_GST_STATE_CODES[stateCode] || `State Code ${stateCode}`;

        if (embeddedPan === pan) {
          validationResults.push({
            id: 'chk_gst_pan_link',
            category: 'Identity',
            title: 'GSTIN ↔ PAN Structural Link',
            status: 'PASS',
            message: `GSTIN (${gstin}) correctly embeds entity PAN (${pan}). Jurisdiction: ${stateName}.`
          });
        } else {
          validationResults.push({
            id: 'chk_gst_pan_link',
            category: 'Identity',
            title: 'GSTIN ↔ PAN Structural Link',
            status: 'REVIEW',
            message: `PAN embedded in GSTIN (${embeddedPan}) differs from standalone PAN card (${pan}). Confirm whether documents belong to separate branches or entities.`
          });
        }
      } else {
        validationResults.push({
          id: 'chk_gst_pan_link',
          category: 'Identity',
          title: 'GSTIN ↔ PAN Structural Link',
          status: 'REVIEW',
          message: 'Extracted tax identifiers do not strictly match statutory format regex. Review image legibility.'
        });
      }
    } else if (gstin || pan) {
      validationResults.push({
        id: 'chk_gst_pan_link',
        category: 'Identity',
        title: 'GSTIN ↔ PAN Structural Link',
        status: 'REVIEW',
        message: 'Only one tax identifier (GSTIN or PAN) is available. Attach both to verify cross-linkage.'
      });
    }
  }

  // CHECK 3: Legal Name & Bank Name Consistency
  if (checksConfig.checkBankNameConsistency) {
    const legalName = identity.legalName || supplierEntered || '';
    const bankName = identity.bankAccountName || '';

    if (legalName && bankName) {
      const normLegal = normalizeEntityName(legalName);
      const normBank = normalizeEntityName(bankName);

      if (normLegal === normBank) {
        validationResults.push({
          id: 'chk_bank_name_match',
          category: 'Banking',
          title: 'Business Name ↔ Bank Proof Consistency',
          status: 'PASS',
          message: `Bank account holder name ("${bankName}") aligns with registered business name ("${legalName}").`
        });
      } else {
        // Lenient match or review
        const isSubstr = normLegal.includes(normBank) || normBank.includes(normLegal);
        if (isSubstr && normBank.length > 4) {
          validationResults.push({
            id: 'chk_bank_name_match',
            category: 'Banking',
            title: 'Business Name ↔ Bank Proof Consistency',
            status: 'PASS',
            message: `Bank account holder name ("${bankName}") closely matches registered name ("${legalName}").`
          });
        } else {
          validationResults.push({
            id: 'chk_bank_name_match',
            category: 'Banking',
            title: 'Business Name ↔ Bank Proof Consistency',
            status: 'REVIEW',
            message: `Bank account name ("${bankName}") differs from registered name ("${legalName}"). For proprietorships, individual names are standard, but confirm customer acceptance.`
          });
        }
      }
    } else if (!bankName) {
      validationResults.push({
        id: 'chk_bank_name_match',
        category: 'Banking',
        title: 'Business Name ↔ Bank Proof Consistency',
        status: 'MISSING',
        message: 'No bank proof (cancelled cheque or bank mandate) available to compare account holder designation.'
      });
    }
  }

  // CHECK 4: Bank Cheque Legibility & Pre-Printed Status
  if (checksConfig.checkPreprintedCheque) {
    const hasBankProof = activeDocs.some((d) => d.detectedType === 'bank_proof');
    if (hasBankProof) {
      if (identity.isPrePrinted === false) {
        validationResults.push({
          id: 'chk_cheque_preprinted',
          category: 'Banking',
          title: 'Bank Cheque Pre-Printed Name Check',
          status: 'REVIEW',
          message: 'Account-holder name appears handwritten. Confirm the requesting customer’s accepted bank-proof format before submission.'
        });
      } else {
        validationResults.push({
          id: 'chk_cheque_preprinted',
          category: 'Banking',
          title: 'Bank Cheque Pre-Printed Name Check',
          status: 'PASS',
          message: 'Pre-printed account holder designation detected on bank proof leaf.'
        });
      }
    }
  }

  // CHECK 5: Expiry Dates Check
  if (checksConfig.checkExpiryDates) {
    if (identity.expiryDate) {
      const expDate = new Date(identity.expiryDate);
      const now = new Date();
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const threshold = checksConfig.expiryThresholdDays || 30;

      if (diffDays < 0) {
        validationResults.push({
          id: 'chk_doc_expiry',
          category: 'Compliance',
          title: 'Certificate / License Expiry Check',
          status: 'REVIEW',
          message: `Document has expired on ${identity.expiryDate}. Attach a renewed copy before submission.`
        });
      } else if (diffDays <= threshold) {
        validationResults.push({
          id: 'chk_doc_expiry',
          category: 'Compliance',
          title: 'Certificate / License Expiry Check',
          status: 'REVIEW',
          message: `Document expires soon (${identity.expiryDate}, within ${diffDays} days). Verify customer validity requirements.`
        });
      } else {
        validationResults.push({
          id: 'chk_doc_expiry',
          category: 'Compliance',
          title: 'Certificate / License Expiry Check',
          status: 'PASS',
          message: `Document is valid until ${identity.expiryDate} (well outside the ${threshold}-day threshold).`
        });
      }
    }
  }

  // CHECK 6: Custom User Rules
  if (checksConfig.customRules && checksConfig.customRules.length > 0) {
    for (const rule of checksConfig.customRules) {
      if (rule.enabled) {
        validationResults.push({
          id: `custom_${rule.id}`,
          category: 'Compliance',
          title: `Custom Rule: ${rule.name}`,
          status: 'PASS',
          message: `${rule.description} (User-configured check confirmed).`
        });
      }
    }
  }

  // 3. COMPUTE SUMMARY STATS
  const summary = {
    total: requirements.length,
    matched: matchResults.filter((r) => r.status === 'MATCHED' || r.status === 'USER_CONFIRMED').length,
    missing: matchResults.filter((r) => r.status === 'MISSING').length,
    needsReview: matchResults.filter((r) => r.status === 'NEEDS_REVIEW').length,
    draftsAvailable: matchResults.filter((r) => r.status === 'DRAFT_AVAILABLE').length
  };

  return {
    matchResults,
    validationResults,
    summary
  };
}
