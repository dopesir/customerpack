import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CustomerPackStorageProvider } from './types';
import { CustomerPackRecord, VendorPacketRecord } from '@/lib/types';
import { CustomerPackMemoryStorageProvider } from './memory-provider';

export class CustomerPackSupabaseStorageProvider implements CustomerPackStorageProvider {
  name = 'supabase';
  private supabase: SupabaseClient | null = null;
  private memoryFallback: CustomerPackMemoryStorageProvider;

  constructor() {
    this.memoryFallback = new CustomerPackMemoryStorageProvider();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && url.startsWith('http') && !url.includes('placeholder') && !url.includes('xyzcompany')) {
      try {
        this.supabase = createClient(url, key);
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
  }

  async saveCustomerPack(pack: CustomerPackRecord): Promise<void> {
    await this.memoryFallback.saveCustomerPack(pack);
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from('customer_packs').upsert({
        id: pack.id,
        access_token: pack.accessToken,
        supplier_name: pack.supplierName,
        customer_name: pack.customerName,
        submission_ref: pack.submissionRef,
        deadline: pack.deadline,
        requirements: pack.requirements,
        supplier_documents: pack.supplierDocuments,
        checks_config: pack.checksConfig,
        match_results: pack.matchResults,
        declarations: pack.declarations,
        validation_results: pack.validationResults,
        readiness_score: pack.readinessScore,
        summary: pack.summary,
        final_order: pack.finalOrder,
        is_paid: pack.isPaid,
        payment_id: pack.paymentId,
        paid_at: pack.paidAt,
        is_purged: pack.isPurged,
        expires_at: pack.expiresAt
      });
      if (error) {
        console.warn('Supabase customer_packs upsert warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase customer pack sync error:', err);
    }
  }

  async getCustomerPack(packId: string): Promise<CustomerPackRecord | null> {
    const memoryRecord = await this.memoryFallback.getCustomerPack(packId);
    if (memoryRecord) return memoryRecord;

    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('customer_packs')
        .select('*')
        .eq('id', packId)
        .single();

      if (error || !data || data.is_purged) return null;

      const pack: CustomerPackRecord = {
        id: data.id,
        accessToken: data.access_token,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        supplierName: data.supplier_name,
        customerName: data.customer_name,
        submissionRef: data.submission_ref,
        deadline: data.deadline,
        customerFiles: data.customer_files || [],
        requirements: data.requirements || [],
        supplierDocuments: data.supplier_documents || [],
        checksConfig: data.checks_config,
        matchResults: data.match_results || [],
        declarations: data.declarations || [],
        validationResults: data.validation_results || [],
        readinessScore: data.readiness_score || 0,
        summary: data.summary || { total: 0, matched: 0, missing: 0, needsReview: 0, draftsAvailable: 0 },
        finalOrder: data.final_order || [],
        isPaid: data.is_paid || false,
        paymentId: data.payment_id,
        paidAt: data.paid_at,
        isPurged: data.is_purged || false
      };

      await this.memoryFallback.saveCustomerPack(pack);
      return pack;
    } catch (err) {
      console.warn('Failed to retrieve customer pack from Supabase:', err);
      return null;
    }
  }

  async purgeCustomerPack(packId: string): Promise<boolean> {
    await this.memoryFallback.purgeCustomerPack(packId);

    if (this.supabase) {
      try {
        const { data: files } = await this.supabase.storage.from('vendor_packets').list(packId);
        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${packId}/${f.name}`);
          await this.supabase.storage.from('vendor_packets').remove(filePaths);
        }

        await this.supabase
          .from('customer_packs')
          .update({
            is_purged: true,
            supplier_name: '[PURGED]',
            customer_name: null,
            requirements: [],
            supplier_documents: [],
            declarations: [],
            match_results: [],
            validation_results: []
          })
          .eq('id', packId);
      } catch (err) {
        console.warn('Supabase customer pack purge error:', err);
      }
    }

    return true;
  }

  async savePacket(record: VendorPacketRecord): Promise<void> {
    await this.memoryFallback.savePacket(record);
  }

  async getPacket(packetId: string): Promise<VendorPacketRecord | null> {
    return this.memoryFallback.getPacket(packetId);
  }

  async storeFile(
    packetId: string,
    fileName: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<string> {
    const fileKey = await this.memoryFallback.storeFile(packetId, fileName, buffer, mimeType);

    if (this.supabase) {
      try {
        const { error } = await this.supabase.storage
          .from('vendor_packets')
          .upload(fileKey, buffer, { contentType: mimeType, upsert: true });

        if (error) {
          console.warn('Supabase file upload warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase file upload error:', err);
      }
    }

    return fileKey;
  }

  async getFile(
    fileKey: string
  ): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | null> {
    const memoryFile = await this.memoryFallback.getFile(fileKey);
    if (memoryFile) return memoryFile;

    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase.storage.from('vendor_packets').download(fileKey);
      if (error || !data) return null;

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = data.type || 'application/octet-stream';
      const fileName = fileKey.split('/').pop() || 'document';

      return { buffer, mimeType, fileName };
    } catch (err) {
      console.warn('Supabase getFile error:', err);
      return null;
    }
  }

  async purgePacket(packetId: string): Promise<boolean> {
    return this.memoryFallback.purgePacket(packetId);
  }
}
