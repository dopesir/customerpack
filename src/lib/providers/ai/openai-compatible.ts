import { CustomerPackAIProvider, CustomerRequirementExtractionResult } from './types';
import { DocumentExtractionResult, DocumentExtractionResultSchema } from '@/lib/types';
import { CustomerPackHeuristicAIProvider } from './heuristic-provider';

export interface CustomerPackOpenAIConfig {
  name?: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export class CustomerPackOpenAICompatibleAIProvider implements CustomerPackAIProvider {
  name: string;
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private heuristicFallback: CustomerPackHeuristicAIProvider;

  constructor(config?: CustomerPackOpenAIConfig) {
    this.name = config?.name || 'openai-compatible';
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || '';
    this.baseURL = config?.baseURL || process.env.OPENAI_BASE_URL || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1');
    this.model = config?.model || process.env.OPENAI_MODEL || (process.env.GROQ_API_KEY ? 'llama-3.2-11b-vision-preview' : 'meta-llama/llama-3.2-11b-vision-instruct:free');
    this.heuristicFallback = new CustomerPackHeuristicAIProvider();
  }

  async extractDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }

    try {
      const base64Data = fileBuffer.toString('base64');
      const dataUri = `data:${mimeType.includes('pdf') ? 'application/pdf' : mimeType};base64,${base64Data}`;

      const prompt = `You are an expert Indian statutory business document analyzer.
Extract all statutory business fields from this Indian business document (${fileName}).
Return strictly valid JSON conforming to:
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

      const res = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUri } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        throw new Error(`Vision API error ${res.status}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const parsedJson = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());

      const validated = DocumentExtractionResultSchema.parse({
        ...parsedJson,
        originalFileName: fileName
      });

      return validated as DocumentExtractionResult;
    } catch (error) {
      console.warn(`OpenAI-compatible extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractDocument(fileBuffer, mimeType, fileName);
    }
  }

  async extractCustomerRequirements(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string,
    customerNameHint?: string
  ): Promise<CustomerRequirementExtractionResult> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      return this.heuristicFallback.extractCustomerRequirements(fileBuffer, mimeType, fileName, customerNameHint);
    }

    try {
      const base64Data = fileBuffer.toString('base64');
      const dataUri = `data:${mimeType.includes('pdf') ? 'application/pdf' : mimeType};base64,${base64Data}`;

      const prompt = `You are an expert Indian corporate vendor empanelment analyst.
Extract all required onboarding documents and declarations from this customer checklist (${fileName}).
Return strictly valid JSON conforming to:
{
  "detectedCustomerName": string or null,
  "detectedSubmissionPurpose": string or null,
  "requirements": [
    {
      "id": string,
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

      const res = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUri } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI-compatible requirement extraction error ${res.status}`);
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const parsedJson = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());

      const { CustomerRequirementsExtractionSchema } = await import('@/lib/types');
      const validated = CustomerRequirementsExtractionSchema.parse(parsedJson);

      return {
        requirements: validated.requirements,
        detectedCustomerName: validated.detectedCustomerName || customerNameHint || null,
        detectedSubmissionPurpose: validated.detectedSubmissionPurpose || 'Vendor Empanelment'
      };
    } catch (error) {
      console.warn(`OpenAI-compatible requirement extraction failed for ${fileName}, falling back to smart heuristic:`, error);
      return this.heuristicFallback.extractCustomerRequirements(fileBuffer, mimeType, fileName, customerNameHint);
    }
  }
}
