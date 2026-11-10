import { CustomerPackAIProvider } from './types';
import { CustomerPackGeminiAIProvider } from './gemini-provider';
import { CustomerPackOpenAICompatibleAIProvider } from './openai-compatible';
import { CustomerPackHeuristicAIProvider } from './heuristic-provider';

export * from './types';
export * from './heuristic-provider';
export * from './gemini-provider';
export * from './openai-compatible';

let cachedProvider: CustomerPackAIProvider | null = null;

export function getCustomerPackAIProvider(): CustomerPackAIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const requestedProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

  if (requestedProvider === 'heuristic' || requestedProvider === 'mock') {
    cachedProvider = new CustomerPackHeuristicAIProvider();
    return cachedProvider;
  }

  if (requestedProvider === 'gemini') {
    cachedProvider = new CustomerPackGeminiAIProvider();
    return cachedProvider;
  }

  if (requestedProvider === 'groq') {
    cachedProvider = new CustomerPackOpenAICompatibleAIProvider({
      name: 'groq',
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.2-11b-vision-preview'
    });
    return cachedProvider;
  }

  if (requestedProvider === 'openrouter') {
    cachedProvider = new CustomerPackOpenAICompatibleAIProvider({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free'
    });
    return cachedProvider;
  }

  // AUTO-DETECTION HIERARCHY
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AIzaSy_placeholder')) {
    cachedProvider = new CustomerPackGeminiAIProvider();
    return cachedProvider;
  }

  if (process.env.GROQ_API_KEY) {
    cachedProvider = new CustomerPackOpenAICompatibleAIProvider({
      name: 'groq',
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.2-11b-vision-preview'
    });
    return cachedProvider;
  }

  if (process.env.OPENROUTER_API_KEY) {
    cachedProvider = new CustomerPackOpenAICompatibleAIProvider({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free'
    });
    return cachedProvider;
  }

  // Zero-cost, zero-key safe default
  cachedProvider = new CustomerPackHeuristicAIProvider();
  return cachedProvider;
}
