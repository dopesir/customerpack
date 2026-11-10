import { degrees, PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { PacketGenerationConfig, CustomerPackRecord } from './types';
import { getPacketFileBuffer } from './storage';

/**
 * High-performance, serverless in-memory PDF compilation engine.
 * Converts JPG/PNG images to A4 pages and merges them with multi-page PDFs,
 * stamping executive cover sheets, TOC indices, and running headers/footers.
 */
export async function generateVendorPacketPdf(config: PacketGenerationConfig): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  const a4Width = 595.28;
  const a4Height = 841.89;

  // Helper for drawing watermarks
  const drawWatermark = (page: PDFPage) => {
    if (!config.isWatermarked) return;
    const { width, height } = page.getSize();
    page.drawText('SAMPLE PREVIEW — VENDORPACK', {
      x: width * 0.12,
      y: height * 0.35,
      size: 32,
      font: fontBold,
      color: rgb(0.88, 0.88, 0.9),
      rotate: degrees(45)
    });
  };

  // Helper to wrap text
  const drawTextWrapped = (
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    font: typeof fontRegular,
    color: ReturnType<typeof rgb>
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && line !== '') {
        page.drawText(line, { x, y: currentY, size: fontSize, font, color });
        line = word;
        currentY -= fontSize + 3;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= fontSize + 3;
    }
    return currentY;
  };

  // ==========================================
  // PAGE 1: EXECUTIVE VENDOR PROFILE SHEET
  // ==========================================
  const coverPage = mergedPdf.addPage([a4Width, a4Height]);
  const primaryName =
    config.displayNameType === 'trade' && config.tradeName
      ? config.tradeName
      : config.legalName || config.companyName || 'Business Entity';

  // Top Accent Bar
  coverPage.drawRectangle({
    x: 0,
    y: a4Height - 8,
    width: a4Width,
    height: 8,
    color: rgb(0.07, 0.07, 0.07) // Executive off-black accent
  });

  // Header Title
  coverPage.drawText('VENDOR REGISTRATION DOSSIER', {
    x: 45,
    y: a4Height - 48,
    size: 20,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.2)
  });

  coverPage.drawText('PREFLIGHT VERIFIED & INDEXED SUBMISSION PACK', {
    x: 45,
    y: a4Height - 64,
    size: 8.5,
    font: fontBold,
    color: rgb(0.39, 0.45, 0.55)
  });

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  coverPage.drawText(`Prepared: ${currentDateStr} | ID: ${config.packetId.substring(0, 8)}`, {
    x: a4Width - 210,
    y: a4Height - 48,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  // Divider Line
  coverPage.drawLine({
    start: { x: 45, y: a4Height - 76 },
    end: { x: a4Width - 45, y: a4Height - 76 },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94)
  });

  // Preflight Readiness Banner Box
  coverPage.drawRectangle({
    x: 45,
    y: a4Height - 148,
    width: a4Width - 90,
    height: 58,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.78, 0.85, 0.97),
    borderWidth: 1
  });

  coverPage.drawText(`Document Readiness Score: ${config.readinessScore} / 100`, {
    x: 60,
    y: a4Height - 110,
    size: 13,
    font: fontBold,
    color: rgb(0.12, 0.28, 0.72)
  });

  const scoreDescriptor =
    config.readinessScore >= 85
      ? 'Submission-Ready (High structural consistency across primary statutory records)'
      : config.readinessScore >= 65
      ? 'Review Advised (Minor naming variations or optional proofs require confirmation)'
      : 'Action Required (Critical documents missing or tax identifiers need review)';

  coverPage.drawText(scoreDescriptor, {
    x: 60,
    y: a4Height - 126,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.4)
  });

  coverPage.drawText(
    '* Automated consistency check aid. Does not guarantee third-party corporate acceptance.',
    {
      x: 60,
      y: a4Height - 140,
      size: 7.5,
      font: fontOblique,
      color: rgb(0.45, 0.5, 0.6)
    }
  );

  // Business Identity Section Header
  let currentY = a4Height - 176;
  coverPage.drawText('1. BUSINESS IDENTITY & STATUTORY IDENTIFIERS', {
    x: 45,
    y: currentY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 14;

  const drawRow = (label: string, value: string, isAlternate: boolean = false) => {
    if (isAlternate) {
      coverPage.drawRectangle({
        x: 45,
        y: currentY - 5,
        width: a4Width - 90,
        height: 19,
        color: rgb(0.98, 0.98, 0.99)
      });
    }
    coverPage.drawText(label, {
      x: 55,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.45)
    });
    coverPage.drawText(value || '—', {
      x: 230,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: rgb(0.08, 0.1, 0.15)
    });
    currentY -= 19;
  };

  drawRow('Primary Display Entity:', primaryName, true);
  drawRow('Legal Entity Name:', config.legalName || primaryName);
  drawRow('Trade / Brand Name:', config.tradeName || 'Not Specified', true);
  drawRow('Permanent Account No (PAN):', config.pan || 'Not Extracted');
  drawRow('GST Identification No (GSTIN):', config.gstin || 'Not Extracted', true);
  drawRow('MSME / Udyam Registration:', config.udyamNumber || 'Not Attached');

  // Banking Section
  currentY -= 10;
  coverPage.drawText('2. BANKING & DISBURSEMENT PARTICULARS', {
    x: 45,
    y: currentY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 14;
  const maskedAccNo = config.bankAccountNumber
    ? config.isWatermarked
      ? `XXXX-XXXX-${config.bankAccountNumber.slice(-4) || 'XXXX'}`
      : config.bankAccountNumber
    : 'Not Extracted';

  drawRow('Bank Account Holder Name:', config.bankAccountName || primaryName, true);
  drawRow('Bank Account Number:', maskedAccNo);
  drawRow('Bank IFSC Code:', config.bankIfsc || 'Not Extracted', true);
  drawRow('Bank & Branch Name:', config.bankName || 'Verified via Bank Proof');

  // Enclosed Attachments Preview Table
  currentY -= 10;
  coverPage.drawText('3. ENCLOSED STATUTORY ATTACHMENTS (INDEX)', {
    x: 45,
    y: currentY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 16;
  coverPage.drawRectangle({
    x: 45,
    y: currentY - 4,
    width: a4Width - 90,
    height: 18,
    color: rgb(0.92, 0.94, 0.97)
  });

  coverPage.drawText('Document Attachment', {
    x: 55,
    y: currentY,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35)
  });
  coverPage.drawText('Format', {
    x: 350,
    y: currentY,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35)
  });
  coverPage.drawText('Location', {
    x: a4Width - 110,
    y: currentY,
    size: 8.5,
    font: fontBold,
    color: rgb(0.2, 0.25, 0.35)
  });

  currentY -= 18;

  config.documentItems.forEach((doc, idx) => {
    if (currentY > 70) {
      coverPage.drawText(`${idx + 1}. ${doc.title}`, {
        x: 55,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.25)
      });
      coverPage.drawText(doc.fileName.split('.').pop()?.toUpperCase() || 'DOC', {
        x: 350,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55)
      });
      coverPage.drawText(`Page ${doc.startPage}`, {
        x: a4Width - 110,
        y: currentY,
        size: 8.5,
        font: fontBold,
        color: rgb(0.12, 0.28, 0.72)
      });
      currentY -= 16;
    }
  });

  // Footer note on Page 1
  coverPage.drawText(
    'VendorPack Clean Submission Dossier · No account required · Ephemeral processing',
    {
      x: 45,
      y: 28,
      size: 8,
      font: fontRegular,
      color: rgb(0.55, 0.6, 0.68)
    }
  );

  drawWatermark(coverPage);

  // ==========================================
  // PAGE 2: TABLE OF CONTENTS & PREFLIGHT AUDIT
  // ==========================================
  const tocPage = mergedPdf.addPage([a4Width, a4Height]);

  tocPage.drawRectangle({
    x: 0,
    y: a4Height - 8,
    width: a4Width,
    height: 8,
    color: rgb(0.19, 0.27, 0.88)
  });

  tocPage.drawText('TABLE OF CONTENTS & PREFLIGHT AUDIT SUMMARY', {
    x: 45,
    y: a4Height - 48,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.2)
  });

  tocPage.drawText('Submission Index & Checklist Confirmation', {
    x: 45,
    y: a4Height - 64,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.55)
  });

  tocPage.drawLine({
    start: { x: 45, y: a4Height - 74 },
    end: { x: a4Width - 45, y: a4Height - 74 },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94)
  });

  let tocY = a4Height - 105;

  config.documentItems.forEach((doc, idx) => {
    // Card Box for each document
    tocPage.drawRectangle({
      x: 45,
      y: tocY - 35,
      width: a4Width - 90,
      height: 48,
      color: rgb(0.98, 0.99, 1.0),
      borderColor: rgb(0.88, 0.91, 0.96),
      borderWidth: 1
    });

    tocPage.drawText(`${idx + 1}. ${doc.title.toUpperCase()}`, {
      x: 58,
      y: tocY,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25)
    });

    tocPage.drawText(`File: ${doc.fileName} (${doc.pageCount} ${doc.pageCount === 1 ? 'page' : 'pages'})`, {
      x: 58,
      y: tocY - 14,
      size: 8,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.6)
    });

    tocPage.drawText(`Starts on Page ${doc.startPage}`, {
      x: a4Width - 165,
      y: tocY - 7,
      size: 10,
      font: fontBold,
      color: rgb(0.12, 0.28, 0.72)
    });

    tocY -= 58;
  });

  // Preflight Notes Block
  tocY -= 15;
  tocPage.drawText('PREFLIGHT CONSISTENCY NOTES', {
    x: 45,
    y: tocY,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  tocY -= 16;
  const notes = [
    '• All tax identifiers (GSTIN, PAN) have undergone deterministic structural cross-check.',
    '• Bank account particulars were matched against legal and trade business designations.',
    '• Original document attachments are preserved in full resolution without modifying legal scans.',
    '• Page numbering and running headers have been stamped for corporate procurement auditing.'
  ];

  notes.forEach((note) => {
    tocY = drawTextWrapped(tocPage, note, 50, tocY, a4Width - 100, 8.5, fontRegular, rgb(0.3, 0.35, 0.45));
    tocY -= 4;
  });

  drawWatermark(tocPage);

  // ==========================================
  // PAGES 3+: APPEND ORIGINAL DOCUMENTS WITH HEADERS/FOOTERS
  // ==========================================
  for (const doc of config.documentFiles) {
    const isImage =
      doc.mimeType.startsWith('image/') ||
      doc.fileName.toLowerCase().endsWith('.jpg') ||
      doc.fileName.toLowerCase().endsWith('.jpeg') ||
      doc.fileName.toLowerCase().endsWith('.png');

    if (isImage) {
      // Explicit Image to A4 PDF conversion
      const imagePage = mergedPdf.addPage([a4Width, a4Height]);
      let embeddedImage;

      try {
        if (doc.mimeType.includes('png') || doc.fileName.toLowerCase().endsWith('.png')) {
          embeddedImage = await mergedPdf.embedPng(doc.buffer);
        } else {
          embeddedImage = await mergedPdf.embedJpg(doc.buffer);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        // Fit within margins: Top 45pt, Bottom 45pt, Left 40pt, Right 40pt
        const maxDisplayWidth = a4Width - 80;
        const maxDisplayHeight = a4Height - 90;

        const scale = Math.min(maxDisplayWidth / imgWidth, maxDisplayHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        const posX = 40 + (maxDisplayWidth - scaledWidth) / 2;
        const posY = 45 + (maxDisplayHeight - scaledHeight) / 2;

        imagePage.drawImage(embeddedImage, {
          x: posX,
          y: posY,
          width: scaledWidth,
          height: scaledHeight
        });
      } catch (err) {
        console.warn(`Failed to embed image ${doc.fileName}:`, err);
        imagePage.drawText(`[Image: ${doc.title} - ${doc.fileName}]`, {
          x: 50,
          y: a4Height / 2,
          size: 12,
          font: fontRegular,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      drawWatermark(imagePage);
    } else {
      // It's a PDF document
      try {
        const srcPdf = await PDFDocument.load(doc.buffer);
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
          drawWatermark(page);
        });
      } catch (err) {
        console.warn(`Failed to copy PDF pages for ${doc.fileName}:`, err);
        const errPage = mergedPdf.addPage([a4Width, a4Height]);
        errPage.drawText(`[Attachment: ${doc.title} - ${doc.fileName}]`, {
          x: 50,
          y: a4Height / 2,
          size: 12,
          font: fontRegular,
          color: rgb(0.5, 0.5, 0.5)
        });
        drawWatermark(errPage);
      }
    }
  }

  // ==========================================
  // STAMP RUNNING HEADERS & FOOTERS ON ALL PAGES
  // ==========================================
  const totalPages = mergedPdf.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = mergedPdf.getPage(i);
    const { width, height } = page.getSize();

    // Page 1 has its own top header, but we add subtle running stamps
    if (i > 0) {
      // Top Running Header
      page.drawText(`Vendor Submission Pack — ${primaryName}`, {
        x: 35,
        y: height - 20,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.65)
      });

      page.drawText(`ID: ${config.packetId.substring(0, 8)}`, {
        x: width - 110,
        y: height - 20,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.65)
      });
    }

    // Bottom Running Footer
    page.drawText(`Page ${i + 1} of ${totalPages} | Prepared via VendorPack`, {
      x: width - 200,
      y: 14,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65)
    });

    page.drawText('Confidential & Statutory Business Registration Submission', {
      x: 35,
      y: 14,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.6, 0.65, 0.7)
    });
  }

  return await mergedPdf.save();
}

