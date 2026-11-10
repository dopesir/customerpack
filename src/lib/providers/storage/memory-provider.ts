import { CustomerPackStorageProvider } from './types';
import { CustomerPackRecord, VendorPacketRecord } from '@/lib/types';

export class CustomerPackMemoryStorageProvider implements CustomerPackStorageProvider {
  name = 'memory';
  private customerPackStore: Map<string, CustomerPackRecord>;
  private vendorPacketStore: Map<string, VendorPacketRecord>;
  private fileStore: Map<string, { buffer: Buffer; mimeType: string; fileName: string }>;

  constructor() {
    this.customerPackStore =
      (globalThis as any).__customerPackStore || new Map<string, CustomerPackRecord>();
    (globalThis as any).__customerPackStore = this.customerPackStore;

    this.vendorPacketStore =
      (globalThis as any).__vendorPacketStore || new Map<string, VendorPacketRecord>();
    (globalThis as any).__vendorPacketStore = this.vendorPacketStore;

    this.fileStore =
      (globalThis as any).__customerPackFileStore ||
      new Map<string, { buffer: Buffer; mimeType: string; fileName: string }>();
    (globalThis as any).__customerPackFileStore = this.fileStore;
  }

  async saveCustomerPack(pack: CustomerPackRecord): Promise<void> {
    this.customerPackStore.set(pack.id, pack);
  }

  async getCustomerPack(packId: string): Promise<CustomerPackRecord | null> {
    const pack = this.customerPackStore.get(packId);
    if (!pack || pack.isPurged) {
      return null;
    }
    return pack;
  }

  async purgeCustomerPack(packId: string): Promise<boolean> {
    const pack = this.customerPackStore.get(packId);
    if (pack) {
      pack.isPurged = true;
      pack.supplierName = '[PURGED]';
      pack.customerName = undefined;
      pack.requirements = [];
      pack.supplierDocuments = [];
      pack.declarations = [];
      pack.matchResults = [];
      pack.validationResults = [];
      this.customerPackStore.set(packId, pack);
    }

    const keysToDelete: string[] = [];
    this.fileStore.forEach((_, key) => {
      if (key.startsWith(`${packId}/`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.fileStore.delete(key));

    return true;
  }

  async savePacket(record: VendorPacketRecord): Promise<void> {
    this.vendorPacketStore.set(record.id, record);
  }

  async getPacket(packetId: string): Promise<VendorPacketRecord | null> {
    const record = this.vendorPacketStore.get(packetId);
    if (!record || record.isPurged) {
      return null;
    }
    return record;
  }

  async storeFile(
    packetId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `${packetId}/${Date.now()}_${safeName}`;
    this.fileStore.set(fileKey, { buffer, mimeType, fileName });
    return fileKey;
  }

  async getFile(
    fileKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const file = this.fileStore.get(fileKey);
    return file || null;
  }

  async purgePacket(packetId: string): Promise<boolean> {
    const packet = this.vendorPacketStore.get(packetId);
    if (packet) {
      packet.isPurged = true;
      this.vendorPacketStore.set(packetId, packet);
    }

    const keysToDelete: string[] = [];
    this.fileStore.forEach((_, key) => {
      if (key.startsWith(`${packetId}/`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.fileStore.delete(key));

    return true;
  }
}
