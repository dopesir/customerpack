import { z } from 'zod';

export type DocumentType =
  | 'gst_certificate'
  | 'pan_card'
  | 'bank_proof'
  | 'udyam_certificate'
  | 'incorporation_certificate'
  | 'partnership_deed'
  | 'vendor_form'
  | 'other';

export type CheckStatus = 'PASS' | 'REVIEW' | 'MISSING' | 'NOT_CHECKED';

export interface DocumentExtractionResult {
  documentId: string;
  originalFileName: string;
  detectedType: DocumentType;
  typeConfidence: number; // 0.0 to 1.0
  
  extractedData: {
    legalName?: { value: string | null; confidence: number; rawTextSnippet?: string };
    tradeName?: { value: string | null; confidence: number; rawTextSnippet?: string };
    signatoryOrProprietorName?: { value: string | null; confidence: number; rawTextSnippet?: string };
    pan?: { value: string | null; confidence: number; rawTextSnippet?: string };
    gstin?: { value: string | null; confidence: number; rawTextSnippet?: string };
    udyamNumber?: { value: string | null; confidence: number; rawTextSnippet?: string };
    msmeCategory?: { value: 'Micro' | 'Small' | 'Medium' | 'Unknown'; confidence: number };
    
    bankDetails?: {
      accountHolderName?: { value: string | null; confidence: number; isPrePrinted: boolean };
      accountNumber?: { value: string | null; confidence: number };
      ifsc?: { value: string | null; confidence: number };
      bankName?: { value: string | null; confidence: number };
    };
    
    address?: {
      fullAddress: string | null;
      city?: string;
      state?: string;
      pincode?: string;
      confidence: number;
    };
    
    dates?: {
      registrationDate?: string | null;
      expiryDate?: string | null;
      issueDate?: string | null;
    };
  };
  
  readabilityIssues: string[];
}

export interface AggregatedExtractedData {
  companyName?: string;
  legalName?: string;
  tradeName?: string;
  signatoryName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  msmeCategory?: 'Micro' | 'Small' | 'Medium' | 'Unknown';
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  isPrePrintedCheque?: boolean;
  address?: string;
  pincode?: string;
  state?: string;
  city?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    isPrePrinted?: boolean;
  };
  documents: {
    id: string;
    fileName: string;
    type: DocumentType;
    confidence: number;
    issues: string[];
    isExcluded?: boolean;
    displayOrder?: number;
  }[];
}

export interface PreflightCheckResult {
  id: string;
  category: 'Identity' | 'Banking' | 'Compliance' | 'Document';
  title: string;
  status: CheckStatus;
  message: string;
  details?: string;
}

export interface ScoringBreakdown {
  completenessScore: number; // max 40
  consistencyScore: number;   // max 30
  bankingScore: number;       // max 20
  ocrQualityScore: number;    // max 10
  totalScore: number;         // 0 - 100
  scoreBand: 'Submission-Ready' | 'Review Advised' | 'Action Required';
  scoreSummary: string;
}

export interface EnclosedDocumentItem {
  id: string;
  title: string;
  documentType: DocumentType;
  fileName: string;
  startPage: number;
  pageCount: number;
}

export interface DocumentFileBuffer {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  buffer: Uint8Array | Buffer;
}

export interface PacketGenerationConfig {
  packetId: string;
  companyName: string;
  displayNameType: 'legal' | 'trade';
  legalName?: string;
  tradeName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  signatoryName?: string;
  contactEmail?: string;
  contactMobile?: string;
  readinessScore: number;
  isWatermarked: boolean;
  documentItems: EnclosedDocumentItem[];
  documentFiles: DocumentFileBuffer[];
}

