import { runPreflightChecks } from '../src/lib/validation';
import { calculateReadinessScore } from '../src/lib/scoring';
import { AggregatedExtractedData } from '../src/lib/types';

console.log('====================================================');
console.log('RUNNING DETERMINISTIC VALIDATION & SCORING TESTS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// Test Case 1: Standard Private Limited with perfect GSTIN-to-PAN link and matching bank cheque
const testCase1: AggregatedExtractedData = {
  companyName: 'ACME ENGINEERING PRIVATE LIMITED',
  legalName: 'ACME ENGINEERING PRIVATE LIMITED',
  tradeName: 'ACME FABRICATORS',
  gstin: '27AABCU9603R1ZM',
  pan: 'AABCU9603R',
  udyamNumber: 'UDYAM-MH-01-0012345',
  bankAccountName: 'ACME ENGINEERING PVT LTD',
  bankAccountNumber: '50200012345678',
  bankIfsc: 'HDFC0000128',
  bankName: 'HDFC Bank Ltd',
  isPrePrintedCheque: true,
  bankDetails: {
    accountHolderName: 'ACME ENGINEERING PVT LTD',
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000128',
    isPrePrinted: true
  },
  documents: [
    { id: '1', fileName: 'gst.pdf', type: 'gst_certificate', confidence: 0.98, issues: [] },
    { id: '2', fileName: 'pan.png', type: 'pan_card', confidence: 0.99, issues: [] },
    { id: '3', fileName: 'cheque.jpg', type: 'bank_proof', confidence: 0.96, issues: [] },
    { id: '4', fileName: 'udyam.pdf', type: 'udyam_certificate', confidence: 0.97, issues: [] }
  ]
};

const results1 = runPreflightChecks(testCase1);
const score1 = calculateReadinessScore(testCase1, results1);

const gstinCheck1 = results1.find((r) => r.id === 'gstin_pan_match');
assert(gstinCheck1?.status === 'PASS', 'Test 1: GSTIN ↔ PAN structural match should PASS');

const nameCheck1 = results1.find((r) => r.id === 'name_bank_match');
assert(nameCheck1?.status === 'PASS', 'Test 1: Legal Name vs Bank Cheque match should PASS');

const ifscCheck1 = results1.find((r) => r.id === 'ifsc_format');
assert(ifscCheck1?.status === 'PASS', 'Test 1: Valid IFSC format should PASS');

const udyamCheck1 = results1.find((r) => r.id === 'udyam_presence');
assert(udyamCheck1?.status === 'PASS', 'Test 1: Udyam presence should PASS');

assert(score1.totalScore >= 85, `Test 1: Score should be >= 85 (Actual: ${score1.totalScore})`);
assert(score1.scoreBand === 'Submission-Ready', 'Test 1: Score band should be Submission-Ready');

console.log('\n--- Scenario 2: Sole Proprietorship with naming variation & handwritten cheque ---');

const testCase2: AggregatedExtractedData = {
  companyName: 'RAMESH TRADING COMPANY',
  legalName: 'RAMESH TRADING COMPANY',
  tradeName: 'RAMESH ENTERPRISES',
  gstin: '07AAPPR1234F1Z8',
  pan: 'AAPPR1234F',
  bankAccountName: 'RAMESH KUMAR (PROPRIETOR)',
  bankAccountNumber: '91823749821',
  bankIfsc: 'SBIN0001234',
  isPrePrintedCheque: false, // Handwritten cheque leaf
  bankDetails: {
    accountHolderName: 'RAMESH KUMAR (PROPRIETOR)',
    accountNumber: '91823749821',
    ifsc: 'SBIN0001234',
    isPrePrinted: false
  },
  documents: [
    { id: '1', fileName: 'gst.pdf', type: 'gst_certificate', confidence: 0.95, issues: [] },
    { id: '2', fileName: 'pan.pdf', type: 'pan_card', confidence: 0.95, issues: [] },
    { id: '3', fileName: 'cheque.jpg', type: 'bank_proof', confidence: 0.9, issues: [] }
  ]
};

const results2 = runPreflightChecks(testCase2);
const score2 = calculateReadinessScore(testCase2, results2);

const nameCheck2 = results2.find((r) => r.id === 'name_bank_match');
assert(nameCheck2?.status === 'REVIEW', 'Test 2: Proprietorship naming variation should be REVIEW');
assert(
  nameCheck2?.message.includes('sole proprietorships') === true,
  'Test 2: Review note should include proprietorship convention explanation'
);

const chequeCheck2 = results2.find((r) => r.id === 'cheque_preprinted');
assert(chequeCheck2?.status === 'REVIEW', 'Test 2: Handwritten cheque should be REVIEW');

const udyamCheck2 = results2.find((r) => r.id === 'udyam_presence');
assert(udyamCheck2?.status === 'MISSING', 'Test 2: Missing Udyam should be MISSING');

console.log('\n--- Scenario 3: Embedded PAN mismatch in GSTIN ---');

const testCase3: AggregatedExtractedData = {
  companyName: 'TEST TRADERS',
  legalName: 'TEST TRADERS',
  gstin: '27AAAAA1111A1ZM', // embeds AAAAA1111A
  pan: 'BBBBB2222B',         // does not match
  documents: [
    { id: '1', fileName: 'gst.pdf', type: 'gst_certificate', confidence: 0.95, issues: [] },
    { id: '2', fileName: 'pan.pdf', type: 'pan_card', confidence: 0.95, issues: [] }
  ]
};

const results3 = runPreflightChecks(testCase3);
const gstinCheck3 = results3.find((r) => r.id === 'gstin_pan_match');
assert(gstinCheck3?.status === 'REVIEW', 'Test 3: Embedded PAN mismatch should flag REVIEW');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
