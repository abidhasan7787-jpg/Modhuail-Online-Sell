import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { PaymentMethod } from '../../types';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod;
  amount: number;
  orderNumber: string;
  onSuccess: (transactionId: string) => void;
  onFailure: (reason: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  method,
  amount,
  orderNumber,
  onSuccess,
  onFailure,
}) => {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing'>('number');
  const [walletNumber, setWalletNumber] = useState('');
  const [otp, setOtp] = useState('1234');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const gatewayThemes = {
    bkash: {
      name: 'bKash Merchant Payment',
      color: 'bg-[#e2136e]',
      textColor: 'text-[#e2136e]',
      borderColor: 'border-[#e2136e]',
      lightBg: 'bg-pink-50',
      logo: 'bKash',
      phonePrefix: '01',
    },
    nagad: {
      name: 'Nagad Gateway',
      color: 'bg-[#f7941d]',
      textColor: 'text-[#f7941d]',
      borderColor: 'border-[#f7941d]',
      lightBg: 'bg-amber-50',
      logo: 'Nagad',
      phonePrefix: '01',
    },
    rocket: {
      name: 'Rocket Mobile Banking',
      color: 'bg-[#8c3494]',
      textColor: 'text-[#8c3494]',
      borderColor: 'border-[#8c3494]',
      lightBg: 'bg-purple-50',
      logo: 'Rocket',
      phonePrefix: '01',
    },
    card: {
      name: 'Secure Card Payment (SSLCommerz Demo)',
      color: 'bg-sky-600',
      textColor: 'text-sky-600',
      borderColor: 'border-sky-600',
      lightBg: 'bg-sky-50',
      logo: 'VISA / Mastercard',
      phonePrefix: '',
    },
    cod: {
      name: 'Cash on Delivery',
      color: 'bg-slate-800',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-800',
      lightBg: 'bg-slate-50',
      logo: 'COD',
      phonePrefix: '',
    }
  };

  const theme = gatewayThemes[method] || gatewayThemes.bkash;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletNumber.length < 11) {
      setError('Please provide a valid 11-digit Bangladesh mobile account number.');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }
    setError(null);
    setStep('pin');
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter your 4 or 5-digit PIN.');
      return;
    }
    setError(null);
    setStep('processing');

    setTimeout(() => {
      const generatedTxnId = `${method.toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
      onSuccess(generatedTxnId);
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center">
        {/* Gateway Banner */}
        <div className={`p-4 rounded-2xl ${theme.color} text-white mb-6 shadow-md`}>
          <div className="text-lg font-black tracking-wider uppercase mb-1">
            {theme.name}
          </div>
          <p className="text-xs text-white/90">
            Sandbox Demo Environment (Real money is NOT charged)
          </p>
          <div className="mt-3 py-2 px-3 bg-white/20 rounded-xl flex justify-between items-center text-xs font-bold">
            <span>Invoice: {orderNumber}</span>
            <span>Amount: ৳{amount.toLocaleString('en-BD')}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: WALLET NUMBER */}
        {step === 'number' && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your {theme.logo} Account Number:
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={walletNumber}
                  onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Demo tip: Enter any 11-digit mobile number (e.g. 01712345678)
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onFailure('Customer cancelled payment transaction.');
                  onClose();
                }}
                className="flex-1 py-2.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl ${theme.color} hover:opacity-95 shadow-md flex items-center justify-center gap-1.5`}
              >
                Confirm Account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DEMO OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Verification Code (OTP):
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                Demo OTP sent to {walletNumber}. Use default <strong>1234</strong>.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('number')}
                className="flex-1 py-2.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl ${theme.color} hover:opacity-95 shadow-md`}
              >
                Verify Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: DEMO PIN */}
        {step === 'pin' && (
          <form onSubmit={handleConfirmPin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter {theme.logo} PIN:
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={5}
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                Demo sandbox: Enter any 4 or 5 digits (e.g. 12345).
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="flex-1 py-2.5 text-xs text-slate-600 font-semibold border border-slate-200 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl ${theme.color} hover:opacity-95 shadow-md`}
              >
                Confirm Payment
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: PROCESSING */}
        {step === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-pink-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-800">
              Verifying transaction with {theme.logo} network...
            </p>
            <p className="text-xs text-slate-400">
              Please do not refresh or close this window.
            </p>
          </div>
        )}

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>256-Bit SSL Encrypted & Verified Banking Session</span>
        </div>
      </div>
    </Modal>
  );
};
