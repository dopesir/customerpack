import { getCustomerPackAIProvider } from '../src/lib/providers/ai';
import { getCustomerPackStorageProvider } from '../src/lib/providers/storage';
import { CustomerPackRecord } from '../src/lib/types';

async function runCustomerPackProviderTests() {
  console.log('====================================================');
  console.log('TESTING SWAPPABLE PROVIDER LAYER IN CUSTOMERPACK');
  console.log('====================================================');

  // Test 1: AI Provider document extraction
  const aiProvider = getCustomerPackAIProvider();
  console.log(`✓ Active CustomerPack AI Provider: ${aiProvider.name}`);

  const dummyBuffer = Buffer.from('Mock Buyer Document');
  const extraction = await aiProvider.extractDocument(dummyBuffer, 'application/pdf', 'PAN_Card.png');
  console.log(`✓ Document extraction detectedType: ${extraction.detectedType}`);
  if (extraction.detectedType !== 'pan_card') {
    throw new Error(`Expected pan_card, got ${extraction.detectedType}`);
  }

  // Test 2: AI Provider customer requirement extraction
  const reqExtraction = await aiProvider.extractCustomerRequirements(
    dummyBuffer,
    'application/pdf',
    'Customer_Vendor_Questionnaire.pdf',
    'Tata Motors Ltd'
  );
  console.log(`✓ Customer requirement count: ${reqExtraction.requirements.length}`);
  console.log(`✓ Customer Name detected: ${reqExtraction.detectedCustomerName}`);
  if (reqExtraction.requirements.length === 0) {
    throw new Error('Expected at least 1 extracted customer requirement');
  }

  // Test 3: Storage Provider for CustomerPackRecord
  const storageProvider = getCustomerPackStorageProvider();
  console.log(`✓ Active CustomerPack Storage Provider: ${storageProvider.name}`);

  const testPackId = `cp_prov_${Date.now()}`;
  const mockPack: CustomerPackRecord = {
    id: testPackId,
    accessToken: 'test_token_12345',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    supplierName: 'ACME SUPPLIES PVT LTD',
    customerName: 'Tata Motors Ltd',
    submissionRef: 'REF-2026-09',
    deadline: '2026-09-30',
    customerFiles: [],
    requirements: reqExtraction.requirements,
    supplierDocuments: [],
    checksConfig: {
      checkPresenceRequired: true,
      checkPresenceOptional: true,
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
    },
    matchResults: [],
    declarations: [],
    validationResults: [],
    readinessScore: 88,
    summary: { total: 4, matched: 3, missing: 1, needsReview: 0, draftsAvailable: 1 },
    finalOrder: [],
    isPaid: false,
    isPurged: false
  };

  await storageProvider.saveCustomerPack(mockPack);
  const retrieved = await storageProvider.getCustomerPack(testPackId);
  if (!retrieved || retrieved.supplierName !== 'ACME SUPPLIES PVT LTD') {
    throw new Error('Failed to retrieve customer pack from storage provider');
  }
  console.log(`✓ Saved and retrieved customer pack: ${retrieved.id}`);

  // Test 4: Purge customer pack
  await storageProvider.purgeCustomerPack(testPackId);
  const afterPurge = await storageProvider.getCustomerPack(testPackId);
  if (afterPurge !== null) {
    throw new Error('Expected purged customer pack to return null');
  }
  console.log('✓ Purge successfully wiped customer pack record');

  console.log('====================================================');
  console.log('ALL CUSTOMERPACK PROVIDER TESTS PASSED (100% SUCCESS)');
  console.log('====================================================');
}

runCustomerPackProviderTests().catch((err) => {
  console.error('CustomerPack provider test failed:', err);
  process.exit(1);
});
