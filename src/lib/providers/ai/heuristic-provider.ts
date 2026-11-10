import { CustomerPackAIProvider, CustomerRequirementExtractionResult } from './types';
import { DocumentExtractionResult, DocumentType } from '@/lib/types';

export class CustomerPackHeuristicAIProvider implements CustomerPackAIProvider {
  name = 'heuristic';

  async extractDocument(
    _fileBuffer: Buffer,
    _mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    return this.generateSmartMockExtraction(fileName);
  }

  async extractCustomerRequirements(
    _fileBuffer: Buffer,
    _mimeType: string,
    fileName: string,
    customerNameHint?: string
  ): Promise<CustomerRequirementExtractionResult> {
    return this.generateSmartMockRequirements(fileName, customerNameHint);
  }

  generateSmartMockExtraction(fileName: string): DocumentExtractionResult {
    const lower = fileName.toLowerCase();
    const docId = Math.random().toString(36).substring(2, 9);

    let detectedType: DocumentType = 'other';
    const typeConfidence = 0.95;

    if (lower.includes('gst') || lower.includes('tax') || lower.includes('reg')) {
      detectedType = 'gst_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.98, rawTextSnippet: 'Legal Name: ACME ENGINEERING PRIVATE LIMITED' },
          tradeName: { value: 'ACME FABRICATORS', confidence: 0.95, rawTextSnippet: 'Trade Name: ACME FABRICATORS' },
          gstin: { value: '27AABCU9603R1ZM', confidence: 0.99, rawTextSnippet: 'GSTIN: 27AABCU9603R1ZM' },
          pan: { value: 'AABCU9603R', confidence: 0.98, rawTextSnippet: 'PAN: AABCU9603R' },
          address: {
            fullAddress: 'Plot 42, MIDC Industrial Area, Phase II, Pune 411018, Maharashtra',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411018',
            confidence: 0.94
          },
          dates: {
            registrationDate: '01/07/2017',
            issueDate: '05/08/2017'
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('pan')) {
      detectedType = 'pan_card';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.98,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.96, rawTextSnippet: 'Name: ACME ENGINEERING PRIVATE LIMITED' },
          pan: { value: 'AABCU9603R', confidence: 0.99, rawTextSnippet: 'Permanent Account Number: AABCU9603R' },
          dates: {
            issueDate: '14/03/2015'
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('cheque') || lower.includes('bank') || lower.includes('passbook')) {
      detectedType = 'bank_proof';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.96,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PVT LTD', confidence: 0.94 },
          bankDetails: {
            accountHolderName: { value: 'ACME ENGINEERING PVT LTD', confidence: 0.96, isPrePrinted: true },
            accountNumber: { value: '50200012345678', confidence: 0.98 },
            ifsc: { value: 'HDFC0000128', confidence: 0.99 },
            bankName: { value: 'HDFC Bank Ltd', confidence: 0.95 }
          },
          address: {
            fullAddress: 'HDFC Bank, FC Road Branch, Pune 411004',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411004',
            confidence: 0.9
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('udyam') || lower.includes('msme')) {
      detectedType = 'udyam_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.97,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.96 },
          tradeName: { value: 'ACME FABRICATORS', confidence: 0.94 },
          udyamNumber: { value: 'UDYAM-MH-01-0012345', confidence: 0.99 },
          msmeCategory: { value: 'Small', confidence: 0.95 },
          address: {
            fullAddress: 'Plot 42, MIDC Industrial Area, Pune 411018',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411018',
            confidence: 0.92
          }
        },
        readabilityIssues: []
      };
    }

    if (lower.includes('coi') || lower.includes('incorporation') || lower.includes('deed')) {
      detectedType = 'incorporation_certificate';
      return {
        documentId: docId,
        originalFileName: fileName,
        detectedType,
        typeConfidence: 0.92,
        extractedData: {
          legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.95 },
          dates: {
            registrationDate: '12/02/2015'
          }
        },
        readabilityIssues: []
      };
    }

