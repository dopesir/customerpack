'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { DocumentType } from '@/lib/types';

export interface UploadFileItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  mimeType: string;
  detectedType: DocumentType;
  previewUrl?: string;
  isSample?: boolean;
}

interface DropzoneProps {
  onStartPreflight: (files: UploadFileItem[]) => void;
  isLoading?: boolean;
}

export function Dropzone({ onStartPreflight, isLoading }: DropzoneProps) {
  const [fileList, setFileList] = useState<UploadFileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectTypeFromFileName = (fileName: string): DocumentType => {
    const lower = fileName.toLowerCase();
    if (lower.includes('gst') || lower.includes('tax')) return 'gst_certificate';
    if (lower.includes('pan')) return 'pan_card';
    if (lower.includes('cheque') || lower.includes('bank') || lower.includes('passbook'))
      return 'bank_proof';
    if (lower.includes('udyam') || lower.includes('msme')) return 'udyam_certificate';
    if (lower.includes('coi') || lower.includes('incorporation') || lower.includes('deed'))
      return 'incorporation_certificate';
    if (lower.includes('form')) return 'vendor_form';
    return 'other';
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setErrorMsg(null);
    const newItems: UploadFileItem[] = [];

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];

      // Check format
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const isExtValid = /\.(pdf|jpg|jpeg|png)$/i.test(file.name);

      if (!validTypes.includes(file.type) && !isExtValid) {
        setErrorMsg(`"${file.name}" is not a supported file. Please upload PDF, JPG, or PNG files.`);
        continue;
      }

      // Check max size: 15MB
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 15MB size limit.`);
        continue;
      }

      const detectedType = detectTypeFromFileName(file.name);
      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/pdf',
        detectedType,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });
    }

    setFileList((prev) => {
      const combined = [...prev, ...newItems];
      if (combined.length > 8) {
        setErrorMsg('Maximum 8 documents allowed in a single preflight session.');
        return combined.slice(0, 8);
      }
      return combined;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateDocType = (id: string, newType: DocumentType) => {
    setFileList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, detectedType: newType } : item))
    );
  };

  const loadSampleDocs = () => {
    setErrorMsg(null);
    const sampleFiles: UploadFileItem[] = [
      {
        id: 'sample_gst',
        name: 'ACME_GST_Registration_REG06.pdf',
        size: 420 * 1024,
        mimeType: 'application/pdf',
        detectedType: 'gst_certificate',
        isSample: true
      },
      {
        id: 'sample_pan',
        name: 'ACME_Company_PAN_Card.png',
        size: 310 * 1024,
        mimeType: 'image/png',
        detectedType: 'pan_card',
        isSample: true
      },
      {
        id: 'sample_cheque',
        name: 'HDFC_Cancelled_Cheque_Leaf.jpg',
        size: 580 * 1024,
        mimeType: 'image/jpeg',
        detectedType: 'bank_proof',
        isSample: true
      },
      {
        id: 'sample_udyam',
        name: 'Udyam_MSME_Certificate_MH.pdf',
        size: 260 * 1024,
        mimeType: 'application/pdf',
        detectedType: 'udyam_certificate',
        isSample: true
      }
    ];

    setFileList(sampleFiles);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit = fileList.length >= 2 && !isLoading;

  return (
    <div className="w-full space-y-6">
      {/* Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border border-dashed p-8 text-center transition-all duration-150 ${
          dragActive
            ? 'border-neutral-900 bg-neutral-50'
            : 'border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50/40 shadow-2xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3.5">
          <div className="w-12 h-12 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200/80">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-950">
              Drag and drop your vendor statutory documents here
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Accepts <span className="font-semibold text-neutral-700">PDF, JPG, PNG</span> (3 to 8 files, max 15MB each)
            </p>
          </div>

          {/* Document Type Guide Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-2xl">
            {[
              'GST Certificate',
              'PAN Card',
              'Cancelled Cheque / Bank Proof',
              'Udyam / MSME Certificate',
              'Incorporation Proof',
              'Buyer Vendor Form'
            ].map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200/80"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              Browse Files from Computer
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleDocs();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#235327] bg-[#EDF3EC] hover:bg-[#E2EDE1] rounded-md border border-[#D2E3D0] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#235327]" />
              <span>Load 4 Sample Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-[#FDEBEC] border border-[#F6C7C9] text-[#8C2220] rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {fileList.length > 0 && (
        <div className="space-y-3 bg-white rounded-xl p-5 border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/70">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-neutral-900" />
              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider font-mono">
                Uploaded Documents ({fileList.length}/8)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setFileList([])}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {fileList.map((item, index) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-neutral-50/60 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-5 text-center font-mono text-[11px] text-neutral-400">{index + 1}</span>
                  <div className="w-7 h-7 rounded bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                    {item.mimeType.includes('pdf') ? (
                      <FileText className="w-3.5 h-3.5 text-neutral-700" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-neutral-950 truncate max-w-xs sm:max-w-md">{item.name}</p>
                    <p className="text-[11px] font-mono text-neutral-500">{formatSize(item.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={item.detectedType}
                    onChange={(e) => updateDocType(item.id, e.target.value as DocumentType)}
                    className="bg-white border border-neutral-300 rounded-md px-2.5 py-1 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="gst_certificate">GST Certificate</option>
                    <option value="pan_card">PAN Card</option>
                    <option value="bank_proof">Bank Cheque / Proof</option>
                    <option value="udyam_certificate">Udyam / MSME</option>
                    <option value="incorporation_certificate">Incorporation Proof</option>
                    <option value="partnership_deed">Partnership Deed</option>
                    <option value="vendor_form">Buyer Form</option>
                    <option value="other">Other Attachment</option>
                  </select>

                  <span className="px-2 py-0.5 rounded bg-[#EDF3EC] text-[#235327] text-[10px] font-mono font-medium border border-[#D2E3D0] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Action */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200/70">
            <p className="text-xs text-neutral-500">
              {fileList.length < 2
                ? 'Upload at least 2 documents to run consistency check.'
                : 'Ready to cross-check business tax identifiers and banking proof.'}
            </p>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => onStartPreflight(fileList)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs transition-all ${
                canSubmit
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs active:scale-[0.98]'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
              }`}
            >
              <span>Run Preflight Check (Free)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
