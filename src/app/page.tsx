'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InteractiveDemo } from '@/components/InteractiveDemo';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Sliders,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Does this guarantee my customer will approve me as a vendor?',
      a: 'No. Customer Pack is a preparation, validation, and assembly instrument. It checks your records against rules you configure and customer requirements you upload. Final commercial and empanelment approval rests entirely with the requesting customer.'
    },
    {
      q: 'What formats can I upload for customer requirements?',
      a: 'You can upload customer vendor registration checklists, RFQ instructions, vendor questionnaires, or buyer onboarding guidelines in PDF, Word (DOCX), Excel (XLSX, XLS), or image (PNG, JPG) formats.'
    },
    {
      q: 'How does Customer Pack match documents if the customer uses different wording?',
      a: 'Customer Pack maps requested items against standard Indian statutory records (GST REG-06, PAN Card, Cancelled Cheque, MSME Udyam, Incorporation/COI, Partnership Deeds, ISO certificates). You can manually review, reassign, or add custom requirements at any point.'
    },
    {
      q: 'What happens to my uploaded business documents after I finish?',
      a: 'Customer Pack operates on an ephemeral in-memory model. Files are retained for a maximum of 48 hours for your private session and can be permanently wiped immediately at any time with the 1-click "Delete This Pack" button.'
    },
    {
      q: 'Can I draft custom undertakings on my company letterhead?',
      a: 'Yes. Customer Pack includes built-in Indian statutory templates (Non-Blacklisting / Debarment, Anti-Bribery & Code of Conduct, Sole Proprietorship, and MSME Applicability). You can edit them live, copy text to your clipboard, or have them typeset directly into the compiled PDF dossier.'
    },
    {
      q: 'Can I still compile the dossier if an item is missing or flagged?',
      a: 'Yes. Customer Pack never blocks you from assembling your pack. It surfaces clear findings in your preflight matrix so you can make informed decisions before submitting to your customer.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-950 selection:text-white font-sans">
      <Navbar />

      {/* 1. HERO SECTION (Fits initial viewport, max 20 words subtext, no AI purple) */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-neutral-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Subtle Technical Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Customer Requirement → Preflight → Submission Kit</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-[-0.03em] leading-[1.12]">
            Turn a Customer&apos;s Vendor Checklist Into a Submission-Ready Pack.
          </h1>

          {/* Subtext (concise, under 20 words) */}
          <p className="text-base sm:text-lg text-neutral-600 max-w-[55ch] mx-auto leading-relaxed">
            Match supplier records against buyer requirements. Run configurable consistency checks. Compile an indexed PDF dossier.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/pack/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-xs text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              <span>Build My Pack — Free Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-xs text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-200 transition-all"
            >
              <span>Inspect 60s Preflight Demo</span>
            </a>
          </div>

          <p className="text-[11px] text-neutral-500 font-mono pt-1">
            Engineered by Nobuswork for Indian industrial suppliers, fabricators, and commercial contractors.
          </p>
        </div>
      </section>

      {/* 2. INTERACTIVE SIMULATOR (Faux-OS Window Chrome) */}
      <section className="py-16 md:py-24 bg-neutral-50/50 border-b border-neutral-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-left space-y-1 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              Interactive Preflight Walkthrough
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Test how raw customer requirements are parsed, matched against supplier documents, and compiled.
            </p>
          </div>

          <InteractiveDemo />
        </div>
      </section>

      {/* 3. INPUT / OUTPUT ARCHITECTURE (Crisp Bento Grid) */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-200/80" id="what-you-get">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-left space-y-1 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              What You Give Us · What You Receive
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              No complex setup. Upload the customer checklist sheet and your existing statutory business records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Inputs */}
            <div className="p-7 rounded-xl border border-neutral-200/90 bg-neutral-50/30 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3">
                <span className="text-xs font-mono font-bold text-neutral-900 uppercase">Input Requirements</span>
                <span className="text-[11px] font-mono text-neutral-500">PDF, DOCX, XLSX, Images</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-200/70 flex items-center justify-center font-mono text-[10px] text-neutral-800 flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Customer Requirement Document</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      Buyer vendor empanelment checklist, RFQ attachment, questionnaire, or procurement instructions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-200/70 flex items-center justify-center font-mono text-[10px] text-neutral-800 flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Supplier Proof Records</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      GST certificate (REG-06), PAN card, cancelled cheque or bank mandate, MSME Udyam certificate, ISO certificates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-neutral-200/70 flex items-center justify-center font-mono text-[10px] text-neutral-800 flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Verification Rule Preferences</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      Choose which rules to enforce: legal name consistency, GSTIN ↔ PAN linkage, cheque pre-printed status, expiration windows.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Deliverables */}
            <div className="p-7 rounded-xl border border-neutral-200/90 bg-neutral-50/30 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3">
                <span className="text-xs font-mono font-bold text-neutral-900 uppercase">Output Deliverables</span>
                <span className="text-[11px] font-mono text-neutral-500">Vector PDF Kits</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#EDF3EC] border border-[#D2E3D0] flex items-center justify-center text-[#235327] font-bold text-[10px] flex-shrink-0 mt-0.5">
                    A
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Preflight Discrepancy Report (PDF)</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      Free downloadable summary listing requirement compliance status, name consistency results, and flagged discrepancies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#EDF3EC] border border-[#D2E3D0] flex items-center justify-center text-[#235327] font-bold text-[10px] flex-shrink-0 mt-0.5">
                    B
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Final Customer Submission Dossier (PDF)</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      Customer cover sheet, Table of Contents, sequential page numbering (&ldquo;Page X of Y&rdquo;), running headers, and embedded records.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#EDF3EC] border border-[#D2E3D0] flex items-center justify-center text-[#235327] font-bold text-[10px] flex-shrink-0 mt-0.5">
                    C
                  </div>
                  <div>
                    <span className="font-bold text-neutral-950 block">Typeset Letterhead Undertakings</span>
                    <p className="text-neutral-600 text-[11px] mt-0.5 leading-relaxed">
                      Pre-filled company undertakings (Non-Debarment, Anti-Bribery, Sole Proprietorship, MSME) ready for digital signature.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONFIGURABLE CHECKS (Your Rules, Table Layout) */}
      <section className="py-16 md:py-24 bg-neutral-50/50 border-b border-neutral-200/80" id="checks">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-left space-y-1 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              Configurable Preflight Checks
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Configure verification rules to mirror what the requesting customer actually cares about.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200/80 text-neutral-600 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Verification Check</th>
                  <th className="py-3 px-4">Deterministic Evaluation Logic</th>
                  <th className="py-3 px-4">Action On Mismatch</th>
                  <th className="py-3 px-4 text-right">Default State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70 text-neutral-800">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-neutral-950">GSTIN ↔ PAN Linkage</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Characters 3–12 of GSTIN must match the entity PAN card exactly.
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">Flags mismatch for review</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">Enabled</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-neutral-950">Cross-Document Legal Name</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Lenient normalized matching across GSTIN, PAN, and Bank proof records.
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">Flags naming variation</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">Enabled</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-neutral-950">Pre-Printed Cheque Check</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Detects whether account name is pre-printed or handwritten on cheque leaf.
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">Surfaces neutral B2B guidance</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">Enabled</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-neutral-950">Expiry Date Window</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Flags certificates expiring within your configurable threshold window.
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">Warning with days remaining</td>
                  <td className="py-3.5 px-4 text-right font-mono text-neutral-700">30 Days</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-neutral-950">Mandatory Presence</td>
                  <td className="py-3.5 px-4 text-neutral-600">
                    Checks if every mandatory customer item has an uploaded attachment.
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">Marked as MISSING blocker</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">Enabled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. PRICING (Monochrome, transparent, no loud gradients) */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-200/80" id="pricing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left space-y-1 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              Straightforward Pricing
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Run preflight checks and preview your pack for free. Unlock the clean, watermark-free submission dossier for ₹299.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Free Preflight */}
            <div className="p-7 rounded-xl border border-neutral-200/90 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-neutral-600 uppercase">Self-Serve Tool</span>
                  <span className="text-[11px] font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">Free</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 font-mono">₹0</div>
                  <span className="text-xs text-neutral-500">Free preflight check &amp; watermarked preview</span>
                </div>

                <div className="space-y-2 pt-2 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-900" />
                    <span>Customer requirement checklist extraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-900" />
                    <span>Cross-document consistency check matrix</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-900" />
                    <span>Free downloadable Preflight Report (PDF)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-900" />
                    <span>Watermarked submission dossier preview</span>
                  </div>
                </div>
              </div>

              <Link
                href="/pack/new"
                className="w-full py-2.5 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-neutral-900 font-semibold text-xs text-center transition-colors"
              >
                Start Free Preflight Check
              </Link>
            </div>

            {/* Card 2: Single Pack */}
            <div className="p-7 rounded-xl border-2 border-neutral-950 bg-white flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-neutral-950 uppercase">Final Submission Pack</span>
                  <span className="text-[11px] font-mono bg-neutral-900 text-white px-2 py-0.5 rounded">Per Customer</span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 font-mono">₹299</div>
                  <span className="text-xs text-neutral-500">One-time payment · No subscription</span>
                </div>

                <div className="space-y-2 pt-2 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Customer-branded cover sheet &amp; Table of Contents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Sequential numbering (&ldquo;Page X of Y&rdquo;) &amp; running footer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Typeset signed undertakings (Debarment, Bribery, MSME)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-neutral-950" />
                    <span>Watermark removed · Instant high-resolution PDF download</span>
                  </div>
                </div>
              </div>

              <Link
                href="/pack/new"
                className="w-full py-2.5 px-4 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs text-center transition-colors"
              >
                Build Submission Dossier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ (Minimalist Accordion: border-bottom only, clean + / -) */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-200/80" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-left space-y-1 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Clear answers on verification mechanics, document privacy, and final PDF deliverables.
            </p>
          </div>

          <div className="divide-y divide-neutral-200/80 border-t border-neutral-200/80">
            {faqs.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group"
                >
                  <span className="font-semibold text-sm text-neutral-950 group-hover:text-neutral-700 transition-colors">
                    {item.q}
                  </span>
                  <span className="font-mono text-sm text-neutral-400 flex-shrink-0">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="pt-2 text-xs text-neutral-600 leading-relaxed max-w-[65ch] animate-in fade-in duration-150">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
