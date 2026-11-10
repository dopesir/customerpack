'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  CreditCard,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CustomerPackPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packId: string;
  token: string;
  supplierName: string;
  customerName?: string;
  onPaymentSuccess: () => void;
}

export function CustomerPackPaymentModal({
  isOpen,
  onClose,
  packId,
  token,
  supplierName,
  customerName,
  onPaymentSuccess
}: CustomerPackPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'five_pack'>('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const price = selectedPlan === 'single' ? 299 : 799;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Initialize order
      const res = await fetch(`/api/packs/${packId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment.');
      }

      // If demo mode or test fallback
      if (orderData.isDemoMode) {
        setShowUpiModal(true);
        setIsProcessing(false);
        return;
      }

      // 2. Load script & trigger Razorpay Modal
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setShowUpiModal(true);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Customer Pack',
        description:
          selectedPlan === 'single'
            ? `Submission Dossier · ${customerName || 'Empanelment'}`
            : '5-Pack Pro Pass · Multi-Customer Empanelment',
        order_id: orderData.orderId,
        prefill: {
          name: supplierName
        },
        handler: async function (response: any) {
          // 3. Verify signature on server
          const verifyRes = await fetch(`/api/packs/${packId}/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan: selectedPlan
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            triggerConfetti();
            onPaymentSuccess();
            onClose();
          } else {
            setErrorMsg(verifyData.error || 'Payment verification failed.');
          }
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(`Payment failed: ${resp.error?.description || 'Transaction canceled'}`);
      });
      rzp.open();
    } catch (err: any) {
      console.warn('Razorpay init fallback triggered:', err);
      setShowUpiModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatedVerify = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const mockPayId = upiRefNumber.trim()
        ? `pay_upi_${upiRefNumber.trim()}`
        : `pay_demo_${Date.now()}`;

      const verifyRes = await fetch(`/api/packs/${packId}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          orderId: `order_demo_${packId.substring(0, 10)}`,
          paymentId: mockPayId,
          signature: 'demo_signature_valid',
          plan: selectedPlan
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        triggerConfetti();
        onPaymentSuccess();
        onClose();
      } else {
        setErrorMsg(verifyData.error || 'Verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if blocked
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* Faux-OS Window Chrome */}
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 ml-2">Dossier Release {'//'} Step 02</span>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title Bar */}
        <div className="px-6 pt-5 pb-3 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight">Unlock Submission Dossier</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Watermark-free compiled PDF with index & running headers</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
            Nobuswork Engine
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#FDEBEC] border border-[#F6C7C9] text-[#9F2F2D] rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!showUpiModal ? (
            <>
              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedPlan('single')}
                  className={`cursor-pointer rounded-lg p-4 border transition-all ${
                    selectedPlan === 'single'
                      ? 'border-neutral-950 bg-neutral-50/70 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-neutral-900">Single Dossier</span>
                    {selectedPlan === 'single' && (
                      <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                    )}
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">₹299</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    One finalized submission pack for {customerName || 'this customer'}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedPlan('five_pack')}
                  className={`cursor-pointer rounded-lg p-4 border transition-all relative ${
                    selectedPlan === 'five_pack'
                      ? 'border-neutral-950 bg-neutral-50/70 shadow-2xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 bg-neutral-900 text-white font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full">
                    SAVE 46%
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-neutral-900">5-Pack Pass</span>
                    {selectedPlan === 'five_pack' && (
                      <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                    )}
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-neutral-900">₹799</div>
                  <div className="text-[11px] text-neutral-500 mt-1">₹160 per pack for multiple RFQs/buyers</div>
                </div>
              </div>

              {/* What is Included */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 space-y-2 text-xs text-neutral-700">
                <div className="font-semibold text-neutral-900 text-xs mb-1.5 flex items-center justify-between">
                  <span>Included in Dossier Package</span>
                  <span className="text-[10px] font-mono text-neutral-400">INSTANT OUTPUT</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                  <span>Customer-specific branded cover page & table of contents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                  <span>Sequential numbering (&ldquo;Page X of Y&rdquo;) &amp; running footer on all sheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                  <span>Typeset signed undertakings (Debarment, Code of Conduct, MSME)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800 flex-shrink-0" />
                  <span>Permanent watermark removal & instant high-resolution PDF output</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-md bg-[#111111] hover:bg-[#2A2A2A] active:scale-[0.98] text-white font-medium text-xs tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Pay ₹{price}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Direct UPI / Instant Demo Modal */
            <div className="space-y-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 flex items-center justify-center mx-auto">
                <QrCode className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-neutral-900">Direct Payment & Demo Mode</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  UPI ID: <span className="font-mono font-semibold text-neutral-800">customerpack@upi</span> · ₹{price}
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-left space-y-2">
                <label className="block text-xs font-medium text-neutral-700">
                  UPI Reference / UTR Number <span className="text-neutral-400 font-normal">(or leave empty for test)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 504938291039"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-neutral-300 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUpiModal(false)}
                  className="flex-1 py-2 px-3 rounded-md border border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSimulatedVerify}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 rounded-md bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-medium active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm & Unlock Pack</span>}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
            <Lock className="w-3.5 h-3.5 text-neutral-600" />
            <span>Secure 256-bit payment · Ephemeral files · Instant PDF download</span>
          </div>
        </div>
      </div>
    </div>
  );
}
