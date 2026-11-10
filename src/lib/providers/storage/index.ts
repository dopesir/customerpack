import { CustomerPackStorageProvider } from './types';
import { CustomerPackMemoryStorageProvider } from './memory-provider';
import { CustomerPackSupabaseStorageProvider } from './supabase-provider';

export * from './types';
export * from './memory-provider';
export * from './supabase-provider';

let cachedStorage: CustomerPackStorageProvider | null = null;

export function getCustomerPackStorageProvider(): CustomerPackStorageProvider {
  if (cachedStorage) {
    return cachedStorage;
  }

  const requestedProvider = (process.env.DATABASE_PROVIDER || '').toLowerCase().trim();

  if (requestedProvider === 'supabase') {
    cachedStorage = new CustomerPackSupabaseStorageProvider();
    return cachedStorage;
  }

  if (requestedProvider === 'memory' || requestedProvider === 'ephemeral') {
    cachedStorage = new CustomerPackMemoryStorageProvider();
    return cachedStorage;
  }

  // AUTO-DETECTION: Check if valid Supabase credentials exist
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http') && !url.includes('placeholder') && !url.includes('xyzcompany')) {
    cachedStorage = new CustomerPackSupabaseStorageProvider();
    return cachedStorage;
  }

  // Default: Zero-cost, zero-setup in-memory provider
  cachedStorage = new CustomerPackMemoryStorageProvider();
  return cachedStorage;
}
