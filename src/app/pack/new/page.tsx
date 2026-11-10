'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  FileText,
  Upload,
  Building2,
  Calendar,
  Hash,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileCheck,
  Sparkles,
  HelpCircle,
  Check,
  Zap,
  X
} from 'lucide-react';

export default function NewPackPage() {
  const router = useRouter();

  const [supplierName, setSupplierName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [submissionRef, setSubmissionRef] = useState('');
  const [deadline, setDeadline] = useState('');

  // Requirement files (what customer wants)
  const [requirementFiles, setRequirementFiles] = useState<File[]>([]);
  // Supplier documents (what supplier has: GST, PAN, Cheque, Udyam)
  const [supplierFiles, setSupplierFiles] = useState<File[]>([]);
  // Instant demo mode with sample statutory files
  const [useSampleDocs, setUseSampleDocs] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reqFileInputRef = useRef<HTMLInputElement>(null);
  const supplierFileInputRef = useRef<HTMLInputElement>(null);

  const handleReqFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setRequirementFiles((prev) => [...prev, ...newFiles]);
      setErrorMsg(null);
    }
  };

  const handleSupplierFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSupplierFiles((prev) => [...prev, ...newFiles]);
      setUseSampleDocs(false);
      setErrorMsg(null);
    }
  };

  const handleApplySampleDocs = () => {
    setUseSampleDocs(true);
    if (!supplierName.trim()) {
      setSupplierName('Shree Balaji Precision Engineering LLP');
    }
    if (!customerName.trim()) {
      setCustomerName('Havells India Limited');
    }
    if (!submissionRef.trim()) {
      setSubmissionRef('RFQ-HAV-2026-B94');
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setErrorMsg('Please enter your business or company name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmitStep(1); // Reading files

    try {
      const formData = new FormData();
      formData.append('supplierName', supplierName.trim());
      if (customerName.trim()) formData.append('customerName', customerName.trim());
      if (submissionRef.trim()) formData.append('submissionRef', submissionRef.trim());
      if (deadline.trim()) formData.append('deadline', deadline.trim());

      // Pass requirement files
      for (const file of requirementFiles) {
        formData.append('requirementFiles', file);
      }

      // Pass supplier documents
      for (const file of supplierFiles) {
        formData.append('supplierFiles', file);
      }

      if (useSampleDocs) {
        formData.append('useSampleSupplierDocs', 'true');
      }

      setSubmitStep(2); // Extracting requirements & matching supplier documents
      const startTime = Date.now();

      const res = await fetch('/api/packs', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create customer pack.');
      }

      setSubmitStep(3); // Compiling preflight dossier & report
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((r) => setTimeout(r, 1000 - elapsed));
      }

      const pack = data.pack;
      // Store token in localStorage for session restoration
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cp_token_${pack.id}`, pack.accessToken);
      }

      // Navigate to the pack workspace with access token
      router.push(`/pack/${pack.id}?token=${pack.accessToken}`);
    } catch (err: any) {
      console.error('Error creating pack:', err);
      setErrorMsg(err.message || 'An error occurred while creating your pack. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Step Indicator & Header */}
        <div className="text-left space-y-2 border-b border-neutral-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span>Customer Pack Setup {'//'} Step 01</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-[-0.02em]">
            Create Customer Submission Pack
          </h1>

          <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-xl">
            Enter your customer&apos;s name and upload your business records (GST, PAN, Cheque, Udyam). 
            We match your documents against customer requirements and assemble a submission-ready dossier.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Notice</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Creation Form Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-7 shadow-xs">
          {!isSubmitting ? (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Quick Sample Fill Helper Banner */}
              <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-neutral-900 fill-neutral-900" />
                    <span>Want to test immediately?</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Pre-fill with realistic Indian precision machining records (GST, PAN, Cheque, Udyam) for instant package compilation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApplySampleDocs}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-md bg-white border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 whitespace-nowrap shadow-2xs transition-all active:scale-[0.98]"
                >
                  ⚡ Load Sample Records
                </button>
              </div>

              {/* Section 1: Business Details */}
              <div className="space-y-4">
                <div className="border-b border-neutral-100 pb-2">
                  <h2 className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider">
                    01. Company &amp; Customer Identification
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Your Business / Supplier Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shree Balaji Precision Engineering LLP"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Operating name as shown on your statutory records.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Requesting Customer / Buyer Name{' '}
                      <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Havells India, L&T, Tata Motors"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Who is requesting your vendor registration documents.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      RFQ / Vendor Portal Reference{' '}
                      <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="e.g. RFQ-HAV-2026-B94"
                        value={submissionRef}
                        onChange={(e) => setSubmissionRef(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                      Target Submission Deadline{' '}
                      <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Supplier's Existing Documents (What you have) */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-neutral-100 pb-2 flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider">
                    02. Your Company Documents (GST, PAN, Cheque, Udyam)
                  </h2>
                  <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    PDF, JPG, PNG
                  </span>
                </div>

                <div
                  onClick={() => supplierFileInputRef.current?.click()}
                  className={`border border-dashed rounded-lg p-5 sm:p-6 text-center cursor-pointer transition-all ${
                    supplierFiles.length > 0 || useSampleDocs
                      ? 'border-neutral-900 bg-neutral-50/70'
                      : 'border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50/50'
                  }`}
                >
                  <input
                    ref={supplierFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleSupplierFileChange}
                  />

                  {useSampleDocs && supplierFiles.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-neutral-900">
                        4 Sample Statutory Records Preloaded
                      </div>
                      <div className="text-[11px] text-neutral-600 font-mono">
                        GST REG-06 · Company PAN · HDFC Cancelled Cheque · Udyam Certificate
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUseSampleDocs(false);
                        }}
                        className="mt-1 text-[11px] text-rose-600 hover:underline"
                      >
                        Remove sample files and upload my own
                      </button>
                    </div>
                  ) : supplierFiles.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-neutral-900 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{supplierFiles.length} Document(s) Selected</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {supplierFiles.map((f, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-neutral-300 text-[11px] font-mono text-neutral-700"
                          >
                            <span>{f.name}</span>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSupplierFiles([]);
                        }}
                        className="text-[11px] text-rose-600 hover:underline pt-1"
                      >
                        Clear files
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-8 h-8 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-neutral-900">
                        Drop your GST, PAN, Bank Cheque, and Udyam records
                      </div>
                      <p className="text-[11px] text-neutral-500 max-w-md">
                        Upload your real statutory records (PDF, JPG, PNG) — or leave blank to automatically generate standard sample records for your company name for instant package compilation.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplySampleDocs();
                        }}
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold border border-neutral-300 transition-all"
                      >
                        <Zap className="w-3 h-3 text-neutral-800 fill-neutral-800" />
                        <span>Preload Realistic Sample Documents</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Customer Requirements Checklist (Optional) */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-neutral-100 pb-2 flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold text-neutral-900 uppercase tracking-wider">
                    03. Customer Checklist / Requirements (Optional)
                  </h2>
                  <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    PDF, Word, Excel, Images
                  </span>
                </div>

                <div
                  onClick={() => reqFileInputRef.current?.click()}
                  className={`border border-dashed rounded-lg p-5 sm:p-6 text-center cursor-pointer transition-all ${
                    requirementFiles.length > 0
                      ? 'border-neutral-900 bg-neutral-50/70'
                      : 'border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50/50'
                  }`}
                >
                  <input
                    ref={reqFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                    onChange={handleReqFileChange}
                  />

                  {requirementFiles.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-neutral-900 flex items-center justify-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-neutral-900" />
                        <span>{requirementFiles.length} Customer File(s) Attached</span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {requirementFiles.map((f, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-neutral-300 text-[11px] font-mono text-neutral-700"
                          >
                            <span>{f.name}</span>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRequirementFiles([]);
                        }}
                        className="text-[11px] text-rose-600 hover:underline pt-1"
                      >
                        Clear files
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded bg-neutral-100 text-neutral-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-neutral-900">
                        Upload customer checklist, RFQ guidelines, or vendor form
                      </div>
                      <p className="text-[11px] text-neutral-500 max-w-md">
                        Leave blank to automatically check against standard corporate vendor qualification criteria (GST, PAN, Bank Proof, MSME, Non-Debarment).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <Lock className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0" />
                  <span>Ephemeral processing · Private session token · Retained 48h</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white font-semibold text-xs shadow-2xs transition-all gap-2"
                >
                  <span>Build &amp; Package My Submission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Submission Progress Stepper */
            <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-neutral-950">
                  {submitStep === 1 && 'Reading statutory records and customer forms...'}
                  {submitStep === 2 && 'Extracting requirements & running consistency checks...'}
                  {submitStep === 3 && 'Assembling your submission package...'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Checking GSTIN-PAN linkage, verifying bank proof, drafting declarations, and preparing your indexed PDF dossier.
                </p>
              </div>

              <div className="space-y-2.5 text-left bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs text-neutral-600">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${submitStep >= 1 ? 'text-neutral-950' : 'text-neutral-300'}`} />
                  <span className={submitStep >= 1 ? 'font-semibold text-neutral-950' : ''}>
                    Validating statutory document binary structures
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${submitStep >= 2 ? 'text-neutral-950' : 'text-neutral-300'}`} />
                  <span className={submitStep >= 2 ? 'font-semibold text-neutral-950' : ''}>
                    Cross-checking legal names, PAN-GSTIN linkage & bank details
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${submitStep >= 3 ? 'text-neutral-950' : 'text-neutral-300'}`} />
                  <span className={submitStep >= 3 ? 'font-semibold text-neutral-950' : ''}>
                    Typesetting letterhead undertakings and compiling dossier
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
