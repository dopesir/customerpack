import { generateVendorPacketPdf } from '../src/lib/pdf-builder';
import { PacketGenerationConfig } from '../src/lib/types';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function runPdfTest() {
  console.log('====================================================');
  console.log('RUNNING SERVERLESS PDF COMPILATION ENGINE TEST');
  console.log('====================================================\n');

  // 1. Create a mock 1-page PDF document
  const mockGstPdf = await PDFDocument.create();
  const font = await mockGstPdf.embedFont(StandardFonts.Helvetica);
  const page1 = mockGstPdf.addPage([595.28, 841.89]);
  page1.drawText('GOVERNMENT OF INDIA - GST REGISTRATION CERTIFICATE', {
    x: 50,
    y: 800,
    size: 14,
    font,
    color: rgb(0.1, 0.1, 0.1)
  });
  const mockGstBuffer = await mockGstPdf.save();

  // 2. Create a mock 1-page PDF for PAN
  const mockPanPdf = await PDFDocument.create();
  const page2 = mockPanPdf.addPage([595.28, 841.89]);
  page2.drawText('INCOME TAX DEPARTMENT - PERMANENT ACCOUNT NUMBER', {
    x: 50,
    y: 800,
    size: 14,
    font,
    color: rgb(0.1, 0.1, 0.1)
  });
  const mockPanBuffer = await mockPanPdf.save();

  const config: PacketGenerationConfig = {
    packetId: 'vp_test_12345678',
    companyName: 'ACME ENGINEERING PRIVATE LIMITED',
    displayNameType: 'legal',
    legalName: 'ACME ENGINEERING PRIVATE LIMITED',
    tradeName: 'ACME FABRICATORS',
    pan: 'AABCU9603R',
    gstin: '27AABCU9603R1ZM',
    udyamNumber: 'UDYAM-MH-01-0012345',
    bankAccountName: 'ACME ENGINEERING PVT LTD',
    bankAccountNumber: '50200012345678',
    bankIfsc: 'HDFC0000128',
    bankName: 'HDFC Bank Ltd',
    signatoryName: 'Ramesh Kumar',
    contactEmail: 'accounts@acme.com',
    contactMobile: '+91 98765 43210',
    readinessScore: 92,
    isWatermarked: true,
    documentItems: [
      {
        id: 'doc_1',
        title: 'GST Registration Certificate',
        documentType: 'gst_certificate',
        fileName: 'ACME_GST_Certificate.pdf',
        startPage: 3,
        pageCount: 1
      },
      {
        id: 'doc_2',
        title: 'Permanent Account Number (PAN) Card',
        documentType: 'pan_card',
        fileName: 'ACME_PAN_Card.pdf',
        startPage: 4,
        pageCount: 1
      }
    ],
    documentFiles: [
      {
        id: 'doc_1',
        title: 'GST Registration Certificate',
        fileName: 'ACME_GST_Certificate.pdf',
        mimeType: 'application/pdf',
        buffer: mockGstBuffer
      },
      {
        id: 'doc_2',
        title: 'Permanent Account Number (PAN) Card',
        fileName: 'ACME_PAN_Card.pdf',
        mimeType: 'application/pdf',
        buffer: mockPanBuffer
      }
    ]
  };

  const pdfBytes = await generateVendorPacketPdf(config);
  const compiledPdf = await PDFDocument.load(pdfBytes);
  const pageCount = compiledPdf.getPageCount();

  console.log(`Generated PDF Byte Length: ${pdfBytes.length} bytes`);
  console.log(`Compiled Total Page Count: ${pageCount} pages (Cover + TOC + 2 Attachments)`);

  let success = true;

  if (pageCount === 4) {
    console.log('✅ PASS: Page count matches expected structure (Page 1 Cover, Page 2 TOC, Pages 3-4 Attachments)');
  } else {
    console.error(`❌ FAIL: Expected 4 pages, got ${pageCount}`);
    success = false;
  }

  if (pdfBytes.length > 5000) {
    console.log('✅ PASS: PDF byte size is non-empty and valid vector file');
  } else {
    console.error('❌ FAIL: PDF byte size too small');
    success = false;
  }

  if (success) {
    console.log('\n====================================================');
    console.log('ALL PDF ENGINE TESTS PASSED');
    console.log('====================================================');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPdfTest().catch((err) => {
  console.error('PDF Test Error:', err);
  process.exit(1);
});
