import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { extractDocumentWithGemini } from '@/lib/gemini';
import { getCustomerPack, saveCustomerPack, storePacketFile, verifyCustomerPackAccess } from '@/lib/storage';
import { matchCustomerRequirements } from '@/lib/matching';
import { SupplierDocument } from '@/lib/types';

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
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No document files provided.' }, { status: 400 });
    }

    if (pack.supplierDocuments.length + files.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 documents allowed in a single customer pack.' }, { status: 400 });
    }

    const newDocs: SupplierDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 15MB size limit.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'application/pdf';

      // Store file in private storage
      const storagePath = await storePacketFile(packId, file.name, buffer, mimeType);

      // Extract & Classify with Gemini Flash / Smart Heuristic
      const extraction = await extractDocumentWithGemini(buffer, mimeType, file.name);

      const docRecord: SupplierDocument = {
        id: extraction.documentId || `doc_${crypto.randomBytes(4).toString('hex')}`,
        fileName: file.name,
        fileSize: file.size,
        mimeType,
        detectedType: extraction.detectedType,
        typeConfidence: extraction.typeConfidence,
        pageCount: mimeType.includes('pdf') ? 1 : 1, // Will be updated during PDF compile
        displayOrder: pack.supplierDocuments.length + i + 1,
        isExcluded: false,
        storagePath,
        extractedData: extraction.extractedData,
        issues: extraction.readabilityIssues || []
      };

      newDocs.push(docRecord);

      // Merge statutory identifiers into pack extracted identity if available
      pack.extractedIdentity = pack.extractedIdentity || {};
      const data = extraction.extractedData;
      if (data.legalName?.value && !pack.extractedIdentity.legalName) {
        pack.extractedIdentity.legalName = data.legalName.value;
      }
      if (data.tradeName?.value && !pack.extractedIdentity.tradeName) {
        pack.extractedIdentity.tradeName = data.tradeName.value;
      }
      if (data.pan?.value && !pack.extractedIdentity.pan) {
        pack.extractedIdentity.pan = data.pan.value;
      }
      if (data.gstin?.value && !pack.extractedIdentity.gstin) {
        pack.extractedIdentity.gstin = data.gstin.value;
      }
      if (data.udyamNumber?.value && !pack.extractedIdentity.udyamNumber) {
        pack.extractedIdentity.udyamNumber = data.udyamNumber.value;
      }
      if (data.bankDetails) {
        if (data.bankDetails.accountHolderName?.value && !pack.extractedIdentity.bankAccountName) {
          pack.extractedIdentity.bankAccountName = data.bankDetails.accountHolderName.value;
          pack.extractedIdentity.isPrePrinted = data.bankDetails.accountHolderName.isPrePrinted;
        }
        if (data.bankDetails.accountNumber?.value && !pack.extractedIdentity.bankAccountNumber) {
          pack.extractedIdentity.bankAccountNumber = data.bankDetails.accountNumber.value;
        }
        if (data.bankDetails.ifsc?.value && !pack.extractedIdentity.bankIfsc) {
          pack.extractedIdentity.bankIfsc = data.bankDetails.ifsc.value;
        }
        if (data.bankDetails.bankName?.value && !pack.extractedIdentity.bankName) {
          pack.extractedIdentity.bankName = data.bankDetails.bankName.value;
        }
      }
    }

    pack.supplierDocuments.push(...newDocs);

    // Re-run matching and checks
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

    await saveCustomerPack(pack);

    return NextResponse.json({
      success: true,
      pack,
      addedDocuments: newDocs
    });
  } catch (err: any) {
    console.error('Upload documents error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to upload documents.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { packId: string } }) {
  const { packId } = params;
  const token = extractToken(req);
  const docId = req.nextUrl.searchParams.get('docId');

  const pack = await getCustomerPack(packId);
  if (!pack || pack.isPurged) {
    return NextResponse.json({ error: 'Customer pack not found or has expired.' }, { status: 404 });
  }

  const isAuthorized = await verifyCustomerPackAccess(packId, token);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized access to customer pack.' }, { status: 403 });
  }

  if (!docId) {
    return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
  }

  pack.supplierDocuments = pack.supplierDocuments.filter((d) => d.id !== docId);

  // Re-run matching
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

  await saveCustomerPack(pack);

  return NextResponse.json({
    success: true,
    pack
  });
}