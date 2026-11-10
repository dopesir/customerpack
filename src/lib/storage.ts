import { getCustomerPackStorageProvider } from './providers/storage';
import { CustomerPackRecord, VendorPacketRecord } from './types';

export { getCustomerPackStorageProvider } from './providers/storage';

export async function saveCustomerPack(pack: CustomerPackRecord): Promise<void> {
  const provider = getCustomerPackStorageProvider();
  return provider.saveCustomerPack(pack);
}

export async function getCustomerPack(packId: string): Promise<CustomerPackRecord | null> {
  const provider = getCustomerPackStorageProvider();
  return provider.getCustomerPack(packId);
}

export async function verifyCustomerPackAccess(packId: string, accessToken?: string): Promise<boolean> {
  const pack = await getCustomerPack(packId);
  if (!pack || pack.isPurged) return false;

  if (!accessToken) {
    return process.env.NODE_ENV === 'development';
  }

  return pack.accessToken === accessToken;
}

export async function purgeCustomerPack(packId: string): Promise<boolean> {
  const provider = getCustomerPackStorageProvider();
  return provider.purgeCustomerPack(packId);
}

export async function savePacketRecord(record: VendorPacketRecord): Promise<void> {
  const provider = getCustomerPackStorageProvider();
  return provider.savePacket(record);
}

export async function getPacketRecord(packetId: string): Promise<VendorPacketRecord | null> {
  const provider = getCustomerPackStorageProvider();
  return provider.getPacket(packetId);
}

export async function storePacketFile(
  packetId: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const provider = getCustomerPackStorageProvider();
  return provider.storeFile(packetId, fileName, buffer, mimeType);
}

export async function getPacketFileBuffer(
  fileKey: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
  const provider = getCustomerPackStorageProvider();
  return provider.getFile(fileKey);
}

export async function purgePacketCompletely(packetId: string): Promise<boolean> {
  const provider = getCustomerPackStorageProvider();
  return provider.purgePacket(packetId);
}
