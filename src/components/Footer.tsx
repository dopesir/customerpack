import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileCheck2, ExternalLink, ArrowUpRight, Sparkles, Building } from 'lucide-react';

export function Footer() {
  return (
    <footer id="privacy" className="border-t border-neutral-200/80 bg-[#FAFAFA] text-neutral-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 space-y-8">
        {/* Top Callout: Privacy & Ephemeral Processing */}
        <div className="p-5 sm:p-6 rounded-xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-[#EDF3EC] border border-[#D2E3D0] flex items-center justify-center text-[#235327] flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-950 text-sm flex items-center gap-2">
                Ephemeral In-Memory Processing · Zero Data Hoarding
              </h4>
              <p className="text-neutral-600 text-xs mt-1 max-w-2xl leading-relaxed">
                Your uploaded files and customer guidelines are processed solely to evaluate document consistency and compile your pack. 
                You can click &apos;Delete This Pack&apos; at any time to immediately purge all files, extracted records, and generated dossiers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded border border-neutral-200/70 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-[#235327]" />
            <span>Cryptographic 24-Byte Access Token</span>
          </div>
        </div>

        {/* Nobuswork Company Reservation & Information Card */}
        <div className="p-6 sm:p-7 rounded-xl bg-[#111111] text-white border border-neutral-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono uppercase bg-white/10 text-neutral-300 border border-white/10 tracking-wider">
              <Building className="w-3 h-3 text-neutral-400" />
              <span>Software Engineering by Nobuswork</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Customer Pack — Engineered by Nobuswork
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Nobuswork builds focused, high-precision digital utilities and specialized business instruments. Customer Pack was engineered to eliminate vendor onboarding rejections, reduce empanelment cycle times, and automate statutory document consistency verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <a
              href="https://nobuswork.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-100 active:scale-[0.98] transition-all group"
            >
              <span>More info on nobuswork.pages.dev</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Statutory Legal Disclaimer */}
        <div className="p-4 rounded-lg bg-neutral-100/70 border border-neutral-200/80 text-xs text-neutral-500 leading-relaxed font-sans">
          <span className="font-semibold text-neutral-700">Pre-Submission Check Disclaimer: </span>
          Customer Pack is an independent preparation and consistency-checking instrument. It evaluates documents against rules you select or extract from customer guidelines. It does not certify statutory compliance, provide legal advice, or guarantee approval, empanelment, or purchase order issuance by any requesting customer or enterprise buyer.
        </div>

        {/* Bottom Legal Reservation & Links */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 font-bold text-neutral-950">
              <FileCheck2 className="w-4 h-4 text-neutral-900" />
              <span>Customer Pack</span>
            </div>
            <span className="hidden sm:inline text-neutral-300">·</span>
            <span>© 2026 <strong>Nobuswork</strong>. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-300">·</span>
            <span>Self-serve vendor submission utility.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-600">
            <a href="/#demo" className="hover:text-neutral-950 transition-colors">
              Interactive Demo
            </a>
            <a href="/#what-you-get" className="hover:text-neutral-950 transition-colors">
              What You Get
            </a>
            <a href="/#checks" className="hover:text-neutral-950 transition-colors">
              Configurable Checks
            </a>
            <a href="/#pricing" className="hover:text-neutral-950 transition-colors">
              Pricing
            </a>
            <a
              href="https://nobuswork.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-950 inline-flex items-center gap-1 transition-colors text-neutral-700 font-medium"
            >
              <span>Nobuswork.pages.dev</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <Link
              href="/pack/new"
              className="font-bold text-neutral-950 hover:underline transition-colors"
            >
              Build My Pack →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}