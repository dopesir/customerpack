import { GoogleGenerativeAI } from '@google/generative-ai';
import { CustomerPackAIProvider, CustomerRequirementExtractionResult } from './types';
import { DocumentExtractionResult, DocumentExtractionResultSchema } from '@/lib/types';
import { CustomerPackHeuristicAIProvider } from './heuristic-provider';

export const EXTRACTION_SYSTEM_INSTRUCTION = `
You are an expert Indian statutory business document analyzer.
Your task is to analyze the provided image or PDF document and extract company identity, tax identifiers, banking details, and validity information with high precision.

CRITICAL RULES:
1. NEVER guess or hallucinate. If a field is blurred, absent, or unreadable, set value to null and confidence to 0.0.
2. For PAN: Must be a 10-character alphanumeric string (e.g. ABCDE1234F).
3. For GSTIN: Must be a 15-character string (e.g. 27ABCDE1234F1Z5).
4. For Cheques: Identify whether the account holder name is pre-printed by the bank or handwritten.
5. Classify the document type accurately into one of: 'gst_certificate', 'pan_card', 'bank_proof', 'udyam_certificate', 'incorporation_certificate', 'partnership_deed', 'vendor_form', 'other'.
6. Return ONLY a valid JSON object strictly conforming to the requested schema. No markdown backticks, no markdown formatting.
`;

export const REQUIREMENT_EXTRACTION_SYSTEM_INSTRUCTION = `
You are an expert Indian corporate vendor empanelment and qualification analyst.
Your task is to analyze the provided customer vendor registration form, questionnaire, email checklist, or onboarding instructions, and extract every demanded document, statutory proof, certificate, declaration, or form into structured requirement objects.

CRITICAL RULES:
1. NEVER invent requirements. Only extract what is explicitly or directly requested by the customer.
2. Distinguish between mandatory requirements (required: true) and optional or situational requirements (required: false).
3. If an item says "as applicable" or "if registered", mark required as false and add notes.
4. Categorize each requirement into one of:
   'Company Information' | 'Tax / Statutory' | 'Banking' | 'Registration' | 'Quality' | 'Safety' | 'Insurance' | 'Legal' | 'Declarations' | 'Customer Forms' | 'Other'
5. Identify the requirement type:
   'DOCUMENT' | 'FORM' | 'DECLARATION' | 'INFORMATION' | 'SIGNATURE' | 'STAMP' | 'FORMAT' | 'DATE' | 'OTHER'
6. Capture any requested format constraints (e.g. "On company letterhead", "Self-attested copy", "Original cancelled cheque", "PDF format").
7. Provide the source reference (e.g. "Section 3.1", "Page 1 Checklist item 4", or direct excerpt).
8. Return ONLY a valid JSON object strictly conforming to the requested schema. No markdown formatting.
`;

export class CustomerPackGeminiAIProvider implements CustomerPackAIProvider {
  name = 'gemini';
  private apiKey: string;
  private modelName: string;
  private heuristicFallback: CustomerPackHeuristicAIProvider;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.heuristicFallback = new CustomerPackHeuristicAIProvider();
  }

  async extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('AIzaSy_placeholder')) {
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const base64Data = fileBuffer.toString('base64');
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType
        }
      };

      const prompt = `Extract all statutory business fields from this Indian business document (${fileName}).
Return a JSON object with this exact structure:
{
  "detectedType": "gst_certificate" | "pan_card" | "bank_proof" | "udyam_certificate" | "incorporation_certificate" | "partnership_deed" | "vendor_form" | "other",
  "typeConfidence": number (0.0 to 1.0),
  "extractedData": {
    "legalName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "tradeName": { "value": string | null, "confidence": number, "rawTextSnippet": string },
    "pan": { "value": string | null, "confidence": number },
    "gstin": { "value": string | null, "confidence": number },
    "udyamNumber": { "value": string | null, "confidence": number },
    "bankDetails": {
      "accountHolderName": { "value": string | null, "confidence": number, "isPrePrinted": boolean },
      "accountNumber": { "value": string | null, "confidence": number },
      "ifsc": { "value": string | null, "confidence": number },
      "bankName": { "value": string | null, "confidence": number }
    }
  },
  "readabilityIssues": string[]
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

      const validated = DocumentExtractionResultSchema.parse({
        ...parsedJson,
        originalFileName: fileName
      });

      return validated as DocumentExtractionResult;
    } catch (error) {
      console.warn(`Gemini extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }
  }

  async extractCustomerRequirements(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string,
    customerNameHint?: string
  ): Promise<CustomerRequirementExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('AIzaSy_placeholder')) {
      return this.heuristicFallback.extractCustomerRequirements(fileBuffer, mimeType, fileName, customerNameHint);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: REQUIREMENT_EXTRACTION_SYSTEM_INSTRUCTION,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const base64Data = fileBuffer.toString('base64');
      const part = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType
        }
      };

      const prompt = `Extract all vendor onboarding and registration document requirements from this customer checklist (${fileName}).
Return a JSON object with this exact structure:
{
  "detectedCustomerName": string or null,
  "detectedSubmissionPurpose": string or null,
  "requirements": [
    {
      "id": string (unique short ID),
      "title": string,
      "description": string,
      "category": "Company Information" | "Tax / Statutory" | "Banking" | "Registration" | "Quality" | "Safety" | "Insurance" | "Legal" | "Declarations" | "Customer Forms" | "Other",
      "type": "DOCUMENT" | "FORM" | "DECLARATION" | "INFORMATION" | "SIGNATURE" | "STAMP" | "FORMAT" | "DATE" | "OTHER",
      "required": boolean,
      "source_reference": {
        "fileName": "${fileName}",
        "section": string,
        "excerpt": string
      },
      "requested_format": string,
      "notes": string,
      "confidence": number
    }
  ]
}`;

      const result = await model.generateContent([prompt, part]);
      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

      const { CustomerRequirementsExtractionSchema } = await import('@/lib/types');
      const validated = CustomerRequirementsExtractionSchema.parse(parsedJson);

      return {
        requirements: validated.requirements,
        detectedCustomerName: validated.detectedCustomerName || customerNameHint || null,
        detectedSubmissionPurpose: validated.detectedSubmissionPurpose || 'Vendor Empanelment'
      };
    } catch (error) {
      console.warn(`Gemini requirement extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractCustomerRequirements(fileBuffer, mimeType, fileName, customerNameHint);
    }
  }
}
