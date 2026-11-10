'use client';

import React from 'react';
import { Loader2, CheckCircle2, FileSearch, Sparkles, Database, ShieldCheck, FileCheck2 } from 'lucide-react';

export interface ProcessingStepperProps {
  currentStep: number; // 1 to 5
  totalSteps?: number;
  fileName?: string;
}

export function ProcessingStepper({ currentStep, totalSteps = 5, fileName }: ProcessingStepperProps) {
  const steps = [
    {
      step: 1,
      title: 'Reading uploaded documents',
      desc: 'Loading file buffers and validating dimensions',
      icon: FileSearch
    },
    {
      step: 2,
      title: 'Identifying statutory document types',
      desc: 'Classifying GST, PAN, Bank Cheque, and MSME certificates',
      icon: Database
    },
    {
      step: 3,
      title: 'Extracting business details & tax identifiers',
      desc: 'Multimodal vision extraction of GSTIN, PAN, IFSC, and entity names',
      icon: Sparkles
    },
    {
      step: 4,
      title: 'Running cross-document consistency checks',
      desc: 'Validating PAN-in-GSTIN structure and bank account ownership',
      icon: ShieldCheck
    },
    {
      step: 5,
      title: 'Compiling your preflight report',
      desc: 'Calculating Vendor Readiness Score and structuring packet',
      icon: FileCheck2
    }
  ];

  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-7 bg-white rounded-xl border border-neutral-200/90 shadow-2xs space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex p-2.5 rounded-lg bg-neutral-100 text-neutral-950 mb-1 border border-neutral-200">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight">
          Analyzing Your Statutory Documents
        </h3>
        <p className="text-xs text-neutral-500 font-mono">
          Deterministic consistency check running in memory · {progressPercent}% complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden border border-neutral-200/60">
        <div
          className="bg-neutral-950 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2 pt-1">
        {steps.map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const isPending = currentStep < item.step;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 text-xs ${
                isCurrent
                  ? 'bg-neutral-50 border-neutral-300 shadow-2xs'
                  : isDone
                  ? 'bg-white border-neutral-200/80 text-neutral-700'
                  : 'bg-white border-transparent text-neutral-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0]'
                      : isCurrent
                      ? 'bg-neutral-950 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div>
                  <p
                    className={`font-semibold ${
                      isCurrent ? 'text-neutral-950 font-bold' : isDone ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div>
                {isDone && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0]">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-900 border border-neutral-300">
                    Running...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {fileName && (
        <p className="text-center text-[11px] text-neutral-400 truncate max-w-sm mx-auto font-mono">
          Processing: <span className="text-neutral-700">{fileName}</span>
        </p>
      )}
    </div>
  );
}
