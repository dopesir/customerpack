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

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  packetId: string;
  onPaymentSuccess: () => void;
}

export function RazorpayModal({
  isOpen,
  onClose,
  packetId,
  onPaymentSuccess
}: RazorpayModalProps) {
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
      // 1. Create order on server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packetId, plan: selectedPlan })
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // If demo mode or keys unconfigured, switch to UPI QR modal seamlessly
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
        currency: orderData.currency,
        name: 'VendorPack',
        description:
          selectedPlan === 'single'
            ? 'Single Vendor Dossier Pack'
            : '5-Pack Pro Vendor Pass',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify signature on server
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packetId,
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
      console.warn('Payment init issue, switching to UPI fallback:', err);
      setShowUpiModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualUpiVerify = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const mockPayId = upiRefNumber.trim()
        ? `pay_upi_${upiRefNumber.trim()}`
        : `pay_demo_${Date.now()}`;

      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packetId,
          orderId: `order_mock_${packetId.substring(0, 8)}`,
          paymentId: mockPayId,
          signature: 'demo_verified_sig',
          plan: selectedPlan
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        triggerConfetti();
        onPaymentSuccess();
        onClose();
      } else {
        setErrorMsg(verifyData.error || 'Verification failed');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification error');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-neutral-200">
        {/* Faux-OS Minimalist Window Chrome */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 border border-neutral-400/50" />
            </div>
            <div className="ml-1">
              <h3 className="text-xs font-bold text-neutral-950">Unlock Clean Corporate Dossier</h3>
              <p className="text-[11px] font-mono text-neutral-500">Instant vector unwatermarked PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-neutral-800">
          {!showUpiModal ? (
            <>
              {/* Plan Selection */}
              <div className="space-y-3">
                {/* Single Pack */}
                <div
                  onClick={() => setSelectedPlan('single')}
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedPlan === 'single'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-neutral-950 text-xs">Single Vendor Pack</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 text-white font-bold">
                        Popular
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      1 unwatermarked submission-ready PDF with cover &amp; hyperlinked index
                    </p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-lg font-bold font-mono text-neutral-950">₹299</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">One-time</span>
                  </div>
                </div>

                {/* 5-Pack Pass */}
                <div
                  onClick={() => setSelectedPlan('five_pack')}
                  className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                    selectedPlan === 'five_pack'
                      ? 'border-neutral-950 bg-neutral-50/80'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-neutral-950 text-xs">5-Pack Pro Pass</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EDF3EC] text-[#235327] border border-[#D2E3D0]">
                        Save 46%
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-tight">
                      5 clean packs for multiple entities, CAs, and active contractors
                    </p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-lg font-bold font-mono text-neutral-950">₹799</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">₹160 / pack</span>
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="p-3.5 rounded-lg bg-neutral-50/60 border border-neutral-200/80 space-y-1.5 text-xs">
                <p className="font-semibold text-neutral-900 mb-1 text-[11px] uppercase font-mono tracking-wider">What you receive instantly:</p>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#235327] flex-shrink-0" />
                  <span>Unwatermarked high-resolution corporate vector PDF</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#235327] flex-shrink-0" />
                  <span>Executive Vendor Profile Cover Sheet + Hyperlinked TOC</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#235327] flex-shrink-0" />
                  <span>Sequentially stamped running headers and page numbers</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#FDEBEC] border border-[#F6C7C9] text-[#8C2220] rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Pay Trigger Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-2.5 px-5 rounded-md font-semibold text-xs text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay ₹{price} &amp; Unlock Clean Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-400 font-mono pt-1">
                <span>UPI · Google Pay · PhonePe · Cards · Netbanking</span>
              </div>
            </>
          ) : (
            /* Dynamic UPI QR Fallback Modal */
            <div className="space-y-4 text-center">
              <div className="p-4 bg-neutral-50/80 border border-neutral-200 rounded-lg space-y-2">
                <div className="inline-flex p-3 rounded-lg bg-white text-neutral-900 border border-neutral-200 shadow-2xs">
                  <QrColorIcon />
                </div>
                <h4 className="font-bold text-neutral-950 text-xs">Instant UPI Payment (₹{price})</h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Scan using Google Pay, PhonePe, Paytm or BHIM UPI app
                </p>
                <div className="pt-1">
                  <span className="font-mono font-bold text-xs bg-white px-3 py-1.5 rounded border border-neutral-200 text-neutral-950 inline-block">
                    UPI ID: vendorpack@upi
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-neutral-800 block">
                  UPI Reference / UTR Number (Optional for Demo):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 328192837192"
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#FDEBEC] border border-[#F6C7C9] text-[#8C2220] rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  className="w-1/3 py-2 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-md bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleManualUpiVerify}
                  className="w-2/3 py-2 px-4 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] rounded-md transition-all shadow-2xs flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Confirm Payment &amp; Unlock</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QrColorIcon() {
  return <QrCode className="w-8 h-8 text-neutral-900" />;
}