export interface VendorPacketRecord {
  id: string;
  accessToken?: string;
  createdAt: string;
  expiresAt: string;
  companyName: string;
  legalName?: string;
  tradeName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  signatoryName?: string;
  contactEmail?: string;
  contactMobile?: string;
  readinessScore: number;
  scoringBreakdown: ScoringBreakdown;
  extractedData: AggregatedExtractedData;
  validationResults: PreflightCheckResult[];
  documents: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    detectedType: DocumentType;
    typeConfidence: number;
    displayOrder: number;
    isExcluded: boolean;
    storagePath?: string;
    base64Data?: string;
  }[];
  isPaid: boolean;
  paymentId?: string;
  paymentPlan?: 'single' | 'five_pack';
  paidAt?: string;
  isPurged: boolean;
}

// Zod schema for extraction validation
export const ExtractedFieldSchema = z.object({
  value: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0),
  rawTextSnippet: z.string().optional()
});

export const DocumentExtractionResultSchema = z.object({
  documentId: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  originalFileName: z.string(),
  detectedType: z.enum([
    'gst_certificate',
    'pan_card',
    'bank_proof',
    'udyam_certificate',
    'incorporation_certificate',
    'partnership_deed',
    'vendor_form',
    'other'
  ]),
  typeConfidence: z.number().min(0).max(1).default(0.8),
  extractedData: z.object({
    legalName: ExtractedFieldSchema.optional(),
    tradeName: ExtractedFieldSchema.optional(),
    signatoryOrProprietorName: ExtractedFieldSchema.optional(),
    pan: ExtractedFieldSchema.optional(),
    gstin: ExtractedFieldSchema.optional(),
    udyamNumber: ExtractedFieldSchema.optional(),
    msmeCategory: z.object({
      value: z.enum(['Micro', 'Small', 'Medium', 'Unknown']),
      confidence: z.number()
    }).optional(),
    bankDetails: z.object({
      accountHolderName: z.object({
        value: z.string().nullable().optional(),
        confidence: z.number(),
        isPrePrinted: z.boolean().default(true)
      }).optional(),
      accountNumber: ExtractedFieldSchema.optional(),
      ifsc: ExtractedFieldSchema.optional(),
      bankName: ExtractedFieldSchema.optional()
    }).optional(),
    address: z.object({
      fullAddress: z.string().nullable().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      confidence: z.number().default(0)
    }).optional(),
    dates: z.object({
      registrationDate: z.string().nullable().optional(),
      expiryDate: z.string().nullable().optional(),
      issueDate: z.string().nullable().optional()
    }).optional()
  }).default({}),
  readabilityIssues: z.array(z.string()).default([])
});

// =======================================================
// CUSTOMER PACK EXTENSION TYPES & SCHEMAS
// =======================================================

export type RequirementCategory =
  | 'Company Information'
  | 'Tax / Statutory'
  | 'Banking'
  | 'Registration'
  | 'Quality'
  | 'Safety'
  | 'Insurance'
  | 'Legal'
  | 'Declarations'
  | 'Customer Forms'
  | 'Other';

export type RequirementType =
  | 'DOCUMENT'
  | 'FORM'
  | 'DECLARATION'
  | 'INFORMATION'
  | 'SIGNATURE'
  | 'STAMP'
  | 'FORMAT'
  | 'DATE'
  | 'OTHER';

export type MatchStatus =
  | 'MATCHED'
  | 'MISSING'
  | 'NEEDS_REVIEW'
  | 'DRAFT_AVAILABLE'
  | 'USER_ACTION_REQUIRED'
  | 'NOT_APPLICABLE'
  | 'USER_CONFIRMED';

export interface CustomerRequirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  type: RequirementType;
  required: boolean;
  source_reference?: {
    fileName?: string;
    page?: number;
    section?: string;
    excerpt?: string;
  };
  requested_format?: string;
  acceptableFormats?: string[];
  notes?: string;
  confidence: number;
  isCustom?: boolean;
}

