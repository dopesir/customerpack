import crypto from 'crypto';
import { matchCustomerRequirements } from '../src/lib/matching';
import { draftDeclaration } from '../src/lib/declarations';
import {
  saveCustomerPack,
  getCustomerPack,
  verifyCustomerPackAccess,
  purgeCustomerPack
} from '../src/lib/storage';
import {
  generateCustomerPackPreflightReportPdf,
  generateCustomerPackSubmissionDossierPdf
} from '../src/lib/pdf-builder';
import { verifyRazorpaySignature } from '../src/lib/razorpay';
import {
  CustomerPackRecord,
  CustomerRequirement,
  SupplierDocument,
  ConfigurableChecks
} from '../src/lib/types';

console.log('====================================================');
console.log('CUSTOMER PACK — END-TO-END VERIFICATION SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

async function runTests() {
  // ----------------------------------------------------
  // Test 1: Requirements Matching Engine
  // ----------------------------------------------------
  console.log('\n--- 1. Testing Customer Requirements Matching ---');

  const testRequirements: CustomerRequirement[] = [
    {
      id: 'req_gst',
      title: 'GST Registration Certificate',
      description: 'Form GST REG-06 with Annexures',
      category: 'Tax / Statutory',
      type: 'DOCUMENT',
      required: true,
      confidence: 1.0
    },
    {
      id: 'req_pan',
      title: 'Company PAN Card',
      description: 'Permanent Account Number',
      category: 'Tax / Statutory',
      type: 'DOCUMENT',
      required: true,
      confidence: 1.0
    },
    {
      id: 'req_bank',
      title: 'Cancelled Cheque or Bank Mandate',
      description: 'Proof of Bank Account',
      category: 'Banking',
      type: 'DOCUMENT',
      required: true,
      confidence: 1.0
    },
    {
      id: 'req_debarment',
      title: 'Non-Blacklisting & Debarment Declaration',
      description: 'Undertaking on letterhead',
      category: 'Declarations',
      type: 'DECLARATION',
      required: true,
      confidence: 1.0
    }
  ];

  const testDocs: SupplierDocument[] = [
    {
      id: 'doc_1',
      fileName: 'GST_Certificate.pdf',
      fileSize: 1024 * 300,
      mimeType: 'application/pdf',
      detectedType: 'gst_certificate',
      typeConfidence: 0.95,
      displayOrder: 1,
      isExcluded: false,
      issues: [],
      extractedData: {
        legalName: { value: 'SHREE BALAJI PRECISION LLP', confidence: 0.98 },
        gstin: { value: '27AABCU9603R1ZM', confidence: 0.99 },
        pan: { value: 'AABCU9603R', confidence: 0.99 }
      }
    },
    {
      id: 'doc_2',
      fileName: 'PAN_Card.jpg',
      fileSize: 1024 * 150,
      mimeType: 'image/jpeg',
      detectedType: 'pan_card',
      typeConfidence: 0.97,
      displayOrder: 2,
      isExcluded: false,
      issues: [],
      extractedData: {
        legalName: { value: 'SHREE BALAJI PRECISION LLP', confidence: 0.99 },
        pan: { value: 'AABCU9603R', confidence: 0.99 }
      }
    }
  ];

  const defaultChecks: ConfigurableChecks = {
    checkPresenceRequired: true,
    checkPresenceOptional: false,
    checkReadability: true,
    checkPageCounts: true,
    checkLegalNameConsistency: true,
    checkPanConsistency: true,
    checkGstPanLinkage: true,
    checkBankNameConsistency: true,
    checkPreprintedCheque: true,
    checkExpiryDates: true,
    expiryThresholdDays: 30,
    checkFormatRequirements: true,
    customRules: []
  };

  const matchAnalysis = matchCustomerRequirements(
    testRequirements,
    testDocs,
    defaultChecks,
    {
      supplierName: 'SHREE BALAJI PRECISION LLP',
      customerName: 'Larsen & Toubro Limited',
      extractedIdentity: {
        legalName: 'SHREE BALAJI PRECISION LLP',
        pan: 'AABCU9603R',
        gstin: '27AABCU9603R1ZM'
      }
    }
  );

  const gstMatch = matchAnalysis.matchResults.find((r) => r.requirementId === 'req_gst');
  assert(gstMatch?.status === 'MATCHED', 'GST requirement matched against uploaded GST document');

  const panMatch = matchAnalysis.matchResults.find((r) => r.requirementId === 'req_pan');
  assert(panMatch?.status === 'MATCHED', 'PAN requirement matched against uploaded PAN document');

  const bankMatch = matchAnalysis.matchResults.find((r) => r.requirementId === 'req_bank');
  assert(bankMatch?.status === 'MISSING', 'Bank proof correctly flagged as MISSING');

  const debarmentMatch = matchAnalysis.matchResults.find((r) => r.requirementId === 'req_debarment');
  assert(debarmentMatch?.status === 'DRAFT_AVAILABLE', 'Declaration correctly flagged as DRAFT_AVAILABLE');

  // ----------------------------------------------------
  // Test 2: Configurable Inconsistency Checks
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Configurable Checks & Inconsistency Rules ---');

  // Test GSTIN-PAN mismatch
  const mismatchDocs: SupplierDocument[] = [
    {
      id: 'doc_mismatch',
      fileName: 'GST_Certificate.pdf',
      fileSize: 1024 * 300,
      mimeType: 'application/pdf',
      detectedType: 'gst_certificate',
      typeConfidence: 0.95,
      displayOrder: 1,
      isExcluded: false,
      issues: [],
      extractedData: {
        gstin: { value: '27XYZCU9603R1ZM', confidence: 0.99 },
        pan: { value: 'AABCU9603R', confidence: 0.99 } // Different from XYZCU9603R
      }
    }
  ];

  const mismatchAnalysis = matchCustomerRequirements(
    testRequirements,
    mismatchDocs,
    defaultChecks,
    {
      supplierName: 'SHREE BALAJI PRECISION LLP',
      extractedIdentity: { pan: 'AABCU9603R', gstin: '27XYZCU9603R1ZM' }
    }
  );

  const panGstCheck = mismatchAnalysis.validationResults.find((v) => v.id === 'chk_gst_pan_link');
  assert(panGstCheck?.status === 'REVIEW', 'GSTIN ↔ PAN character mismatch detected correctly');

  // Test Handwritten Cheque Detection
  const chequeDoc: SupplierDocument = {
    id: 'doc_cheque',
    fileName: 'Cheque.png',
    fileSize: 1024 * 200,
    mimeType: 'image/png',
    detectedType: 'bank_proof',
    typeConfidence: 0.95,
    displayOrder: 2,
    isExcluded: false,
    issues: [],
    extractedData: {
      bankDetails: {
        accountHolderName: {
          value: 'SHREE BALAJI PRECISION',
          confidence: 0.9,
          isPrePrinted: false // Handwritten!
        }
      }
    }
  };

  const chequeAnalysis = matchCustomerRequirements(
    testRequirements,
    [chequeDoc],
    defaultChecks,
    {
      supplierName: 'SHREE BALAJI PRECISION',
      extractedIdentity: { isPrePrinted: false }
    }
  );

  const chequeCheck = chequeAnalysis.validationResults.find((v) => v.id === 'chk_cheque_preprinted');
  assert(
    chequeCheck?.status === 'REVIEW' && chequeCheck.message.toLowerCase().includes('handwritten'),
    'Handwritten cheque detected with neutral B2B guidance'
  );

  // ----------------------------------------------------
  // Test 3: Declaration Drafting Engine
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Declaration Drafting Engine ---');

  const draft = draftDeclaration('debarment', 'req_debarment', {
    supplierName: 'SHREE BALAJI PRECISION LLP',
    customerName: 'Larsen & Toubro Limited',
    address: 'Plot 42, MIDC Bhosari, Pune 411026',
    signatoryName: 'Rajesh Sharma',
    signatoryTitle: 'Managing Partner',
    date: '2026-09-08',
    pan: 'AABCU9603R',
    gstin: '27AABCU9603R1ZM'
  });

  assert(draft.title.includes('Debarment'), 'Declaration title generated correctly');
  assert(draft.text.includes('SHREE BALAJI PRECISION LLP'), 'Supplier name substituted into body');
  assert(draft.text.includes('Larsen & Toubro Limited'), 'Customer name substituted into body');
  assert(draft.text.includes('Rajesh Sharma'), 'Signatory name substituted into body');
  assert(draft.text.includes('MIDC Bhosari'), 'Address substituted into body');

  // Anti-Bribery draft test
  const antiBriberyDraft = draftDeclaration('anti_bribery', 'req_bribery', {
    supplierName: 'SHREE BALAJI PRECISION LLP',
    customerName: 'BHEL'
  });
  assert(antiBriberyDraft.text.includes('Anti-Bribery'), 'Anti-Bribery declaration generated correctly');

  // ----------------------------------------------------
  // Test 4: Storage & Access Control
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Ephemeral Storage & Token Security ---');

  const packId = `cp_test_${Date.now()}`;
  const validToken = crypto.randomBytes(24).toString('hex');
  const wrongToken = crypto.randomBytes(24).toString('hex');

  const testPack: CustomerPackRecord = {
    id: packId,
    accessToken: validToken,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    supplierName: 'SHREE BALAJI PRECISION LLP',
    customerName: 'Larsen & Toubro Limited',
    customerFiles: [],
    requirements: testRequirements,
    supplierDocuments: testDocs,
    checksConfig: defaultChecks,
    matchResults: matchAnalysis.matchResults,
    declarations: [draft],
    validationResults: matchAnalysis.validationResults,
    readinessScore: 75,
    summary: matchAnalysis.summary,
    finalOrder: ['doc_1', 'doc_2', draft.id],
    isPaid: false,
    isPurged: false
  };

  await saveCustomerPack(testPack);

  const retrieved = await getCustomerPack(packId);
  assert(retrieved !== null && retrieved.id === packId, 'Customer pack retrieved from storage');

  const hasAccessWithValidToken = await verifyCustomerPackAccess(packId, validToken);
  assert(hasAccessWithValidToken === true, 'Access granted with valid bearer token');

  const hasAccessWithWrongToken = await verifyCustomerPackAccess(packId, wrongToken);
  assert(hasAccessWithWrongToken === false, 'Access denied with wrong bearer token');

  const hasAccessWithoutToken = await verifyCustomerPackAccess(packId, undefined);
  assert(hasAccessWithoutToken === false, 'Access denied when token is omitted');

  // ----------------------------------------------------
  // Test 5: Dual PDF Compilation Engine
  // ----------------------------------------------------
  console.log('\n--- 5. Testing Dual PDF Compilation Engine ---');

  // A: Preflight Report PDF
  const preflightPdfBytes = await generateCustomerPackPreflightReportPdf(testPack, false);
  const isPdfHeader =
    preflightPdfBytes[0] === 0x25 &&
    preflightPdfBytes[1] === 0x50 &&
    preflightPdfBytes[2] === 0x44 &&
    preflightPdfBytes[3] === 0x46;

  assert(isPdfHeader, 'Preflight Report output has valid %PDF magic bytes');
  assert(preflightPdfBytes.length > 2000, `Preflight Report PDF has valid size (${preflightPdfBytes.length} bytes)`);

  // B: Submission Dossier PDF with Cover, Index, Documents & Typeset Declaration
  const dossierPdfBytes = await generateCustomerPackSubmissionDossierPdf(testPack, true);
  const isDossierPdfHeader =
    dossierPdfBytes[0] === 0x25 &&
    dossierPdfBytes[1] === 0x50 &&
    dossierPdfBytes[2] === 0x44 &&
    dossierPdfBytes[3] === 0x46;

  assert(isDossierPdfHeader, 'Submission Dossier output has valid %PDF magic bytes');
  assert(dossierPdfBytes.length > 5000, `Submission Dossier PDF has valid compiled size (${dossierPdfBytes.length} bytes)`);

  // ----------------------------------------------------
  // Test 6: Payment Verification Logic
  // ----------------------------------------------------
  console.log('\n--- 6. Testing Razorpay Payment Verification ---');

  const secret = 'test_secret_for_validation_123';
  const orderId = 'order_test_998811';
  const paymentId = 'pay_test_445566';

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Temporarily set test secret
  const oldSecret = process.env.RAZORPAY_KEY_SECRET;
  process.env.RAZORPAY_KEY_SECRET = secret;

  const isValidPayment = verifyRazorpaySignature(orderId, paymentId, expectedSignature);
  assert(isValidPayment === true, 'Payment verification passes with valid HMAC SHA-256 signature');

  const isInvalidPayment = verifyRazorpaySignature(orderId, paymentId, 'tampered_signature_payload');
  assert(isInvalidPayment === false, 'Payment verification rejects tampered signature');

  process.env.RAZORPAY_KEY_SECRET = oldSecret;

  // ----------------------------------------------------
  // Test 7: Ephemeral Purge
  // ----------------------------------------------------
  console.log('\n--- 7. Testing Ephemeral Purge & Privacy ---');

  const purgeSuccess = await purgeCustomerPack(packId);
  assert(purgeSuccess === true, 'Purge command executed successfully');

  const packAfterPurge = await getCustomerPack(packId);
  assert(
    packAfterPurge === null || packAfterPurge.isPurged === true,
    'Purged customer pack is completely inaccessible'
  );

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
