'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileCheck2,
  FileDown,
  ShieldCheck,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';

export function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden" id="demo">
      {/* Faux-OS Minimalist Window Chrome */}
      <div className="bg-neutral-50/90 px-4 py-3 border-b border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
          </div>
          <span className="text-[11px] font-mono text-neutral-500 ml-2">
            simulator {'//'} industrial-buyer-rfq-7.pdf
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
            Status: Deterministic Check
          </span>
          <Link
            href="/pack/new"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-medium transition-all"
          >
            <span>Run on Your Files</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Step Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-200/80 bg-white text-xs">
        {[
          { step: 1, label: '01. Requirement', meta: 'Checklist Parsed' },
          { step: 2, label: '02. Documents', meta: 'Supplier Files' },
          { step: 3, label: '03. Preflight', meta: 'Discrepancy Matrix' },
          { step: 4, label: '04. Dossier', meta: 'Compiled Output' }
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setActiveStep(item.step as any)}
            className={`p-3.5 text-left border-r last:border-r-0 border-neutral-200/80 transition-all ${
              activeStep === item.step
                ? 'bg-neutral-50/80 text-neutral-950 font-bold border-b-2 border-b-neutral-950'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px]">{item.label}</span>
              {activeStep === item.step && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              )}
            </div>
            <span className="text-[11px] text-neutral-500 font-normal block mt-0.5">{item.meta}</span>
          </button>
        ))}
      </div>

      {/* Interactive Step Views */}
      <div className="p-5 sm:p-7 min-h-[380px] bg-white">
        {/* STEP 1: CUSTOMER REQUIREMENT */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/70">
              <div>
                <h4 className="text-sm font-bold text-neutral-950">Customer Empanelment Checklist (7 Items Extracted)</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Extracted via multimodal document parser from buyer RFQ instructions.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded border border-neutral-200/60 self-start sm:self-auto">
                Buyer: L&amp;T Heavy Engineering (Fictional)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { title: 'GST Registration Certificate (REG-06)', cat: 'Tax / Statutory', req: true, note: 'All pages required' },
                { title: 'Company PAN Card', cat: 'Tax / Statutory', req: true, note: 'Entity PAN matching GST' },
                { title: 'Cancelled Cheque or Bank Mandate', cat: 'Banking', req: true, note: 'Pre-printed name preferred' },
                { title: 'MSME Udyam Registration', cat: 'Registration', req: false, note: 'Optional for small enterprise' },
                { title: 'Non-Blacklisting Undertaking', cat: 'Declarations', req: true, note: 'Required on company letterhead' },
                { title: 'Anti-Bribery & Code of Conduct', cat: 'Declarations', req: true, note: 'Signed declaration' }
              ].map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/30 flex items-start justify-between gap-3 text-xs hover:border-neutral-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-900 block">{r.title}</span>
                    <span className="text-[11px] text-neutral-500">{r.cat} · {r.note}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      r.req
                        ? 'bg-[#FDEBEC] text-[#8C2220] border-[#F6C7C9]'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {r.req ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-200/70 text-xs text-neutral-500">
              <span>Automatic extraction maps document type, format constraints, and required clauses.</span>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="font-semibold text-neutral-900 hover:text-neutral-700 inline-flex items-center gap-1"
              >
                <span>Next: Match Your Documents</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: YOUR DOCUMENTS */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/70">
              <div>
                <h4 className="text-sm font-bold text-neutral-950">Supplier Records Uploaded (4 Files)</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Classified against extracted customer requirements with confidence scoring.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded border border-neutral-200/60 self-start sm:self-auto">
                Supplier: Apex Precision Engineering LLP
              </span>
            </div>

            <div className="space-y-2">
              {[
                { file: 'GST_Certificate_2024.pdf', type: 'GST Registration Certificate', conf: '99%', matched: 'Matches: GST Registration Certificate (REG-06)' },
                { file: 'PAN_Card_Apex.jpg', type: 'Permanent Account Number', conf: '98%', matched: 'Matches: Company PAN Card' },
                { file: 'Cheque_HDFC_Apex.png', type: 'Cancelled Cheque', conf: '96%', matched: 'Matches: Cancelled Cheque (Pre-printed name)' },
                { file: 'Udyam_MH01_Apex.pdf', type: 'Udyam MSME Certificate', conf: '97%', matched: 'Matches: MSME Udyam Registration' }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-neutral-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center text-neutral-700 flex-shrink-0 font-mono text-[11px]">
                      0{idx + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-950">{doc.file}</span>
                      <span className="text-[11px] text-neutral-500 block">{doc.matched}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[10px]">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200/60">
                      {doc.type}
                    </span>
                    <span className="bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0] px-2 py-0.5 rounded">
                      {doc.conf} Confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-200/70 text-xs text-neutral-500">
              <span>Customer Pack automatically detects missing items and suggests letterhead drafts.</span>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="font-semibold text-neutral-900 hover:text-neutral-700 inline-flex items-center gap-1"
              >
                <span>Next: Inspect Preflight Results</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PREFLIGHT RESULTS */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/70">
              <div>
                <h4 className="text-sm font-bold text-neutral-950">Preflight Discrepancy Matrix</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Evaluates mandatory presence, entity name consistency, and GSTIN-PAN linkage.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0] px-2.5 py-1 rounded">
                  Score: 85/100
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-[#D2E3D0] bg-[#EDF3EC]/50 flex items-start gap-2.5 text-xs text-[#235327]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#235327]" />
                <div>
                  <span className="font-bold">GSTIN ↔ PAN Structural Match Passed</span>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    GSTIN (27AABCU9603R1ZM) correctly embeds PAN (AABCU9603R) in characters 3–12.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[#D2E3D0] bg-[#EDF3EC]/50 flex items-start gap-2.5 text-xs text-[#235327]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#235327]" />
                <div>
                  <span className="font-bold">Entity Name Consistency Verified</span>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    &quot;Apex Precision Engineering LLP&quot; matches across GST certificate, PAN, and Bank proof.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-[#D8E2EA] bg-[#F0F4F8]/60 flex items-start gap-2.5 text-xs text-[#234158]">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#234158]" />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">Non-Blacklisting Declaration Required</span>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Customer requires declaration. Ready to draft and typeset on company letterhead.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white text-[#234158] border border-[#D8E2EA] px-2 py-0.5 rounded self-start sm:self-auto">
                    Draft Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-200/70 text-xs text-neutral-500">
              <span>Free Preflight Report PDF can be downloaded immediately.</span>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="font-semibold text-neutral-900 hover:text-neutral-700 inline-flex items-center gap-1"
              >
                <span>Next: Final Submission Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMISSION DOSSIER */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/70">
              <div>
                <h4 className="text-sm font-bold text-neutral-950">Final Compiled Dossier (Single PDF)</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Assembles cover, index, sequential page numbers, and typeset signed undertakings.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded border border-neutral-200/60 self-start sm:self-auto">
                Total: 6 Indexed Pages
              </span>
            </div>

            <div className="p-4 rounded-lg border border-neutral-200/80 bg-neutral-50/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2 text-neutral-600 text-[11px]">
                <span>SECTION / DOCUMENT</span>
                <span>PAGINATION</span>
              </div>
              <div className="flex items-center justify-between text-neutral-900 font-sans">
                <span className="font-semibold">01. Branded Customer Cover Sheet</span>
                <span className="font-mono text-neutral-500 text-[11px]">Page 1 of 6</span>
              </div>
              <div className="flex items-center justify-between text-neutral-900 font-sans">
                <span className="font-semibold">02. Requirements Compliance Index &amp; TOC</span>
                <span className="font-mono text-neutral-500 text-[11px]">Page 2 of 6</span>
              </div>
              <div className="flex items-center justify-between text-neutral-900 font-sans">
                <span className="font-semibold">03. GST Certificate (REG-06)</span>
                <span className="font-mono text-neutral-500 text-[11px]">Page 3 of 6</span>
              </div>
              <div className="flex items-center justify-between text-neutral-900 font-sans">
                <span className="font-semibold">04. Company PAN Card &amp; Bank Cheque</span>
                <span className="font-mono text-neutral-500 text-[11px]">Pages 4–5 of 6</span>
              </div>
              <div className="flex items-center justify-between text-neutral-900 font-sans">
                <span className="font-semibold">05. Typeset Non-Blacklisting Undertaking</span>
                <span className="font-mono text-neutral-500 text-[11px]">Page 6 of 6</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-neutral-200/70 text-xs">
              <span className="text-neutral-500">Unlocked instantly for ₹299 (or preview free with watermark).</span>
              <Link
                href="/pack/new"
                className="font-bold text-neutral-950 hover:text-neutral-800 inline-flex items-center gap-1.5"
              >
                <span>Create Your Pack Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}