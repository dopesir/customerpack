'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';
import { AggregatedExtractedData } from '@/lib/types';

interface DocumentChecklistProps {
  data: AggregatedExtractedData;
}

export function DocumentChecklist({ data }: DocumentChecklistProps) {
  const docTypes = new Set(data.documents.map((d) => d.type));

  const items = [
    {
      label: 'GST Registration Certificate (REG-06)',
      isPresent: docTypes.has('gst_certificate') || !!data.gstin,
      isRequired: true,
      note: data.gstin ? `GSTIN: ${data.gstin}` : 'Required for tax invoice vendor setup'
    },
    {
      label: 'Permanent Account Number (PAN) Card',
      isPresent: docTypes.has('pan_card') || !!data.pan,
      isRequired: true,
      note: data.pan ? `PAN: ${data.pan}` : 'Required for TDS & corporate linkage'
    },
    {
      label: 'Cancelled Cheque / Bank Account Proof',
      isPresent: docTypes.has('bank_proof') || !!data.bankAccountNumber,
      isRequired: true,
      note: data.bankAccountName
        ? `Account Name: ${data.bankAccountName} (${data.isPrePrintedCheque ? 'Pre-printed' : 'Handwritten'})`
        : 'Required for NEFT/RTGS mandate creation'
    },
    {
      label: 'Udyam / MSME Registration Certificate',
      isPresent: docTypes.has('udyam_certificate') || !!data.udyamNumber,
      isRequired: false,
      note: data.udyamNumber
        ? `Udyam: ${data.udyamNumber} (${data.msmeCategory || 'MSME'})`
        : 'Recommended for MSME status documentation'
    },
    {
      label: 'Constitution Proof (COI / Partnership Deed)',
      isPresent:
        docTypes.has('incorporation_certificate') ||
        docTypes.has('partnership_deed') ||
        docTypes.has('other'),
      isRequired: false,
      note: 'Recommended for Pvt Ltd, LLP, and Partnership entities'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden p-6 sm:p-7 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-neutral-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-neutral-900" />
            <span>Document Presence Checklist</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Overview of required statutory proofs and optional registration attachments
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
              item.isPresent
                ? 'bg-neutral-50/70 border-neutral-200'
                : item.isRequired
                ? 'bg-[#FDEBEC]/40 border-[#F6C7C9]'
                : 'bg-[#FBF3DB]/40 border-[#F1DFAB]'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-1 rounded-full flex-shrink-0 mt-0.5 ${
                  item.isPresent
                    ? 'text-[#235327] bg-[#EDF3EC]'
                    : item.isRequired
                    ? 'text-[#8C2220] bg-[#FDEBEC]'
                    : 'text-[#785100] bg-[#FBF3DB]'
                }`}
              >
                {item.isPresent ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-xs">
                  {item.label}
                  {item.isRequired && (
                    <span className="text-[9px] font-mono text-neutral-700 font-medium ml-2 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 uppercase tracking-wider">
                      Required
                    </span>
                  )}
                </p>
                <p className="text-neutral-500 text-[11px] font-mono mt-0.5">{item.note}</p>
              </div>
            </div>

            <div className="self-end sm:self-center">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border ${
                  item.isPresent
                    ? 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]'
                    : item.isRequired
                    ? 'bg-[#FDEBEC] text-[#8C2220] border-[#F6C7C9]'
                    : 'bg-[#FBF3DB] text-[#785100] border-[#F1DFAB]'
                }`}
              >
                {item.isPresent ? 'DETECTED' : item.isRequired ? 'MISSING' : 'OPTIONAL'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