// =======================================================
// CUSTOMER PACK PREFLIGHT REPORT PDF BUILDER
// =======================================================

export function sanitizeWinAnsi(text: string): string {
  if (!text) return '';
  return text
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/₹/g, 'INR ')
    .replace(/[✓✔]/g, '[OK]')
    .replace(/[⚠❌]/g, '[!]')
    .replace(/[•·]/g, '*')
    .replace(/[^\x20-\x7E\n\r\t]/g, '');
}

export async function generateCustomerPackPreflightReportPdf(
  pack: CustomerPackRecord,
  isWatermarked: boolean = false
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const a4Width = 595.28;
  const a4Height = 841.89;

  const drawWatermark = (page: PDFPage) => {
    if (!isWatermarked) return;
    const { width, height } = page.getSize();
    page.drawText('PREVIEW - CUSTOMER PACK', {
      x: width * 0.15,
      y: height * 0.4,
      size: 34,
      font: fontBold,
      color: rgb(0.88, 0.88, 0.92),
      rotate: degrees(45)
    });
  };

  const drawTextWrapped = (
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    font: typeof fontRegular,
    color: ReturnType<typeof rgb>
  ): number => {
    const sanitized = sanitizeWinAnsi(text);
    const words = sanitized.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && line !== '') {
        page.drawText(line, { x, y: currentY, size: fontSize, font, color });
        line = word;
        currentY -= fontSize + 3;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= fontSize + 3;
    }
    return currentY;
  };

  // ----------------------------------------------------
  // PAGE 1: PREFLIGHT CHECKLIST & SUMMARY
  // ----------------------------------------------------
  let page = pdfDoc.addPage([a4Width, a4Height]);

  // Dark Header Bar
  page.drawRectangle({
    x: 0,
    y: a4Height - 90,
    width: a4Width,
    height: 90,
    color: rgb(0.06, 0.09, 0.16) // #0f172a slate-900
  });

  // Top Accent Stripe
  page.drawRectangle({
    x: 0,
    y: a4Height - 6,
    width: a4Width,
    height: 6,
    color: rgb(0.07, 0.07, 0.07) // Executive off-black accent
  });

  page.drawText('CUSTOMER PACK', {
    x: 40,
    y: a4Height - 38,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText('PRE-SUBMISSION DOCUMENT CHECKLIST', {
    x: 40,
    y: a4Height - 54,
    size: 9,
    font: fontRegular,
    color: rgb(0.7, 0.75, 0.85)
  });

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  page.drawText(`Prepared: ${currentDate} | Pack ID: ${pack.id.substring(0, 8)}`, {
    x: a4Width - 210,
    y: a4Height - 40,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.65, 0.7, 0.8)
  });

  // Meta Bar (Buyer & Supplier Information)
  page.drawRectangle({
    x: 40,
    y: a4Height - 145,
    width: a4Width - 80,
    height: 44,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.88, 0.91, 0.96),
    borderWidth: 1
  });

  page.drawText('TARGET BUYER / CUSTOMER', {
    x: 52,
    y: a4Height - 114,
    size: 7.5,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });
  page.drawText(pack.customerName || 'Requesting Organization', {
    x: 52,
    y: a4Height - 130,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  page.drawText('SUPPLIER / APPLICANT', {
    x: 240,
    y: a4Height - 114,
    size: 7.5,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });
  page.drawText(pack.supplierName || 'Business Entity', {
    x: 240,
    y: a4Height - 130,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  page.drawText('PREFLIGHT STATUS', {
    x: 430,
    y: a4Height - 114,
    size: 7.5,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });
  const summaryStr = `${pack.summary.matched} Matched · ${pack.summary.missing} Missing · ${pack.summary.needsReview} Review`;
  page.drawText(summaryStr, {
    x: 430,
    y: a4Height - 130,
    size: 9.5,
    font: fontBold,
    color: rgb(0.15, 0.45, 0.25)
  });

  // Summary Metrics Banner
  page.drawRectangle({
    x: 40,
    y: a4Height - 200,
    width: a4Width - 80,
    height: 42,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.9, 0.92, 0.96),
    borderWidth: 1
  });

  const drawMetric = (label: string, count: number, x: number, color: ReturnType<typeof rgb>) => {
    page.drawText(`${count}`, {
      x,
      y: a4Height - 180,
      size: 14,
      font: fontBold,
      color
    });
    page.drawText(label, {
      x,
      y: a4Height - 193,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.6)
    });
  };

  drawMetric('Total Requirements', pack.summary.total, 60, rgb(0.1, 0.15, 0.25));
  drawMetric('Matched & Ready', pack.summary.matched, 190, rgb(0.08, 0.5, 0.2));
  drawMetric('Missing Documents', pack.summary.missing, 320, rgb(0.8, 0.15, 0.15));
  drawMetric('Needs Review', pack.summary.needsReview, 450, rgb(0.8, 0.45, 0.05));

  // Requirements Table
  let currentY = a4Height - 225;
  page.drawText('CUSTOMER REQUIREMENT CHECKLIST', {
    x: 40,
    y: currentY,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 16;
  // Table Header
  page.drawRectangle({
    x: 40,
    y: currentY - 4,
    width: a4Width - 80,
    height: 18,
    color: rgb(0.93, 0.95, 0.98)
  });

  page.drawText('Requirement', { x: 50, y: currentY, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  page.drawText('Category', { x: 230, y: currentY, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  page.drawText('Status', { x: 340, y: currentY, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  page.drawText('Matched File / Action', { x: 420, y: currentY, size: 8, font: fontBold, color: rgb(0.2, 0.25, 0.35) });

  currentY -= 18;

  // Render requirement rows
  const matchMap = new Map(pack.matchResults.map((r) => [r.requirementId, r]));

  for (let idx = 0; idx < pack.requirements.length; idx++) {
    const req = pack.requirements[idx];
    const match = matchMap.get(req.id);

    // If page overflow, start new page
    if (currentY < 120) {
      drawWatermark(page);
      page = pdfDoc.addPage([a4Width, a4Height]);
      currentY = a4Height - 50;

      page.drawText('CUSTOMER REQUIREMENT CHECKLIST (CONTINUED)', {
        x: 40,
        y: currentY,
        size: 9.5,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25)
      });
      currentY -= 20;
    }

    // Row alternating background
    if (idx % 2 === 1) {
      page.drawRectangle({
        x: 40,
        y: currentY - 5,
        width: a4Width - 80,
        height: 20,
        color: rgb(0.98, 0.99, 1.0)
      });
    }

    // Requirement title
    const shortTitle = req.title.length > 35 ? req.title.substring(0, 32) + '...' : req.title;
    page.drawText(`${idx + 1}. ${shortTitle}`, {
      x: 50,
      y: currentY,
      size: 8,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25)
    });

    // Category
    const shortCat = req.category.length > 18 ? req.category.substring(0, 16) + '..' : req.category;
    page.drawText(shortCat, {
      x: 230,
      y: currentY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55)
    });

    // Status Pill
    const status = match?.status || (req.required ? 'MISSING' : 'NOT_APPLICABLE');
    let statusText = 'MATCHED';
    let statusColor = rgb(0.08, 0.5, 0.2);

    if (status === 'MISSING') {
      statusText = 'MISSING';
      statusColor = rgb(0.8, 0.15, 0.15);
    } else if (status === 'NEEDS_REVIEW') {
      statusText = 'NEEDS REVIEW';
      statusColor = rgb(0.8, 0.45, 0.05);
    } else if (status === 'DRAFT_AVAILABLE') {
      statusText = 'DRAFT READY';
      statusColor = rgb(0.2, 0.35, 0.85);
    } else if (status === 'NOT_APPLICABLE') {
      statusText = 'OPTIONAL';
      statusColor = rgb(0.5, 0.55, 0.65);
    }

    page.drawText(statusText, {
      x: 340,
      y: currentY,
      size: 7.5,
      font: fontBold,
      color: statusColor
    });

    // Matched File or Note
    const fileLabel = match?.matchedDocName || match?.actionRequired || (req.required ? 'Attachment missing' : 'Not attached');
    const shortFile = fileLabel.length > 25 ? fileLabel.substring(0, 22) + '...' : fileLabel;
    page.drawText(shortFile, {
      x: 420,
      y: currentY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35)
    });

    currentY -= 20;
  }

  // Preflight Findings Block
  currentY -= 12;
  if (currentY < 140) {
    drawWatermark(page);
    page = pdfDoc.addPage([a4Width, a4Height]);
    currentY = a4Height - 50;
  }

  page.drawText('PRE-SUBMISSION CONSISTENCY & VALIDITY FINDINGS', {
    x: 40,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 16;

  const findings = pack.validationResults.slice(0, 4);
  for (const finding of findings) {
    const icon = finding.status === 'PASS' ? '[PASS]' : finding.status === 'REVIEW' ? '[REVIEW]' : '[INFO]';
    const findingText = `${icon} ${finding.title}: ${finding.message}`;
    currentY = drawTextWrapped(page, findingText, 45, currentY, a4Width - 90, 8, fontRegular, rgb(0.25, 0.3, 0.4));
    currentY -= 4;
  }

  // Mandatory Disclaimer Box at Bottom
  const disclaimerY = 32;
  page.drawRectangle({
    x: 40,
    y: disclaimerY - 6,
    width: a4Width - 80,
    height: 38,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.88, 0.9, 0.94),
    borderWidth: 1
  });

  page.drawText(
    'Notice: Customer Pack helps organize and preflight your submission. It does not certify compliance or guarantee',
    {
      x: 48,
      y: disclaimerY + 16,
      size: 7.2,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55)
    }
  );
  page.drawText(
    'acceptance by the customer. Final requirements and acceptance remain strictly with the requesting organization.',
    {
      x: 48,
      y: disclaimerY + 6,
      size: 7.2,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.55)
    }
  );

  drawWatermark(page);

  // Stamped running page numbers
  const totalReportPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalReportPages; i++) {
    const p = pdfDoc.getPage(i);
    p.drawText(`Page ${i + 1} of ${totalReportPages} | Customer Pack Preflight Report`, {
      x: a4Width - 220,
      y: 12,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65)
    });
  }

  return await pdfDoc.save();
}

// =======================================================
// CUSTOMER PACK SUBMISSION DOSSIER PDF BUILDER
// =======================================================

export async function generateCustomerPackSubmissionDossierPdf(
  pack: CustomerPackRecord,
  isWatermarked: boolean = false
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  const fontRegular = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  const a4Width = 595.28;
  const a4Height = 841.89;

  const drawWatermark = (page: PDFPage) => {
    if (!isWatermarked) return;
    const { width, height } = page.getSize();
    page.drawText('PREVIEW - CUSTOMER PACK', {
      x: width * 0.15,
      y: height * 0.4,
      size: 34,
      font: fontBold,
      color: rgb(0.88, 0.88, 0.92),
      rotate: degrees(45)
    });
  };

  // ----------------------------------------------------
  // DOSSIER COVER SHEET (PAGE 1)
  // ----------------------------------------------------
  const coverPage = mergedPdf.addPage([a4Width, a4Height]);

  // Top Accent Bar
  coverPage.drawRectangle({
    x: 0,
    y: a4Height - 8,
    width: a4Width,
    height: 8,
    color: rgb(0.15, 0.25, 0.85)
  });

  coverPage.drawText('CUSTOMER PACK', {
    x: 45,
    y: a4Height - 50,
    size: 22,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.2)
  });

  coverPage.drawText('PRE-SUBMISSION VENDOR REGISTRATION DOSSIER', {
    x: 45,
    y: a4Height - 68,
    size: 9,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  coverPage.drawText(`Prepared: ${currentDateStr} | ID: ${pack.id.substring(0, 8)}`, {
    x: a4Width - 210,
    y: a4Height - 50,
    size: 9,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.6)
  });

  coverPage.drawLine({
    start: { x: 45, y: a4Height - 80 },
    end: { x: a4Width - 45, y: a4Height - 80 },
    thickness: 1,
    color: rgb(0.88, 0.9, 0.94)
  });

  // Target Customer & Supplier Card
  coverPage.drawRectangle({
    x: 45,
    y: a4Height - 165,
    width: a4Width - 90,
    height: 72,
    color: rgb(0.97, 0.98, 1.0),
    borderColor: rgb(0.85, 0.89, 0.96),
    borderWidth: 1
  });

  coverPage.drawText('TARGET CUSTOMER / BUYER:', {
    x: 60,
    y: a4Height - 110,
    size: 8,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });
  coverPage.drawText(pack.customerName || 'Requesting Organization', {
    x: 60,
    y: a4Height - 128,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  coverPage.drawText('SUBMITTING SUPPLIER:', {
    x: 320,
    y: a4Height - 110,
    size: 8,
    font: fontBold,
    color: rgb(0.4, 0.45, 0.55)
  });
  coverPage.drawText(pack.supplierName || 'Business Entity', {
    x: 320,
    y: a4Height - 128,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  coverPage.drawText(`Submission Reference: ${pack.submissionRef || 'Vendor Registration Submission'}`, {
    x: 60,
    y: a4Height - 150,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.5)
  });

  // Section: Preflight Summary
  let currentY = a4Height - 195;
  coverPage.drawText('1. PREFLIGHT CONSISTENCY OVERVIEW', {
    x: 45,
    y: currentY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 16;
  const drawSummaryRow = (label: string, value: string, isAlt: boolean = false) => {
    if (isAlt) {
      coverPage.drawRectangle({
        x: 45,
        y: currentY - 5,
        width: a4Width - 90,
        height: 20,
        color: rgb(0.98, 0.98, 0.99)
      });
    }
    coverPage.drawText(label, { x: 55, y: currentY, size: 8.5, font: fontBold, color: rgb(0.3, 0.35, 0.45) });
    coverPage.drawText(value, { x: 230, y: currentY, size: 8.5, font: fontRegular, color: rgb(0.08, 0.1, 0.15) });
    currentY -= 20;
  };

  drawSummaryRow('Total Customer Requirements:', `${pack.summary.total} defined by customer checklist`, true);
  drawSummaryRow('Matched Attachments:', `${pack.summary.matched} verified against supplied records`);
  drawSummaryRow('Prepared Declarations:', `${pack.declarations.length} formatted on company letterhead style`, true);
  drawSummaryRow('Preflight Consistency Status:', `${pack.summary.matched} of ${pack.summary.total} requirements ready`);

  // Section: Enclosed Attachments Index
  currentY -= 15;
  coverPage.drawText('2. ENCLOSED SUBMISSION ATTACHMENTS (INDEX)', {
    x: 45,
    y: currentY,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25)
  });

  currentY -= 18;
  coverPage.drawRectangle({
    x: 45,
    y: currentY - 4,
    width: a4Width - 90,
    height: 18,
    color: rgb(0.92, 0.94, 0.97)
  });

  coverPage.drawText('Attachment Title', { x: 55, y: currentY, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('Document Type', { x: 340, y: currentY, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
  coverPage.drawText('Location', { x: a4Width - 110, y: currentY, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.35) });

  currentY -= 20;

  // Active documents
  const activeDocs = pack.supplierDocuments.filter((d) => !d.isExcluded);
  activeDocs.forEach((doc, idx) => {
    if (currentY > 80) {
      coverPage.drawText(`${idx + 1}. ${doc.fileName}`, {
        x: 55,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.25)
      });
      coverPage.drawText(doc.detectedType.replace('_', ' ').toUpperCase(), {
        x: 340,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55)
      });
      coverPage.drawText(`Enclosed`, {
        x: a4Width - 110,
        y: currentY,
        size: 8.5,
        font: fontBold,
        color: rgb(0.15, 0.25, 0.85)
      });
      currentY -= 18;
    }
  });

  // Declarations in index
  pack.declarations.forEach((decl, idx) => {
    if (currentY > 80) {
      coverPage.drawText(`${activeDocs.length + idx + 1}. ${decl.title}`, {
        x: 55,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.25)
      });
      coverPage.drawText('DECLARATION (DRAFT)', {
        x: 340,
        y: currentY,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.55)
      });
      coverPage.drawText(`Enclosed`, {
        x: a4Width - 110,
        y: currentY,
        size: 8.5,
        font: fontBold,
        color: rgb(0.15, 0.25, 0.85)
      });
      currentY -= 18;
    }
  });

  // Footer note on Page 1
  coverPage.drawText(
    'Customer Pack Pre-submission Dossier · Ephemeral processing · Minimal data retention',
    {
      x: 45,
      y: 28,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65)
    }
  );

  drawWatermark(coverPage);

  // ----------------------------------------------------
  // APPEND DECLARATIONS AS CLEAN TYPESET A4 PAGES
  // ----------------------------------------------------
  for (const decl of pack.declarations) {
    const declPage = mergedPdf.addPage([a4Width, a4Height]);

    // Top Accent Stripe
    declPage.drawRectangle({
      x: 0,
      y: a4Height - 6,
      width: a4Width,
      height: 6,
      color: rgb(0.15, 0.25, 0.85)
    });

    declPage.drawText(decl.title.toUpperCase(), {
      x: 45,
      y: a4Height - 45,
      size: 13,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.2)
    });

    declPage.drawText('DRAFT DECLARATION — REVIEW AND PRINT ON COMPANY LETTERHEAD BEFORE SIGNING', {
      x: 45,
      y: a4Height - 60,
      size: 7.5,
      font: fontBold,
      color: rgb(0.8, 0.2, 0.2)
    });

    declPage.drawLine({
      start: { x: 45, y: a4Height - 70 },
      end: { x: a4Width - 45, y: a4Height - 70 },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.94)
    });

    // Draw declaration text lines
    const lines = decl.text.split('\n');
    let textY = a4Height - 95;

    for (const line of lines) {
      if (textY < 60) break;
      declPage.drawText(line, {
        x: 45,
        y: textY,
        size: 9,
        font: fontRegular,
        color: rgb(0.15, 0.18, 0.25)
      });
      textY -= 14;
    }

    drawWatermark(declPage);
  }

  // ----------------------------------------------------
  // APPEND SUPPLIER DOCUMENTS
  // ----------------------------------------------------
  for (const doc of activeDocs) {
    if (!doc.storagePath) continue;

    const fileData = await getPacketFileBuffer(doc.storagePath);
    if (!fileData) continue;

    const isImage =
      fileData.mimeType.startsWith('image/') ||
      doc.fileName.toLowerCase().endsWith('.jpg') ||
      doc.fileName.toLowerCase().endsWith('.jpeg') ||
      doc.fileName.toLowerCase().endsWith('.png');

    if (isImage) {
      const imgPage = mergedPdf.addPage([a4Width, a4Height]);
      try {
        let embeddedImage;
        if (fileData.mimeType.includes('png') || doc.fileName.toLowerCase().endsWith('.png')) {
          embeddedImage = await mergedPdf.embedPng(fileData.buffer);
        } else {
          embeddedImage = await mergedPdf.embedJpg(fileData.buffer);
        }

        const maxDisplayWidth = a4Width - 80;
        const maxDisplayHeight = a4Height - 90;
        const scale = Math.min(maxDisplayWidth / embeddedImage.width, maxDisplayHeight / embeddedImage.height);

        imgPage.drawImage(embeddedImage, {
          x: 40 + (maxDisplayWidth - embeddedImage.width * scale) / 2,
          y: 45 + (maxDisplayHeight - embeddedImage.height * scale) / 2,
          width: embeddedImage.width * scale,
          height: embeddedImage.height * scale
        });
      } catch (err) {
        console.warn(`Failed to embed image ${doc.fileName}:`, err);
        imgPage.drawText(`[Attachment: ${doc.fileName}]`, { x: 50, y: a4Height / 2, size: 12, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
      }
      drawWatermark(imgPage);
    } else {
      try {
        const srcPdf = await PDFDocument.load(fileData.buffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((p) => {
          mergedPdf.addPage(p);
          drawWatermark(p);
        });
      } catch (err) {
        console.warn(`Failed to copy PDF pages for ${doc.fileName}:`, err);
      }
    }
  }

  // ----------------------------------------------------
  // STAMP RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // ----------------------------------------------------
  const totalDossierPages = mergedPdf.getPageCount();

  for (let i = 0; i < totalDossierPages; i++) {
    const p = mergedPdf.getPage(i);
    const { width, height } = p.getSize();

    if (i > 0) {
      p.drawText(`Customer Pack Submission — ${pack.supplierName}`, {
        x: 35,
        y: height - 18,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.65)
      });
      p.drawText(`Customer: ${pack.customerName || 'Requesting Organization'}`, {
        x: width - 210,
        y: height - 18,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.65)
      });
    }

    p.drawText(`Page ${i + 1} of ${totalDossierPages} | Customer Pack Submission Dossier`, {
      x: width - 230,
      y: 12,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65)
    });

    p.drawText('Confidential & Statutory Business Registration Record', {
      x: 35,
      y: 12,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.6, 0.65, 0.7)
    });
  }

  return await mergedPdf.save();
}

