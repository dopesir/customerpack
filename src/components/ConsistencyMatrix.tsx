'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Building,
  Landmark,
  FileCheck2,
  Filter
} from 'lucide-react';
import { PreflightCheckResult, CheckStatus } from '@/lib/types';

interface ConsistencyMatrixProps {
  checks: PreflightCheckResult[];
}

export function ConsistencyMatrix({ checks }: ConsistencyMatrixProps) {
  const [filter, setFilter] = useState<'ALL' | 'REVIEW' | 'PASS' | 'MISSING'>('ALL');

  const filteredChecks = checks.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return {
          cardBg: 'bg-[#EDF3EC]/40 border-[#D2E3D0]',
          badgeBg: 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]',
          icon: CheckCircle2,
          iconColor: 'text-[#235327]',
          label: 'PASS'
        };
      case 'REVIEW':
        return {
          cardBg: 'bg-[#FBF3DB]/40 border-[#F1DFAB]',
          badgeBg: 'bg-[#FBF3DB] text-[#785100] border-[#F1DFAB]',
          icon: AlertTriangle,
          iconColor: 'text-[#785100]',
          label: 'REVIEW'
        };
      case 'MISSING':
        return {
          cardBg: 'bg-[#FDEBEC]/40 border-[#F6C7C9]',
          badgeBg: 'bg-[#FDEBEC] text-[#8C2220] border-[#F6C7C9]',
          icon: XCircle,
          iconColor: 'text-[#8C2220]',
          label: 'MISSING'
        };
      case 'NOT_CHECKED':
      default:
        return {
          cardBg: 'bg-neutral-50 border-neutral-200',
          badgeBg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          icon: HelpCircle,
          iconColor: 'text-neutral-500',
          label: 'NOT CHECKED'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Identity':
        return Building;
      case 'Banking':
        return Landmark;
      case 'Compliance':
        return ShieldCheck;
      case 'Document':
      default:
        return FileCheck2;
    }
  };

  const counts = {
    pass: checks.filter((c) => c.status === 'PASS').length,
    review: checks.filter((c) => c.status === 'REVIEW').length,
    missing: checks.filter((c) => c.status === 'MISSING').length
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden space-y-4 p-6 sm:p-7">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
            <span>Cross-Document Consistency Matrix</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Deterministic statutory cross-checks across uploaded records
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-[#111111] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({checks.length})
          </button>
          <button
            onClick={() => setFilter('REVIEW')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
              filter === 'REVIEW'
                ? 'bg-[#FBF3DB] text-[#785100] border-[#F1DFAB]'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-[#785100]" />
            Review ({counts.review})
          </button>
          <button
            onClick={() => setFilter('PASS')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
              filter === 'PASS'
                ? 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-[#235327]" />
            Pass ({counts.pass})
          </button>
          <button
            onClick={() => setFilter('MISSING')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
              filter === 'MISSING'
                ? 'bg-[#FDEBEC] text-[#8C2220] border-[#F6C7C9]'
                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <XCircle className="w-3 h-3 text-[#8C2220]" />
            Missing ({counts.missing})
          </button>
        </div>
      </div>

      {/* Checks Grid */}
      <div className="space-y-2.5 pt-1">
        {filteredChecks.map((check) => {
          const badge = getStatusBadge(check.status);
          const StatusIcon = badge.icon;

          return (
            <div
              key={check.id}
              className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs ${badge.cardBg}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md bg-white border border-neutral-200/80 shadow-2xs flex-shrink-0 mt-0.5 ${badge.iconColor}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {check.category}
                    </span>
                    <h4 className="font-semibold text-neutral-900 text-xs">{check.title}</h4>
                  </div>
                  <p className="text-neutral-700 leading-relaxed text-xs">{check.message}</p>
                  {check.details && (
                    <p className="text-neutral-500 text-[11px] font-mono mt-0.5">{check.details}</p>
                  )}
                </div>
              </div>

              <div className="self-end sm:self-start flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border ${badge.badgeBg}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
