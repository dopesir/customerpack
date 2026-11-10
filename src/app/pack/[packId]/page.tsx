'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CustomerPackPaymentModal } from '@/components/CustomerPackPaymentModal';
import {
  CustomerPackRecord,
  CustomerRequirement,
  SupplierDocument,
  ConfigurableChecks,
  DeclarationDraft,
  RequirementCategory,
  RequirementType
} from '@/lib/types';
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
  AlertTriangle,
  FileCheck,
  Sparkles,
  HelpCircle,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Copy,
  PenTool,
  Sliders,
  FileSpreadsheet,
  Layers,
  Clock,
  Share2
} from 'lucide-react';

function CustomerPackWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const packId = params?.packId as string;
  const initialToken = searchParams?.get('token') || '';

  const [token, setToken] = useState<string>(initialToken);
  const [pack, setPack] = useState<CustomerPackRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Workspace Navigation Step
  const [activeTab, setActiveTab] = useState<
    'requirements' | 'documents' | 'checks' | 'preflight' | 'declarations' | 'dossier' | 'download'
  >('preflight');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isEditingReq, setIsEditingReq] = useState<CustomerRequirement | null>(null);
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationDraft | null>(null);

  // File Uploading state in Step 2
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // PDF Download state
  const [downloadingType, setDownloadingType] = useState<'preflight_report' | 'submission_dossier' | null>(null);

  // Re-checking state
  const [isUpdatingChecks, setIsUpdatingChecks] = useState(false);

  // New Requirement Form state
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqDesc, setNewReqDesc] = useState('');
  const [newReqCategory, setNewReqCategory] = useState<RequirementCategory>('Tax / Statutory');
  const [newReqType, setNewReqType] = useState<RequirementType>('DOCUMENT');
  const [newReqRequired, setNewReqRequired] = useState(true);
  const [newReqFormat, setNewReqFormat] = useState('PDF');

  const fetchPack = useCallback(async (authToken: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/packs/${packId}`, {
        headers: {
          'x-access-token': authToken
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load customer pack.');
      }
      setPack(data.pack);
      if (typeof window !== 'undefined' && (authToken || data.pack?.accessToken)) {
        localStorage.setItem(`cp_token_${packId}`, authToken || data.pack?.accessToken);
        setToken(authToken || data.pack?.accessToken);
      }
    } catch (err: any) {
      console.error('Fetch pack error:', err);
      setErrorMsg(err.message || 'Pack not found or has expired.');
    } finally {
      setIsLoading(false);
    }
  }, [packId]);

  // Load token and fetch pack
  useEffect(() => {
    let resolvedToken = initialToken;
    if (!resolvedToken && typeof window !== 'undefined') {
      resolvedToken = localStorage.getItem(`cp_token_${packId}`) || '';
    }
    if (resolvedToken) {
      setToken(resolvedToken);
      fetchPack(resolvedToken);
    } else {
      // Fallback: try fetching with empty token in dev/session
      fetchPack('');
    }
  }, [packId, initialToken, fetchPack]);

  // Upload supplier documents
  const handleUploadDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingDocs(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch(`/api/packs/${packId}/documents`, {
        method: 'POST',
        headers: {
          'x-access-token': token
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload documents.');
      }

      setPack(data.pack);
      setSuccessMsg(`Successfully uploaded and classified ${files.length} document(s).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMsg(err.message || 'Document upload failed.');
    } finally {
      setIsUploadingDocs(false);
    }
  };

  // Remove supplier document
  const handleRemoveDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/packs/${packId}/documents?docId=${encodeURIComponent(docId)}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete document.');
      }
      setPack(data.pack);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not remove document.');
    }
  };

  // Save checks configuration changes
  const handleSaveChecks = async (updatedChecks: ConfigurableChecks) => {
    setIsUpdatingChecks(true);
    try {
      const res = await fetch(`/api/packs/${packId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          checksConfig: updatedChecks
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update checks.');
      }
      setPack(data.pack);
      setSuccessMsg('Preflight checks re-evaluated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update checks configuration.');
    } finally {
      setIsUpdatingChecks(false);
    }
  };

  // Add custom requirement
  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim() || !pack) return;

    const newReq: CustomerRequirement = {
      id: `req_custom_${Date.now()}`,
      title: newReqTitle.trim(),
      description: newReqDesc.trim(),
      category: newReqCategory,
      type: newReqType,
      required: newReqRequired,
      acceptableFormats: [newReqFormat],
      confidence: 1.0,
      isCustom: true
    };

    const updatedRequirements = [...pack.requirements, newReq];

    try {
      const res = await fetch(`/api/packs/${packId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          requirements: updatedRequirements
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add requirement.');
      }
      setPack(data.pack);
      setIsAddReqModalOpen(false);
      setNewReqTitle('');
      setNewReqDesc('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save custom requirement.');
    }
  };

  // Delete requirement
  const handleDeleteRequirement = async (reqId: string) => {
    if (!pack) return;
    const updated = pack.requirements.filter((r) => r.id !== reqId);
    try {
      const res = await fetch(`/api/packs/${packId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ requirements: updated })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPack(data.pack);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete requirement.');
    }
  };

  // Draft declaration
  const handleDraftDeclaration = async (templateKey: string, requirementId?: string) => {
    try {
      const res = await fetch(`/api/packs/${packId}/declarations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          templateKey,
          requirementId,
          variables: {
            supplierName: pack?.supplierName,
            customerName: pack?.customerName
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate declaration draft.');
      }
      setPack(data.pack);
      setSelectedDeclaration(data.declaration);
      setActiveTab('declarations');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not draft declaration.');
    }
  };

  // Save edited declaration
  const handleSaveDeclaration = async (decl: DeclarationDraft) => {
    try {
      const res = await fetch(`/api/packs/${packId}/declarations`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          declarationId: decl.id,
          text: decl.text,
          title: decl.title,
          isIncludedInPack: decl.isIncludedInPack
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPack(data.pack);
        setSuccessMsg('Declaration updated.');
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save declaration.');
    }
  };

  // Download compiled PDF
  const handleDownloadPdf = async (type: 'preflight_report' | 'submission_dossier', preview = false) => {
    setDownloadingType(type);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/packs/${packId}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ type, preview })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate PDF.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (pack?.supplierName || 'Submission').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download =
        type === 'submission_dossier'
          ? `Customer_Pack_Submission_Dossier_${cleanName}.pdf`
          : `Customer_Pack_Preflight_Report_${cleanName}.pdf`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(url);
          a.remove();
        } catch {
          // ignore
        }
      }, 3000);

      const label = type === 'submission_dossier' ? 'Submission Dossier PDF' : 'Preflight Report PDF';
      setSuccessMsg(`${label} compiled and downloaded successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('PDF download error:', err);
      setErrorMsg(err.message || 'Error generating PDF download.');
    } finally {
      setDownloadingType(null);
    }
  };

  // Permanent Wipe
  const handlePurgePack = async () => {
    try {
      const res = await fetch(`/api/packs/${packId}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to purge pack.');
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cp_token_${packId}`);
      }
      router.push('/?purged=true');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to wipe pack.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
          <div className="text-sm font-semibold text-neutral-800">Loading Customer Pack Workspace...</div>
          <div className="text-xs text-neutral-500">Retrieving encrypted customer requirements and matched records.</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (errorMsg && !pack) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto w-full px-4 py-16 text-center space-y-6">
          <div className="w-12 h-12 rounded-lg bg-[#FDEBEC] text-[#8C2220] flex items-center justify-center mx-auto border border-[#F6C7C9]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-neutral-900">Workspace Unavailable</h1>
            <p className="text-xs text-neutral-600 leading-relaxed">{errorMsg}</p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-md text-xs text-neutral-600 font-mono">Pack ID: {packId}</div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/pack/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Customer Pack</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pack) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      {/* Top Pack Identification Bar */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200">
                  Customer Pack Workspace · by Nobuswork
                </span>
                {pack.isPaid ? (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#235327] bg-[#EDF3EC] px-2.5 py-0.5 rounded-full border border-[#D2E3D0] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked Dossier</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#785100] bg-[#FBF3DB] px-2.5 py-0.5 rounded-full border border-[#F1DFAB] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Free Preflight Check & Preview</span>
                  </span>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">ID: {pack.id.substring(0, 14)}...</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>{pack.supplierName}</span>
                {pack.customerName && (
                  <>
                    <span className="text-neutral-400 font-normal">→</span>
                    <span className="text-neutral-900 font-semibold">{pack.customerName}</span>
                  </>
                )}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-mono text-[11px]">
                {pack.submissionRef && (
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3 text-neutral-400" />
                    <span>Ref: {pack.submissionRef}</span>
                  </span>
                )}
                {pack.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    <span>Deadline: {pack.deadline}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-neutral-500">
                  <Lock className="w-3 h-3 text-neutral-700" />
                  <span>Ephemeral Storage (48h retention)</span>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                onClick={() => {
                  const fullUrl = `${window.location.origin}/pack/${pack.id}?token=${pack.accessToken}`;
                  navigator.clipboard.writeText(fullUrl);
                  setSuccessMsg('Private access link copied to clipboard!');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-all"
                title="Copy private link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Link</span>
              </button>

              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-rose-50 text-neutral-500 hover:text-[#8C2220] text-xs font-medium transition-all"
                title="Permanently wipe this pack and all records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Pack</span>
              </button>

              {!pack.isPaid ? (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock Pack (₹299)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleDownloadPdf('submission_dossier')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Final PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="bg-[#EDF3EC] border-t border-[#D2E3D0] px-4 py-2 text-center text-xs font-medium text-[#235327] flex items-center justify-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#235327]" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-[#FDEBEC] border-t border-[#F6C7C9] px-4 py-2 text-center text-xs font-medium text-[#8C2220] flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#8C2220]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prominent Package Output Quick-Bar (Always visible regardless of tab) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="bg-white rounded-xl border border-neutral-300 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Submission Package Assembled</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {pack.summary.matched} of {pack.summary.total} Matched · {pack.declarations.length} Undertakings Ready
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-950">
                Your Submission Package Is Compiled &amp; Ready
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
                Download your free preflight discrepancy report or generate the complete multi-page PDF dossier with cover sheet and index.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
              <button
                type="button"
                disabled={downloadingType !== null}
                onClick={() => handleDownloadPdf('preflight_report')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {downloadingType === 'preflight_report' ? (
                  <Loader2 className="w-3.5 h-3.5 text-neutral-900 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                )}
                <span>
                  {downloadingType === 'preflight_report'
                    ? 'Assembling Report...'
                    : 'Preflight Report (PDF)'}
                </span>
              </button>

              <button
                type="button"
                disabled={downloadingType !== null}
                onClick={() => handleDownloadPdf('submission_dossier', !pack.isPaid)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {downloadingType === 'submission_dossier' ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-white" />
                )}
                <span>
                  {downloadingType === 'submission_dossier'
                    ? 'Compiling Dossier...'
                    : pack.isPaid
                    ? 'Final Submission Dossier (PDF)'
                    : 'Preview Submission Dossier (PDF)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-6 overflow-x-auto no-scrollbar text-xs font-medium border-t border-neutral-100">
            <button
              onClick={() => setActiveTab('requirements')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'requirements'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>1. Customer Requirements</span>
              <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                {pack.requirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'documents'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>2. Your Documents</span>
              <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                {pack.supplierDocuments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('checks')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'checks'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3. Choose What We Check</span>
            </button>

            <button
              onClick={() => setActiveTab('preflight')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'preflight'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Preflight Results</span>
              {pack.summary.missing > 0 && (
                <span className="text-[10px] font-mono font-medium bg-[#FDEBEC] text-[#8C2220] px-1.5 py-0.5 rounded border border-[#F6C7C9]">
                  {pack.summary.missing} Missing
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('declarations')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'declarations'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>5. Draft Declarations</span>
              <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                {pack.declarations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'dossier'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>6. Dossier Assembly</span>
            </button>

            <button
              onClick={() => setActiveTab('download')}
              className={`py-3 px-1 whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'download'
                  ? 'border-neutral-900 text-neutral-950 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>7. Preview & Download</span>
            </button>
          </nav>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: CUSTOMER REQUIREMENTS */}
        {/* ========================================================================= */}
        {/* TAB 1: CUSTOMER REQUIREMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Extracted Customer Requirements</h2>
                <p className="text-xs text-neutral-500">
                  Requirements extracted from customer document or seeded template. You can add, edit, or remove items.
                </p>
              </div>
              <button
                onClick={() => setIsAddReqModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Requirement</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Acceptable Format</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {pack.requirements.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-neutral-900">
                        <div>{req.title}</div>
                        {req.description && <div className="text-[11px] text-neutral-400 font-normal">{req.description}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono text-[10px] border border-neutral-200">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#F0F4F8] text-[#234158] border border-[#D8E2EA]">
                          {req.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                        {req.acceptableFormats?.join(', ') || 'Any PDF/Scan'}
                      </td>
                      <td className="py-3 px-4">
                        {req.required ? (
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#8C2220] bg-[#FDEBEC] px-2 py-0.5 rounded-full border border-[#F6C7C9]">
                            Mandatory
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRequirement(req.id)}
                          className="text-neutral-400 hover:text-[#8C2220] p-1 rounded hover:bg-neutral-100 transition-colors"
                          title="Delete requirement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: YOUR DOCUMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Your Uploaded Supplier Documents</h2>
                <p className="text-xs text-neutral-500">
                  Upload statutory certificates, bank proof, and commercial records. Auto-classified and matched to customer requirements.
                </p>
              </div>

              <div>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleUploadDocuments(e.target.files)}
                />
                <button
                  disabled={isUploadingDocs}
                  onClick={() => docInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isUploadingDocs ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload More Documents</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUploadDocuments(e.dataTransfer.files);
              }}
              onClick={() => docInputRef.current?.click()}
              className="border border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/40 hover:bg-neutral-50 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="w-5 h-5 text-neutral-400" />
                <div className="text-xs font-semibold text-neutral-800">
                  Drop supplier files here or click to select
                </div>
                <div className="text-[11px] text-neutral-400">
                  PDF, PNG, JPG up to 15MB each (GST certificate, PAN card, Cancelled Cheque, Udyam, etc.)
                </div>
              </div>
            </div>

            {/* Document List Table */}
            {pack.supplierDocuments.length > 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Auto-Detected Type</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Extracted Key Data</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {pack.supplierDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-4 font-medium text-neutral-900">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-neutral-900" />
                            <span>{doc.fileName}</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">
                            {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB · {doc.mimeType}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#F0F4F8] text-[#234158] border border-[#D8E2EA]">
                            {doc.detectedType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                              doc.typeConfidence >= 0.85
                                ? 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]'
                                : doc.typeConfidence >= 0.6
                                ? 'bg-[#FBF3DB] text-[#785100] border-[#F1DFAB]'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}
                          >
                            {doc.typeConfidence >= 0.85 ? 'HIGH' : doc.typeConfidence >= 0.6 ? 'MEDIUM' : 'LOW'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {doc.extractedData.legalName?.value && (
                            <div className="text-[11px]">
                              <strong className="text-neutral-800">Name:</strong> {doc.extractedData.legalName.value}
                            </div>
                          )}
                          {doc.extractedData.gstin?.value && (
                            <div className="text-[11px] font-mono">
                              <strong className="text-neutral-800">GSTIN:</strong> {doc.extractedData.gstin.value}
                            </div>
                          )}
                          {doc.extractedData.pan?.value && (
                            <div className="text-[11px] font-mono">
                              <strong className="text-neutral-800">PAN:</strong> {doc.extractedData.pan.value}
                            </div>
                          )}
                          {doc.extractedData.bankDetails?.accountHolderName?.value && (
                            <div className="text-[11px]">
                              <strong className="text-neutral-800">Bank Name:</strong>{' '}
                              {doc.extractedData.bankDetails.accountHolderName.value}{' '}
                              {doc.extractedData.bankDetails.accountHolderName.isPrePrinted ? (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">
                                  Pre-printed
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded">
                                  Handwritten
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-neutral-200/90 p-8 text-center text-neutral-500 text-xs">
                No supplier documents uploaded yet. Upload your files above to run consistency checks.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CHOOSE WHAT WE CHECK (CONFIGURABLE CHECKS) */}
        {/* ========================================================================= */}
        {activeTab === 'checks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Configurable Consistency & Validation Rules</h2>
                <p className="text-xs text-neutral-500">
                  Your customer&apos;s requirements, your rules. Enable or adjust checks to reflect your customer&apos;s real onboarding criteria.
                </p>
              </div>

              <button
                disabled={isUpdatingChecks}
                onClick={() => handleSaveChecks(pack.checksConfig)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all self-start disabled:opacity-50"
              >
                {isUpdatingChecks ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Apply & Re-run Preflight</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Presence Checks */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                  01 {'//'} Document Presence Checks
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkPresenceRequired}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkPresenceRequired: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Check Mandatory Customer Requirements</div>
                    <div className="text-[11px] text-neutral-500">
                      Flags missing required records as blockers in the preflight summary.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkPresenceOptional}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkPresenceOptional: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Flag Optional Customer Requirements</div>
                    <div className="text-[11px] text-neutral-500">
                      Surfaces recommended but non-mandatory items (e.g. ISO certificates, MSME if large enterprise).
                    </div>
                  </div>
                </label>
              </div>

              {/* Entity Consistency Checks */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                  02 {'//'} Cross-Document Identity Linkage
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkLegalNameConsistency}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkLegalNameConsistency: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Cross-Document Legal Name Consistency</div>
                    <div className="text-[11px] text-neutral-500">
                      Compares business legal name across GSTIN certificate, PAN card, and Bank records.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkGstPanLinkage}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkGstPanLinkage: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">GSTIN ↔ PAN Embedded String Match</div>
                    <div className="text-[11px] text-neutral-500">
                      Verifies that characters 3 to 12 of GSTIN match your statutory PAN card exactly.
                    </div>
                  </div>
                </label>
              </div>

              {/* Banking & Format Checks */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                  03 {'//'} Banking &amp; Formatting Checks
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkPreprintedCheque}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkPreprintedCheque: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Pre-Printed Name on Cheque Check</div>
                    <div className="text-[11px] text-neutral-500">
                      Flags handwritten account names with neutral B2B guidance to verify customer policy.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkBankNameConsistency}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkBankNameConsistency: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Bank Account Holder Name Match</div>
                    <div className="text-[11px] text-neutral-500">
                      Flags discrepancies between statutory business name and bank mandate / cheque beneficiary.
                    </div>
                  </div>
                </label>
              </div>

              {/* Expiry & Quality */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                  04 {'//'} Validity &amp; Expiration Window
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pack.checksConfig.checkExpiryDates}
                    onChange={(e) => {
                      const updated = { ...pack.checksConfig, checkExpiryDates: e.target.checked };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Check Document Expiration Dates</div>
                    <div className="text-[11px] text-neutral-500">
                      Flags certificates expiring within your configured threshold window.
                    </div>
                  </div>
                </label>

                <div className="pl-6 pt-1">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Expiration Warning Window (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={pack.checksConfig.expiryThresholdDays || 30}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 30;
                      const updated = { ...pack.checksConfig, expiryThresholdDays: val };
                      setPack({ ...pack, checksConfig: updated });
                    }}
                    className="w-28 px-2.5 py-1.5 rounded-md border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                  <p className="text-[10px] text-neutral-400 font-mono mt-1">Default: 30 days before customer submission deadline.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PREFLIGHT RESULTS */}
        {/* ========================================================================= */}
        {activeTab === 'preflight' && (
          <div className="space-y-6">
            {/* Header & Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Matched Criteria</div>
                <div className="text-2xl font-bold tracking-tight font-mono text-[#235327] mt-1">{pack.summary.matched}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Documents verified against requirement</div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Missing Records</div>
                <div className="text-2xl font-bold tracking-tight font-mono text-[#8C2220] mt-1">{pack.summary.missing}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Mandatory buyer items not uploaded</div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Needs Review</div>
                <div className="text-2xl font-bold tracking-tight font-mono text-[#785100] mt-1">{pack.summary.needsReview}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Discrepancies & warnings flagged</div>
              </div>

              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Drafts Available</div>
                <div className="text-2xl font-bold tracking-tight font-mono text-neutral-900 mt-1">{pack.summary.draftsAvailable}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Ready-to-generate letterhead drafts</div>
              </div>
            </div>

            {/* Statutory Preflight Disclaimer Banner */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                <strong className="text-neutral-900">Pre-Submission Check:</strong> Automated preflight analyzes document consistency and customer requirements based on your configured rules. It does not certify statutory compliance or guarantee vendor acceptance by the requesting buyer.
              </span>
            </div>

            {/* Consistency Validation Findings (If any) */}
            {pack.validationResults && pack.validationResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                  Consistency & Linkage Findings
                </h3>
                <div className="space-y-2">
                  {pack.validationResults.map((val) => (
                    <div
                      key={val.id}
                      className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                        val.status === 'MISSING'
                          ? 'bg-[#FDEBEC]/40 border-[#F6C7C9] text-neutral-900'
                          : val.status === 'REVIEW'
                          ? 'bg-[#FBF3DB]/40 border-[#F1DFAB] text-neutral-900'
                          : 'bg-[#EDF3EC]/40 border-[#D2E3D0] text-neutral-900'
                      }`}
                    >
                      {val.status === 'MISSING' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-[#8C2220] flex-shrink-0 mt-0.5" />
                      ) : val.status === 'REVIEW' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#785100] flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#235327] flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{val.title}</div>
                        <div className="mt-0.5 text-neutral-600 leading-relaxed text-xs">{val.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirement Matching Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                Customer Requirement Checklist Preflight
              </h3>

              <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Requirement</th>
                      <th className="py-3 px-4">Preflight Status</th>
                      <th className="py-3 px-4">Reason / Rule Finding</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {pack.matchResults.map((match) => {
                      const req = pack.requirements.find((r) => r.id === match.requirementId);
                      if (!req) return null;

                      return (
                        <tr key={match.requirementId} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-neutral-900">
                            <div>{req.title}</div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {req.category} · {req.required ? 'Mandatory' : 'Optional'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border ${
                                match.status === 'MATCHED'
                                  ? 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]'
                                  : match.status === 'MISSING'
                                  ? 'bg-[#FDEBEC] text-[#8C2220] border-[#F6C7C9]'
                                  : match.status === 'NEEDS_REVIEW'
                                  ? 'bg-[#FBF3DB] text-[#785100] border-[#F1DFAB]'
                                  : match.status === 'DRAFT_AVAILABLE'
                                  ? 'bg-[#F0F4F8] text-[#234158] border-[#D8E2EA]'
                                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                              }`}
                            >
                              {match.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-600 max-w-md leading-relaxed">{match.reason}</td>
                          <td className="py-3 px-4 text-right">
                            {match.status === 'MISSING' && (
                              <button
                                onClick={() => setActiveTab('documents')}
                                className="px-2.5 py-1 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-medium text-xs transition-colors"
                              >
                                Upload File
                              </button>
                            )}
                            {match.status === 'DRAFT_AVAILABLE' && (
                              <button
                                onClick={() => {
                                  const key = req.title.toLowerCase().includes('brib')
                                    ? 'anti_bribery'
                                    : req.title.toLowerCase().includes('proprietor')
                                    ? 'sole_proprietorship'
                                    : req.title.toLowerCase().includes('msme')
                                    ? 'msme_applicability'
                                    : 'debarment';
                                  handleDraftDeclaration(key, req.id);
                                }}
                                className="px-2.5 py-1 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium text-xs active:scale-[0.98] transition-colors"
                              >
                                Draft Undertaking
                              </button>
                            )}
                            {match.status === 'MATCHED' && (
                              <span className="text-[#235327] font-semibold text-xs flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Ready</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200">
              <button
                onClick={() => handleDownloadPdf('preflight_report')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5 text-neutral-900" />
                <span>Download Free Preflight Report (PDF)</span>
              </button>

              <button
                onClick={() => setActiveTab('declarations')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
              >
                <span>Proceed to Letterhead Declarations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DRAFT DECLARATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'declarations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Company Letterhead Declarations & Undertakings</h2>
                <p className="text-xs text-neutral-500">
                  Pre-filled with your business entity details and customer reference. Edit directly and include in your final dossier.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDraftDeclaration('debarment')}
                  className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                >
                  + Non-Debarment
                </button>
                <button
                  onClick={() => handleDraftDeclaration('anti_bribery')}
                  className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                >
                  + Anti-Bribery
                </button>
                <button
                  onClick={() => handleDraftDeclaration('sole_proprietorship')}
                  className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                >
                  + Sole Proprietorship
                </button>
                <button
                  onClick={() => handleDraftDeclaration('msme_applicability')}
                  className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                >
                  + MSME Applicability
                </button>
              </div>
            </div>

            {pack.declarations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Declaration List */}
                <div className="space-y-2.5">
                  {pack.declarations.map((decl) => (
                    <div
                      key={decl.id}
                      onClick={() => setSelectedDeclaration(decl)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                        selectedDeclaration?.id === decl.id
                          ? 'border-neutral-900 bg-neutral-50/70 shadow-2xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-neutral-900">{decl.title}</span>
                        {decl.isIncludedInPack ? (
                          <span className="text-[10px] font-mono font-semibold bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0] px-1.5 py-0.5 rounded">
                            Included
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                            Excluded
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{decl.text}</div>
                    </div>
                  ))}
                </div>

                {/* Live Editor */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-5 space-y-4 shadow-2xs">
                  {selectedDeclaration ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                        <input
                          type="text"
                          value={selectedDeclaration.title}
                          onChange={(e) =>
                            setSelectedDeclaration({ ...selectedDeclaration, title: e.target.value })
                          }
                          className="font-semibold text-sm text-neutral-900 border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedDeclaration.isIncludedInPack}
                              onChange={(e) => {
                                const updated = { ...selectedDeclaration, isIncludedInPack: e.target.checked };
                                setSelectedDeclaration(updated);
                                handleSaveDeclaration(updated);
                              }}
                              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <span>Include in PDF Dossier</span>
                          </label>
                        </div>
                      </div>

                      <textarea
                        rows={14}
                        value={selectedDeclaration.text}
                        onChange={(e) =>
                          setSelectedDeclaration({ ...selectedDeclaration, text: e.target.value })
                        }
                        className="w-full p-3 rounded-lg border border-neutral-300 text-xs font-mono leading-relaxed text-neutral-900 focus:outline-none focus:border-neutral-900"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedDeclaration.text);
                              setSuccessMsg('Declaration copied to clipboard!');
                              setTimeout(() => setSuccessMsg(null), 2500);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleSaveDeclaration(selectedDeclaration)}
                          className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-xs text-neutral-400">
                      Select a declaration draft from the left or click a template button above to generate one.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-xs text-neutral-500 space-y-3 shadow-2xs">
                <p>No declaration drafts prepared yet. Choose a statutory template above to generate one.</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleDraftDeclaration('debarment')}
                    className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
                  >
                    Draft Non-Debarment Declaration
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DOSSIER ASSEMBLY */}
        {/* ========================================================================= */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Submission Dossier Assembly & Ordering</h2>
              <p className="text-xs text-neutral-500">
                Organize the exact order of documents and declarations compiled into your finalized PDF pack.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs p-6 space-y-3">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs">
                <div className="font-semibold text-neutral-900">1. Branded Customer Cover Sheet</div>
                <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">Always First</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs">
                <div className="font-semibold text-neutral-900">2. Customer Requirements Table of Contents &amp; Page Index</div>
                <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">Page 2</span>
              </div>

              {/* Uploaded Supplier Documents */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                  Supplier Attached Records & Scans ({pack.supplierDocuments.length})
                </div>

                {pack.supplierDocuments.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-neutral-200 flex items-center justify-between text-xs hover:bg-neutral-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 text-[11px]">{idx + 3}.</span>
                      <div>
                        <span className="font-medium text-neutral-900">{doc.fileName}</span>
                        <span className="ml-2 text-[10px] font-mono bg-[#F0F4F8] text-[#234158] border border-[#D8E2EA] px-1.5 py-0.5 rounded">
                          {doc.detectedType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold text-[#235327] bg-[#EDF3EC] border border-[#D2E3D0] px-2 py-0.5 rounded">
                        Included
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Declarations */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                  Typeset Declarations ({pack.declarations.length})
                </div>

                {pack.declarations.map((decl, idx) => (
                  <div
                    key={decl.id}
                    className="p-3 rounded-lg border border-neutral-200 flex items-center justify-between text-xs hover:bg-neutral-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {pack.supplierDocuments.length + idx + 3}.
                      </span>
                      <div>
                        <span className="font-medium text-neutral-900">{decl.title}</span>
                        <span className="ml-2 text-[10px] font-mono bg-[#F0F4F8] text-[#234158] border border-[#D8E2EA] px-1.5 py-0.5 rounded">
                          Typeset Undertaking
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          decl.isIncludedInPack
                            ? 'bg-[#EDF3EC] text-[#235327] border-[#D2E3D0]'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        }`}
                      >
                        {decl.isIncludedInPack ? 'Included' : 'Excluded'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('download')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all"
              >
                <span>Proceed to Preview & Download</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PREVIEW, PAYMENT & DOWNLOAD */}
        {/* ========================================================================= */}
        {activeTab === 'download' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Final Downloads & Previews</h2>
              <p className="text-xs text-neutral-500">
                Download your preflight check report anytime for free. Unlock the clean, watermark-free submission dossier with index and sequential page numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Free Preflight Report */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 flex flex-col justify-between space-y-6 shadow-2xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase text-neutral-600 bg-neutral-100 border border-neutral-200">
                    Always Free · Self-Serve Utility
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">Preflight Discrepancy Report</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Complete audit trail of all extracted customer requirements, matched supplier files, legal name consistency results, and detected issues.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>Requirements compliance matrix</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>Name and GSTIN-PAN linkage check details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>Statutory preflight disclaimer & timestamp</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={downloadingType !== null}
                  onClick={() => handleDownloadPdf('preflight_report')}
                  className="w-full py-2.5 px-4 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-medium text-xs shadow-2xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {downloadingType === 'preflight_report' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {downloadingType === 'preflight_report'
                      ? 'Generating Preflight Report...'
                      : 'Download Preflight Report (PDF)'}
                  </span>
                </button>
              </div>

              {/* Card 2: Submission Dossier */}
              <div className="bg-white rounded-xl border-2 border-neutral-900 p-6 flex flex-col justify-between space-y-6 shadow-2xs relative overflow-hidden">
                {!pack.isPaid && (
                  <div className="absolute top-0 right-0 bg-neutral-900 text-white text-[10px] font-mono font-semibold px-3 py-1 rounded-bl-lg">
                    ₹299 ONE-TIME
                  </div>
                )}

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-neutral-100 text-neutral-900 border border-neutral-200">
                    {pack.isPaid ? 'Unlocked Pack' : 'Final Dossier Package'}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    Final Customer Submission Dossier
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Single merged PDF with customer cover sheet, index, sequential page numbers (&ldquo;Page X of Y&rdquo;), running header, and embedded signed declarations.
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>{pack.supplierDocuments.length} Supplier records cleanly compiled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>{pack.declarations.filter((d) => d.isIncludedInPack).length} Typeset declarations attached</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
                      <span>{pack.isPaid ? 'Watermark removed' : 'Watermarked preview available'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {pack.isPaid ? (
                    <button
                      disabled={downloadingType !== null}
                      onClick={() => handleDownloadPdf('submission_dossier')}
                      className="w-full py-2.5 px-4 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium text-xs shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {downloadingType === 'submission_dossier' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {downloadingType === 'submission_dossier'
                          ? 'Generating Final Dossier...'
                          : 'Download Final Submission Dossier (PDF)'}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium text-xs shadow-2xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Unlock Clean PDF Dossier (₹299)</span>
                      </button>

                      <button
                        disabled={downloadingType !== null}
                        onClick={() => handleDownloadPdf('submission_dossier', true)}
                        className="w-full py-2 px-3 rounded-md text-neutral-600 hover:bg-neutral-100 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {downloadingType === 'submission_dossier' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {downloadingType === 'submission_dossier'
                            ? 'Generating Preview PDF...'
                            : 'Download Watermarked Preview (Free)'}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* 1. Add Custom Requirement Modal */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-semibold text-neutral-900">Add Customer Requirement</h3>
              <button
                onClick={() => setIsAddReqModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 9001:2015 Quality Certificate"
                  value={newReqTitle}
                  onChange={(e) => setNewReqTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description / Clause Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Must be accredited by NABCB/IAF"
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={newReqCategory}
                    onChange={(e) => setNewReqCategory(e.target.value as RequirementCategory)}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-xs text-neutral-900"
                  >
                    <option value="Tax / Statutory">Tax / Statutory</option>
                    <option value="Company Information">Company Information</option>
                    <option value="Banking">Banking</option>
                    <option value="Registration">Registration</option>
                    <option value="Quality">Quality</option>
                    <option value="Safety">Safety</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Legal">Legal</option>
                    <option value="Declarations">Declarations</option>
                    <option value="Customer Forms">Customer Forms</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Type</label>
                  <select
                    value={newReqType}
                    onChange={(e) => setNewReqType(e.target.value as RequirementType)}
                    className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-xs text-neutral-900"
                  >
                    <option value="DOCUMENT">DOCUMENT</option>
                    <option value="DECLARATION">DECLARATION</option>
                    <option value="FORM">FORM</option>
                    <option value="INFORMATION">INFORMATION</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqMandatory"
                  checked={newReqRequired}
                  onChange={(e) => setNewReqRequired(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="reqMandatory" className="font-medium text-neutral-700 cursor-pointer">
                  Mandatory requirement (Blocker if missing)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddReqModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md border border-neutral-300 text-neutral-700 font-medium text-xs hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white font-medium text-xs active:scale-[0.98] transition-all"
                >
                  Add Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Permanent Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#FDEBEC] text-[#8C2220] flex items-center justify-center border border-[#F6C7C9]">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-neutral-900">Permanently Delete This Customer Pack?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                This will immediately purge all uploaded supplier documents, customer requirement extracts, preflight
                scores, and drafted declarations. This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md border border-neutral-300 text-neutral-700 font-medium text-xs hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgePack}
                className="px-3.5 py-1.5 rounded-md bg-[#8C2220] hover:bg-[#6D1A19] text-white font-medium text-xs active:scale-[0.98] transition-all"
              >
                Confirm Permanent Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Razorpay Payment Modal */}
      <CustomerPackPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        packId={pack.id}
        token={token}
        supplierName={pack.supplierName}
        customerName={pack.customerName}
        onPaymentSuccess={() => {
          fetchPack(token);
          setActiveTab('download');
          setSuccessMsg('Payment verified! Your final submission dossier is unlocked.');
        }}
      />

      <Footer />
    </div>
  );
}

export default function CustomerPackWorkspacePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 space-y-4">
          <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
          <div className="text-sm font-semibold text-neutral-800">Loading Customer Pack Workspace...</div>
          <div className="text-xs text-neutral-500">Preparing customer requirements and matched records.</div>
        </div>
      }
    >
      <CustomerPackWorkspaceContent />
    </React.Suspense>
  );
}
