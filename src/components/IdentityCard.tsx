'use client';

import React from 'react';
import { Building2, Hash, Landmark, FileBadge2, MapPin, CheckCircle2 } from 'lucide-react';
import { AggregatedExtractedData } from '@/lib/types';

interface IdentityCardProps {
  data: AggregatedExtractedData;
}

export function IdentityCard({ data }: IdentityCardProps) {
  const maskedAccountNo = data.bankAccountNumber
    ? `•••• •••• ${data.bankAccountNumber.slice(-4) || '••••'}`
    : 'Not Extracted';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-neutral-900" />
          <h3 className="font-semibold text-neutral-900 text-xs sm:text-sm">
            Extracted Business Identity & Statutory Identifiers
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-500 bg-white px-2.5 py-0.5 rounded border border-neutral-200 uppercase tracking-wider">
          Vision OCR Extracted
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Tax & Entity Identifiers */}
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
            Primary Tax & Corporate Identifiers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Legal Entity Name</span>
              <span className="font-semibold text-neutral-900 text-xs block mt-0.5 truncate">
                {data.legalName || '—'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Trade / Brand Name</span>
              <span className="font-semibold text-neutral-900 text-xs block mt-0.5 truncate">
                {data.tradeName || 'Not Specified'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F0F4F8] border border-[#D8E2EA]">
              <span className="text-[#234158] text-[11px] font-medium block">GST Identification No (GSTIN)</span>
              <span className="font-mono font-bold text-neutral-900 text-xs block mt-0.5">
                {data.gstin || 'Not Detected'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#F0F4F8] border border-[#D8E2EA]">
              <span className="text-[#234158] text-[11px] font-medium block">Permanent Account No (PAN)</span>
              <span className="font-mono font-bold text-neutral-900 text-xs block mt-0.5">
                {data.pan || 'Not Detected'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Udyam Registration No</span>
              <span className="font-semibold font-mono text-neutral-900 text-xs block mt-0.5">
                {data.udyamNumber || 'Not Attached'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">MSME Category</span>
              <span className="font-semibold text-neutral-900 text-xs block mt-0.5">
                {data.msmeCategory || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Banking Particulars */}
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-neutral-500" />
            <span>Banking Particulars (From Cheque / Statement Proof)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Account Holder Name</span>
              <span className="font-semibold text-neutral-900 text-xs block mt-0.5 truncate">
                {data.bankAccountName || 'Not Detected'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Account Number</span>
              <span className="font-mono font-semibold text-neutral-900 text-xs block mt-0.5">
                {maskedAccountNo}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Bank IFSC Code</span>
              <span className="font-mono font-semibold text-neutral-900 text-xs block mt-0.5">
                {data.bankIfsc || 'Not Detected'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 text-[11px] block">Bank Name</span>
              <span className="font-semibold text-neutral-900 text-xs block mt-0.5 truncate">
                {data.bankName || 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        {data.address && (
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>Registered Business Address</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
              {data.address}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
