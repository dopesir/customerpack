'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface SamplePackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SamplePackModal({ isOpen, onClose }: SamplePackModalProps) {
  const [activeTab, setActiveTab] = useState<'cover' | 'toc' | 'checks'>('cover');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-neutral-200">
        {/* Faux-OS Minimalist Window Chrome */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
            </div>
            <div className="ml-1 flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-950">Sample Vendor Dossier Preview</span>
              <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                {'//'} ACME ENGINEERING PVT LTD
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200/80 bg-white px-5">
          <button
            onClick={() => setActiveTab('cover')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'cover'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-950'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>01. Cover &amp; Business Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('toc')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'toc'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>02. Table of Contents &amp; Index</span>
          </button>
          <button
            onClick={() => setActiveTab('checks')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'checks'
                ? 'border-neutral-950 text-neutral-950 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-950'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>03. Preflight Consistency Matrix</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100/50">
          {activeTab === 'cover' && (
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 max-w-2xl mx-auto text-neutral-800 text-xs sm:text-sm space-y-5">
              <div className="border-t-2 border-neutral-950 pt-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-base font-bold text-neutral-950 tracking-tight">VENDOR REGISTRATION DOSSIER</h2>
                    <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wide">
                      Preflight Verified &amp; Indexed Submission Pack
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-mono text-neutral-500">
                    <p>Date: 07 Sep 2026</p>
                    <p>Ref: VP-9603R</p>
                  </div>
                </div>
              </div>

              {/* Score Box */}
              <div className="p-3.5 bg-[#EDF3EC] border border-[#D2E3D0] rounded-lg flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#235327]">Readiness Score: 92 / 100 — Submission Ready</p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">All primary statutory proofs linked with high consistency.</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-white text-[#235327] border border-[#D2E3D0] text-[10px] font-mono font-bold">
                  PASS
                </span>
              </div>

              {/* Identity Table */}
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                  1. Statutory Business Identifiers
                </h4>
                <div className="grid grid-cols-2 gap-2 bg-neutral-50/60 p-3.5 rounded-lg border border-neutral-200 text-xs">
                  <div><span className="text-neutral-500">Legal Entity:</span> <strong className="text-neutral-950">ACME ENGINEERING PVT LTD</strong></div>
                  <div><span className="text-neutral-500">Trade Name:</span> <strong className="text-neutral-950">ACME FABRICATORS</strong></div>
                  <div><span className="text-neutral-500">GSTIN:</span> <strong className="font-mono text-neutral-950">27AABCU9603R1ZM</strong></div>
                  <div><span className="text-neutral-500">PAN:</span> <strong className="font-mono text-neutral-950">AABCU9603R</strong></div>
                  <div><span className="text-neutral-500">Udyam No:</span> <strong className="text-neutral-950">UDYAM-MH-01-0012345</strong></div>
                  <div><span className="text-neutral-500">Constitution:</span> <strong className="text-neutral-950">Private Limited</strong></div>
                </div>
              </div>

              {/* Banking Particulars */}
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                  2. Banking &amp; Disbursement Details
                </h4>
                <div className="grid grid-cols-2 gap-2 bg-neutral-50/60 p-3.5 rounded-lg border border-neutral-200 text-xs">
                  <div><span className="text-neutral-500">Account Name:</span> <strong className="text-neutral-950">ACME ENGINEERING PVT LTD</strong></div>
                  <div><span className="text-neutral-500">Bank Name:</span> <strong className="text-neutral-950">HDFC Bank Ltd</strong></div>
                  <div><span className="text-neutral-500">Account No:</span> <strong className="font-mono text-neutral-950">50200012345678</strong></div>
                  <div><span className="text-neutral-500">IFSC Code:</span> <strong className="font-mono text-neutral-950">HDFC0000128</strong></div>
                </div>
              </div>

              {/* Attachments Index */}
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                  3. Enclosed Attachments Index
                </h4>
                <ul className="text-xs space-y-1.5 text-neutral-700 border border-neutral-200 rounded-lg p-3.5 bg-neutral-50/60 font-sans">
                  <li className="flex justify-between"><span>1. GST Registration Certificate</span> <strong className="font-mono text-neutral-900">Page 3</strong></li>
                  <li className="flex justify-between"><span>2. Permanent Account Number (PAN) Card</span> <strong className="font-mono text-neutral-900">Page 4</strong></li>
                  <li className="flex justify-between"><span>3. Cancelled Bank Cheque (Pre-printed Name)</span> <strong className="font-mono text-neutral-900">Page 5</strong></li>
                  <li className="flex justify-between"><span>4. Udyam MSME Registration Certificate</span> <strong className="font-mono text-neutral-900">Page 6</strong></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'toc' && (
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 max-w-2xl mx-auto space-y-4 text-xs sm:text-sm">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-sm font-bold text-neutral-950">Table of Contents &amp; Submission Index</h3>
                <p className="text-xs text-neutral-500">Hyperlinked pagination stamped across attached records</p>
              </div>

              <div className="space-y-2">
                {[
                  { title: 'GST Registration Certificate (REG-06)', page: 'Page 3', status: 'PASS', pages: '2 pages' },
                  { title: 'PAN Card (Corporate Entity)', page: 'Page 5', status: 'PASS', pages: '1 page' },
                  { title: 'Cancelled Cheque (Pre-Printed Entity Name)', page: 'Page 6', status: 'PASS', pages: '1 page' },
                  { title: 'Udyam Registration Certificate', page: 'Page 7', status: 'PASS', pages: '1 page' }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-neutral-50/60 rounded-lg border border-neutral-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-neutral-950 text-xs sm:text-sm">{i + 1}. {item.title}</p>
                      <p className="text-[11px] text-neutral-500">{item.pages} · Preserved original high-res scan</p>
                    </div>
                    <span className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 font-mono font-medium rounded text-xs">
                      {item.page}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-[#FBF3DB] border border-[#F1DFAB] rounded-lg text-xs text-[#785100] space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#785100]" />
                  Preflight Audit Summary:
                </p>
                <p className="text-neutral-700 text-[11px]">
                  GSTIN-to-PAN structure matched. Bank account holder name matches legal entity. No handwritten cheque ambiguity.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'checks' && (
            <div className="space-y-2.5 max-w-2xl mx-auto text-xs">
              <div className="p-3.5 bg-[#EDF3EC] border border-[#D2E3D0] rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#235327] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#235327]">GSTIN ↔ PAN Structural Match — PASS</h4>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    GSTIN (27AABCU9603R1ZM) correctly embeds entity PAN (AABCU9603R). State code: 27 (Maharashtra).
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#EDF3EC] border border-[#D2E3D0] rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#235327] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#235327]">Business Name ↔ Bank Proof Consistency — PASS</h4>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    Bank account holder name (&quot;ACME ENGINEERING PVT LTD&quot;) aligns with legal entity name.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FBF3DB] border border-[#F1DFAB] rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#785100] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#785100]">Udyam MSME Registration Proof — PASS</h4>
                  <p className="text-neutral-600 text-[11px] mt-0.5">
                    Udyam registration document detected (UDYAM-MH-01-0012345). Confirm applicability and buyer requirements separately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-200/80 bg-neutral-50/90 flex items-center justify-between">
          <p className="text-xs text-neutral-500 hidden sm:block">
            No account required · Ephemeral in-memory processing
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Close
            </button>
            <Link
              href="/pack/new"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-2xs"
            >
              <span>Check My Documents — Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
