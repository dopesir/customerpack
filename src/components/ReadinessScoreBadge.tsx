'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ScoringBreakdown } from '@/lib/types';

interface ReadinessScoreBadgeProps {
  score: number;
  breakdown?: ScoringBreakdown;
  companyName?: string;
}

export function ReadinessScoreBadge({ score, breakdown, companyName }: ReadinessScoreBadgeProps) {
  let badgeColor = 'text-[#235327] bg-[#EDF3EC] border-[#D2E3D0]';
  let gaugeColor = 'text-[#235327] stroke-[#235327]';
  let statusText = 'Submission-Ready';
  let statusDesc = 'High structural consistency across primary statutory proofs.';
  let Icon = ShieldCheck;

  if (score < 65) {
    badgeColor = 'text-[#8C2220] bg-[#FDEBEC] border-[#F6C7C9]';
    gaugeColor = 'text-[#8C2220] stroke-[#8C2220]';
    statusText = 'Action Required';
    statusDesc = 'Critical statutory documents missing or primary tax identifiers unreadable.';
    Icon = AlertCircle;
  } else if (score < 85) {
    badgeColor = 'text-[#785100] bg-[#FBF3DB] border-[#F1DFAB]';
    gaugeColor = 'text-[#785100] stroke-[#785100]';
    statusText = 'Review Advised';
    statusDesc = 'Minor naming variations or optional proofs require confirmation.';
    Icon = AlertTriangle;
  }

  // Circular progress calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-6 sm:p-7 space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Circular Gauge */}
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
              <circle
                cx="55"
                cy="55"
                r={radius}
                className="text-neutral-100 stroke-current"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="55"
                cy="55"
                r={radius}
                className={`${gaugeColor} transition-all duration-1000 ease-out`}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">{score}</span>
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border ${badgeColor} inline-flex items-center gap-1.5`}>
                <Icon className="w-3 h-3" />
                {statusText}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
              Preflight Readiness Index
            </h3>
            <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
              {statusDesc}
            </p>
          </div>
        </div>

        {/* Right: Component breakdown pills */}
        {breakdown && (
          <div className="grid grid-cols-2 gap-2 w-full lg:w-auto text-xs">
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[10px] uppercase font-mono block">Completeness</span>
              <span className="font-semibold font-mono text-neutral-900 text-xs">{breakdown.completenessScore}/40 pts</span>
            </div>
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[10px] uppercase font-mono block">Consistency</span>
              <span className="font-semibold font-mono text-neutral-900 text-xs">{breakdown.consistencyScore}/30 pts</span>
            </div>
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[10px] uppercase font-mono block">Bank Proof</span>
              <span className="font-semibold font-mono text-neutral-900 text-xs">{breakdown.bankingScore}/20 pts</span>
            </div>
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[10px] uppercase font-mono block">OCR Legibility</span>
              <span className="font-semibold font-mono text-neutral-900 text-xs">{breakdown.ocrQualityScore}/10 pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Transparent Disclaimer Banner */}
      <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-2.5 text-xs text-neutral-500">
        <Info className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="text-neutral-700">Pre-Submission Verification:</strong> Automated indicator based on detected document types and cross-field comparisons. Does not guarantee statutory acceptance by buyer. Powered by Nobuswork Engine.
        </p>
      </div>
    </div>
  );
}