    return {
      documentId: docId,
      originalFileName: fileName,
      detectedType: 'other',
      typeConfidence: 0.7,
      extractedData: {
        legalName: { value: 'ACME ENGINEERING PRIVATE LIMITED', confidence: 0.8 }
      },
      readabilityIssues: ['Document type could not be strictly classified as statutory proof.']
    };
  }

  generateSmartMockRequirements(
    fileName: string,
    customerName?: string
  ): CustomerRequirementExtractionResult {
    const buyerName = customerName || 'Example Industrial Buyer';

    return {
      detectedCustomerName: buyerName,
      detectedSubmissionPurpose: 'New Vendor Registration & Code Creation',
      requirements: [
        {
          id: 'req_gst',
          title: 'GST Registration Certificate (Form REG-06)',
          description: 'Complete 3-page GST registration certificate showing legal name, trade name, principal place of business, and active status.',
          category: 'Tax / Statutory',
          type: 'DOCUMENT',
          required: true,
          source_reference: {
            fileName,
            section: 'Section 2.1 — Mandatory Statutory Records',
            excerpt: 'Enclose copy of GST Certificate (all 3 annexure pages mandatory).'
          },
          requested_format: 'Self-attested PDF scan (all 3 pages)',
          notes: 'Ensure GSTIN embeds the company/proprietor PAN.',
          confidence: 0.98,
          isCustom: false
        },
        {
          id: 'req_pan',
          title: 'Permanent Account Number (PAN) Card',
          description: 'Copy of PAN card issued to the entity (company, LLP, partnership, or individual proprietor).',
          category: 'Tax / Statutory',
          type: 'DOCUMENT',
          required: true,
          source_reference: {
            fileName,
            section: 'Section 2.2 — Direct Tax Registration',
            excerpt: 'Attach clear copy of PAN Card matching business legal name.'
          },
          requested_format: 'Clear scan / PDF',
          notes: 'Name must match legal registration documents.',
          confidence: 0.98,
          isCustom: false
        },
        {
          id: 'req_bank',
          title: 'Bank Verification Proof (Cancelled Cheque / Mandate)',
          description: 'Original cancelled cheque or bank-stamped mandate form showing entity name, account number, and 11-digit IFSC code.',
          category: 'Banking',
          type: 'DOCUMENT',
          required: true,
          source_reference: {
            fileName,
            section: 'Section 3.0 — Disbursement Account Details',
            excerpt: 'Provide pre-printed cancelled cheque or bank mandate letter with account holder name, account number, and IFSC code.'
          },
          requested_format: 'Pre-printed cheque leaf or stamped bank letter',
          notes: 'Pre-printed entity name is preferred to avoid accounts payable delays.',
          confidence: 0.95,
          isCustom: false
        },
        {
          id: 'req_udyam',
          title: 'Udyam / MSME Registration Certificate',
          description: 'Current Udyam registration certificate confirming enterprise category (Micro, Small, or Medium).',
          category: 'Registration',
          type: 'DOCUMENT',
          required: false,
          source_reference: {
            fileName,
            section: 'Section 4.1 — MSME Classification',
            excerpt: 'If registered under MSME Act 2006, attach copy of Udyam Registration Certificate.'
          },
          requested_format: 'Official Udyam portal PDF',
          notes: 'Required if claiming MSME statutory payment cycle benefits.',
          confidence: 0.92,
          isCustom: false
        },
        {
          id: 'req_quality',
          title: 'Quality Management Certificate (ISO 9001 / Equivalent)',
          description: 'Valid ISO 9001 quality system certificate covering scope of supplied items or services.',
          category: 'Quality',
          type: 'DOCUMENT',
          required: false,
          source_reference: {
            fileName,
            section: 'Section 5.0 — Quality & Capability',
            excerpt: 'Attach valid ISO 9001 certificate or self-certified quality manual if certified.'
          },
          requested_format: 'Valid certificate scan with current expiry date',
          notes: 'Confirm certificate validity date before submission.',
          confidence: 0.88,
          isCustom: false
        },
        {
          id: 'req_debarment',
          title: 'Non-Blacklisting & Debarment Declaration',
          description: 'Formal declaration on supplier letterhead confirming the firm has not been blacklisted or debarred by any PSU, government body, or corporate entity.',
          category: 'Declarations',
          type: 'DECLARATION',
          required: true,
          source_reference: {
            fileName,
            section: 'Annexure B — Debarment Undertaking',
            excerpt: 'Undertaking of Non-Blacklisting / Non-Debarment duly signed by authorized partner/director on company letterhead.'
          },
          requested_format: 'Signed and stamped declaration on company letterhead',
          notes: 'Can be auto-drafted and verified prior to print & stamp.',
          confidence: 0.96,
          isCustom: false
        },
        {
          id: 'req_vendor_form',
          title: 'Customer Vendor Registration Form',
          description: 'Completed customer empanelment questionnaire with commercial, manufacturing, and contact particulars.',
          category: 'Customer Forms',
          type: 'FORM',
          required: true,
          source_reference: {
            fileName,
            section: 'Form Header — Part A General Information',
            excerpt: 'Submit duly filled and signed Customer Vendor Registration Form.'
          },
          requested_format: 'Filled, signed, and stamped PDF/scan',
          notes: 'Must be placed directly after the preflight cover in submission pack.',
          confidence: 0.94,
          isCustom: false
        }
      ]
    };
  }
}
