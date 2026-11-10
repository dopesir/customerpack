import { DocumentExtractionResult, CustomerRequirement } from '@/lib/types';

export interface CustomerRequirementExtractionResult {
  requirements: CustomerRequirement[];
  detectedCustomerName?: string | null;
  detectedSubmissionPurpose?: string | null;
}

export interface CustomerPackAIProvider {
  name: string;
  extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult>;
  extractCustomerRequirements(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string,
    customerNameHint?: string
  ): Promise<CustomerRequirementExtractionResult>;
}