export interface SupplierDocument {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  detectedType: DocumentType;
  typeConfidence: number;
  pageCount?: number;
  displayOrder: number;
  isExcluded: boolean;
  storagePath?: string;
  base64Data?: string;
  extractedData?: any;
  issues: string[];
  usedFor?: string;
}

export interface CustomCheckRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ConfigurableChecks {
  checkPresenceRequired: boolean;
  checkPresenceOptional: boolean;
  checkReadability: boolean;
  checkPageCounts: boolean;
  checkLegalNameConsistency: boolean;
  checkPanConsistency: boolean;
  checkGstPanLinkage: boolean;
  checkBankNameConsistency: boolean;
  checkPreprintedCheque: boolean;
  checkExpiryDates: boolean;
  expiryThresholdDays: number;
  checkFormatRequirements: boolean;
  customRules: CustomCheckRule[];
}

export interface RequirementMatchResult {
  requirementId: string;
  matchedDocId?: string;
  matchedDocName?: string;
  status: MatchStatus;
  reason: string;
  confidence: 'High' | 'Medium' | 'Low';
  actionRequired?: string;
  suggestedAction?: 'draft_declaration' | 'upload_file' | 'confirm' | 'ignore';
  draftDeclarationId?: string;
}

export interface DeclarationDraft {
  id: string;
  requirementId?: string;
  title: string;
  category: string;
  text: string;
  status: 'DRAFT' | 'USER_CONFIRMED' | 'INCLUDED_IN_PACK';
  isIncludedInPack: boolean;
  variables: {
    supplierName: string;
    customerName?: string;
    address?: string;
    signatoryName?: string;
    signatoryTitle?: string;
    date?: string;
  };
}

export interface CustomerPackRecord {
  id: string;
  accessToken: string;
  createdAt: string;
  expiresAt: string;
  supplierName: string;
  customerName?: string;
  submissionRef?: string;
  deadline?: string;
  customerFiles: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
  }[];
  requirements: CustomerRequirement[];
  supplierDocuments: SupplierDocument[];
  checksConfig: ConfigurableChecks;
  matchResults: RequirementMatchResult[];
  declarations: DeclarationDraft[];
  validationResults: PreflightCheckResult[];
  readinessScore: number;
  scoringBreakdown?: ScoringBreakdown;
  summary: {
    total: number;
    matched: number;
    missing: number;
    needsReview: number;
    draftsAvailable: number;
  };
  finalOrder: string[]; // item IDs (documents + declarations)
  isPaid: boolean;
  paymentId?: string;
  paymentPlan?: 'single' | 'five_pack';
  paidAt?: string;
  isPurged: boolean;
  extractedIdentity?: {
    legalName?: string;
    tradeName?: string;
    pan?: string;
    gstin?: string;
    udyamNumber?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankName?: string;
    isPrePrinted?: boolean;
  };
}

export const CustomerRequirementSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string(),
  description: z.string().default(''),
  category: z.enum([
    'Company Information',
    'Tax / Statutory',
    'Banking',
    'Registration',
    'Quality',
    'Safety',
    'Insurance',
    'Legal',
    'Declarations',
    'Customer Forms',
    'Other'
  ]).default('Other'),
  type: z.enum([
    'DOCUMENT',
    'FORM',
    'DECLARATION',
    'INFORMATION',
    'SIGNATURE',
    'STAMP',
    'FORMAT',
    'DATE',
    'OTHER'
  ]).default('DOCUMENT'),
  required: z.boolean().default(true),
  source_reference: z.object({
    fileName: z.string().optional(),
    page: z.number().optional(),
    section: z.string().optional(),
    excerpt: z.string().optional()
  }).optional(),
  requested_format: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.85),
  isCustom: z.boolean().optional().default(false)
});

export const CustomerRequirementsExtractionSchema = z.object({
  requirements: z.array(CustomerRequirementSchema),
  detectedCustomerName: z.string().nullable().optional(),
  detectedSubmissionPurpose: z.string().nullable().optional()
});

