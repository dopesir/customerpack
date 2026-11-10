'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileCheck, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenSampleModal?: () => void;
}

export function Navbar({ onOpenSampleModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-md bg-neutral-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-neutral-800 transition-colors">
            <Layers className="w-4 h-4 text-neutral-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight text-neutral-950">Customer Pack</span>
            <span className="text-neutral-300">/</span>
            <a
              href="https://nobuswork.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-0.5"
            >
              <span>nobuswork</span>
              <ArrowUpRight className="w-2.5 h-2.5 text-neutral-400" />
            </a>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
          <a href="/#demo" className="hover:text-neutral-950 transition-colors">
            Interactive Preflight
          </a>
          <a href="/#checks" className="hover:text-neutral-950 transition-colors">
            Configurable Checks
          </a>
          <a href="/#what-you-get" className="hover:text-neutral-950 transition-colors">
            Submission Dossier
          </a>
          <a href="/#pricing" className="hover:text-neutral-950 transition-colors">
            Pricing
          </a>
          <a href="/#faq" className="hover:text-neutral-950 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/pack/new"
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-md shadow-2xs hover:bg-neutral-800 active:scale-[0.98] transition-all"
          >
            <span>Build My Pack</span>
          </Link>
        </div>
      </div>
    </header>
  );
}