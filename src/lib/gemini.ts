import { getCustomerPackAIProvider, CustomerPackHeuristicAIProvider } from './providers/ai';
import { DocumentExtractionResult, CustomerRequirement } from './types';

export {
  EXTRACTION_SYSTEM_INSTRUCTION,
  REQUIREMENT_EXTRACTION_SYSTEM_INSTRUCTION
} from './providers/ai/gemini-provider';

export type { CustomerRequirementExtractionResult } from './providers/ai/types';

export async function extractDocumentWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<DocumentExtractionResult> {
  const provider = getCustomerPackAIProvider();
  return provider.extractDocument(fileBuffer, mimeType, fileName);
}

export async function extractCustomerRequirementsWithGemini(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  customerNameHint?: string
) {
  const provider = getCustomerPackAIProvider();
  return provider.extractCustomerRequirements(fileBuffer, mimeType, fileName, customerNameHint);
}

export function generateSmartMockExtraction(fileName: string): DocumentExtractionResult {
  const heuristic = new CustomerPackHeuristicAIProvider();
  return heuristic.generateSmartMockExtraction(fileName);
}

export function generateSmartMockRequirements(
  fileName: string,
  customerName?: string
) {
  const heuristic = new CustomerPackHeuristicAIProvider();
  return heuristic.generateSmartMockRequirements(fileName, customerName);
}
