import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../common/Logo';
import { 
  Lock, Mail, ShieldCheck, ArrowRight, Sparkles, 
  KeyRound, Eye, EyeOff, RotateCcw, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onNavigateHome }) => {
  const { login, loginAsDemoAdmin, resetAdminPassword, getAdminPassword } = useAuth();
  const { showToast } = useStore();

  const [email, setEmail] = useState('admin@mj.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset password state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid admin credentials');
        setIsLoading(false);
        return;
      }

      if (!['super_admin', 'admin', 'manager', 'editor', 'order_manager'].includes(res.user?.role || '')) {
        setError('This account does not have administrative access permissions.');
        setIsLoading(false);
        return;
      }

      showToast(`Welcome Santo Admin! Logged into Admin Panel`, 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOneClickAdmin = () => {
    setError(null);
    loginAsDemoAdmin();
    showToast('Logged in as Santo Admin (Super Admin)', 'success');
    onSuccess();
  };

  const handleQuickResetToDefault = () => {
    try {
      resetAdminPassword('admin123');
      setPassword('admin123');
      setSuccessMsg('Admin password has been reset to default: admin123');
      showToast('Admin password reset to: admin123', 'success');
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to reset password');
    }
  };

  const handleSaveNewPasswordAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setError('New password and confirmation password do not match.');
      return;
    }

    try {
      resetAdminPassword(newPasswordInput.trim());
      showToast('Admin password updated successfully!', 'success');
      // Directly log in with new password
      loginAsDemoAdmin();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 antialiased selection:bg-pink-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-block cursor-pointer" onClick={onNavigateHome}>
            <Logo size="lg" variant="light" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold border border-pink-500/30 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
            MJ Control Portal
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">
            Admin Access Portal
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to manage catalog, inventory, orders & settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-2xl text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* 1-Click Fast Login (Guaranteed Instant Access) */}
        <button
          type="button"
          onClick={handleOneClickAdmin}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:from-pink-500 hover:to-sky-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          Direct Admin Access (1-Click Login)
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Or login with credentials
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mj.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsResetOpen(!isResetOpen)}
                className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2"
              >
                {isResetOpen ? 'Close Password Tool' : 'Change / Reset Password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 pr-10 placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
              <span>Default password: <strong className="text-slate-200 font-mono">admin123</strong></span>
              <button
                type="button"
                onClick={handleQuickResetToDefault}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset to admin123
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-700 transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>

        {/* Change / Reset Password Panel */}
        {isResetOpen && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-pink-400 font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Change / Set New Admin Password</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              পাসওয়ার্ড পরিবর্তন করতে নিচে নতুন পাসওয়ার্ড দিন এবং সেভ করুন।
            </p>

            <form onSubmit={handleSaveNewPasswordAndLogin} className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password (min 4 chars)"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white pr-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs"
                >
                  Save & Login Directly
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            ← Back to Customer Store
          </button>
        </div>

      </div>
    </div>
  );
};
