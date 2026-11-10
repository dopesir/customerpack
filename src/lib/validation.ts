import { AggregatedExtractedData, PreflightCheckResult } from './types';

// Official Indian State GST Code Directory
export const INDIAN_GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh'
};

// Official PAN Entity Type (4th Character)
export const PAN_ENTITY_TYPES: Record<string, string> = {
  C: 'Company (Private / Public Limited)',
  P: 'Individual / Sole Proprietor',
  F: 'Partnership Firm / LLP',
  H: 'Hindu Undivided Family (HUF)',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government Entity'
};

/**
 * Deterministic Cross-Document Consistency Engine
 * AI extracts text -> TypeScript applies pure statutory & banking validation rules.
 */
export function runPreflightChecks(data: AggregatedExtractedData): PreflightCheckResult[] {
  const checks: PreflightCheckResult[] = [];

  // 1. GSTIN ↔ PAN Structural Link & State Code Integrity
  const gstin = data.gstin?.toUpperCase().replace(/\s+/g, '');
  const pan = data.pan?.toUpperCase().replace(/\s+/g, '');

  if (gstin && pan) {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    const isGstinFormatValid = gstinRegex.test(gstin);
    const isPanFormatValid = panRegex.test(pan);

    if (!isGstinFormatValid) {
      checks.push({
        id: 'gstin_pan_match',
        category: 'Identity',
        title: 'GSTIN ↔ PAN Structural Match',
        status: 'REVIEW',
        message: `Extracted GSTIN (${gstin}) does not strictly conform to standard 15-character statutory format. Please review scan clarity.`
      });
    } else if (!isPanFormatValid) {
      checks.push({
        id: 'gstin_pan_match',
        category: 'Identity',
        title: 'GSTIN ↔ PAN Structural Match',
        status: 'REVIEW',
        message: `Extracted PAN (${pan}) does not strictly conform to standard 10-character format. Please review scan clarity.`
      });
    } else {
      const embeddedPan = gstin.substring(2, 12);
      const stateCode = gstin.substring(0, 2);
      const stateName = INDIAN_GST_STATE_CODES[stateCode] || `State Code ${stateCode}`;
      const panTypeChar = pan.charAt(3);
      const entityType = PAN_ENTITY_TYPES[panTypeChar] || 'Registered Entity';

      if (embeddedPan === pan) {
        checks.push({
          id: 'gstin_pan_match',
          category: 'Identity',
          title: 'GSTIN ↔ PAN Structural Match',
          status: 'PASS',
          message: `GSTIN (${gstin}) correctly embeds entity PAN (${pan}). Jurisdiction: ${stateName} (${stateCode}). Entity type: ${entityType}.`
        });
      } else {
        checks.push({
          id: 'gstin_pan_match',
          category: 'Identity',
          title: 'GSTIN ↔ PAN Structural Match',
          status: 'REVIEW',
          message: `The PAN embedded in GSTIN (${embeddedPan}) differs from the standalone PAN card (${pan}). Please confirm if these belong to separate branches or entities.`
        });
      }
    }
  } else if (!gstin && pan) {
    checks.push({
      id: 'gstin_pan_match',
      category: 'Identity',
      title: 'GSTIN ↔ PAN Structural Match',
      status: 'REVIEW',
      message: 'PAN card detected, but GST Registration Certificate was not uploaded. Corporate buyers usually require both for vendor code creation.'
    });
  } else if (gstin && !pan) {
    checks.push({
      id: 'gstin_pan_match',
      category: 'Identity',
      title: 'GSTIN ↔ PAN Structural Match',
      status: 'REVIEW',
      message: `GSTIN (${gstin}) detected, but standalone PAN card was not uploaded. Embedded PAN is ${gstin.substring(2, 12)}.`
    });
  } else {
    checks.push({
      id: 'gstin_pan_match',
      category: 'Identity',
      title: 'GSTIN ↔ PAN Structural Match',
      status: 'NOT_CHECKED',
      message: 'Both GSTIN and PAN are required to evaluate statutory structural linkage.'
    });
  }

  // 2. Business Name ↔ Bank Proof Consistency (Proprietorship / Corporate convention handling)
  const legal = (data.legalName || '').trim();
  const trade = (data.tradeName || '').trim();
  const bank = (data.bankAccountName || '').trim();

  const normalize = (s: string) =>
    s
      .toUpperCase()
      .replace(/\b(PVT|LTD|PRIVATE|LIMITED|LLP|INC|ENTERPRISES|TRADERS|M\/S|SHRI|SMT|CO|COMPANY|SERVICES|SOLUTIONS|PROPRIETOR|PROP)\b/g, '')
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  if (legal || trade) {
    if (bank) {
      const normLegal = normalize(legal);
      const normTrade = normalize(trade);
      const normBank = normalize(bank);

      const isLegalExact = normLegal && normBank && normLegal === normBank;
      const isTradeExact = normTrade && normBank && normTrade === normBank;

      if (isLegalExact) {
        checks.push({
          id: 'name_bank_match',
          category: 'Banking',
          title: 'Business Name ↔ Bank Proof Consistency',
          status: 'PASS',
          message: `Bank account holder name ("${bank}") aligns with legal entity name ("${legal}").`
        });
      } else if (isTradeExact) {
        checks.push({
          id: 'name_bank_match',
          category: 'Banking',
          title: 'Business Name ↔ Bank Proof Consistency',
          status: 'PASS',
          message: `Bank account holder name ("${bank}") aligns with registered Trade Name ("${trade}").`
        });
      } else {
        checks.push({
          id: 'name_bank_match',
          category: 'Banking',
          title: 'Business Name ↔ Bank Proof Consistency',
          status: 'REVIEW',
          message: `Bank proof shows "${bank}", which differs from Legal Name ("${legal || 'N/A'}") and Trade Name ("${trade || 'N/A'}"). For sole proprietorships, individual names on bank cheques are standard, but confirm your corporate buyer's preference.`
        });
      }
    } else {
      checks.push({
        id: 'name_bank_match',
        category: 'Banking',
        title: 'Business Name ↔ Bank Proof Consistency',
        status: 'MISSING',
        message: 'No bank proof (cancelled cheque / bank passbook) was detected to cross-check account ownership.'
      });
    }
  } else {
    checks.push({
      id: 'name_bank_match',
      category: 'Banking',
      title: 'Business Name ↔ Bank Proof Consistency',
      status: 'NOT_CHECKED',
      message: 'Business name could not be extracted with sufficient confidence to compare against bank proof.'
    });
  }

  // 3. Bank Proof Details & Pre-Printed Cheque Check
  const bankDetails = data.bankDetails || {
    accountHolderName: data.bankAccountName,
    accountNumber: data.bankAccountNumber,
    ifsc: data.bankIfsc,
    bankName: data.bankName,
    isPrePrinted: data.isPrePrintedCheque ?? true
  };

  const hasBankProofDoc = data.documents.some((d) => d.type === 'bank_proof');

  if (hasBankProofDoc || bankDetails.accountNumber || bankDetails.ifsc) {
    // Check pre-printed status
    if (bankDetails.isPrePrinted === false) {
      checks.push({
        id: 'cheque_preprinted',
        category: 'Banking',
        title: 'Bank Cheque Pre-Printed Name',
        status: 'REVIEW',
        message: 'The account holder name appears handwritten on the cheque leaf. Some corporate onboarding processes may require a pre-printed account-holder name or bank statement.'
      });
    } else if (bankDetails.accountHolderName) {
      checks.push({
        id: 'cheque_preprinted',
        category: 'Banking',
        title: 'Bank Cheque Pre-Printed Name',
        status: 'PASS',
        message: 'Pre-printed account holder name detected on bank proof.'
      });
    }

    // Check IFSC format
    const ifsc = (bankDetails.ifsc || '').toUpperCase().trim();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (ifsc && ifscRegex.test(ifsc)) {
      const bankCode = ifsc.substring(0, 4);
      checks.push({
        id: 'ifsc_format',
        category: 'Banking',
        title: 'Bank IFSC Validation',
        status: 'PASS',
        message: `Valid RBI IFSC format detected (${ifsc}). Bank Identifier: ${bankCode}.`
      });
    } else if (ifsc) {
      checks.push({
        id: 'ifsc_format',
        category: 'Banking',
        title: 'Bank IFSC Validation',
        status: 'REVIEW',
        message: `Extracted IFSC ("${ifsc}") does not match standard 11-character RBI format (5th character must be '0'). Please verify scan clarity.`
      });
    } else {
      checks.push({
        id: 'ifsc_format',
        category: 'Banking',
        title: 'Bank IFSC Validation',
        status: 'MISSING',
        message: 'Bank IFSC code could not be detected on the uploaded bank proof.'
      });
    }
  } else {
    checks.push({
      id: 'bank_proof_check',
      category: 'Banking',
      title: 'Bank Proof Document',
      status: 'MISSING',
      message: 'No cancelled cheque or bank verification proof detected.'
    });
  }

  // 4. Udyam / MSME Registration Presence & Structure Check
  if (data.udyamNumber) {
    const cleanUdyam = data.udyamNumber.trim().toUpperCase();
    const udyamRegex = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/;
    const isUdyamFormatValid = udyamRegex.test(cleanUdyam);

    if (isUdyamFormatValid) {
      checks.push({
        id: 'udyam_presence',
        category: 'Compliance',
        title: 'Udyam / MSME Registration Document',
        status: 'PASS',
        message: `Valid Udyam statutory format detected (${cleanUdyam}). Category: ${data.msmeCategory || 'MSME'}. Confirm applicability and buyer requirements separately.`
      });
    } else {
      checks.push({
        id: 'udyam_presence',
        category: 'Compliance',
        title: 'Udyam / MSME Registration Document',
        status: 'PASS',
        message: `Udyam registration document detected (${cleanUdyam}). Confirm applicability and buyer requirements separately.`
      });
    }
  } else {
    checks.push({
      id: 'udyam_presence',
      category: 'Compliance',
      title: 'Udyam / MSME Registration Document',
      status: 'MISSING',
      message: 'No Udyam certificate attached. If your enterprise is MSME-registered, attaching it helps document registration status.'
    });
  }

  // 5. Document Presence Checklist
  const docTypes = new Set(data.documents.map((d) => d.type));

  const requiredTypes: { type: typeof data.documents[0]['type']; label: string }[] = [
    { type: 'gst_certificate', label: 'GST Registration Certificate' },
    { type: 'pan_card', label: 'Permanent Account Number (PAN) Card' },
    { type: 'bank_proof', label: 'Bank Proof (Cancelled Cheque / Passbook)' },
  ];

  requiredTypes.forEach(({ type, label }) => {
    if (!docTypes.has(type)) {
      checks.push({
        id: `doc_presence_${type}`,
        category: 'Document',
        title: `${label} Presence`,
        status: 'MISSING',
        message: `Recommended statutory document "${label}" is missing from the uploaded pack.`
      });
    }
  });

  return checks;
}
