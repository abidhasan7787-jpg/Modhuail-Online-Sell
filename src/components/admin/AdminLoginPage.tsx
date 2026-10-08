import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../common/Logo';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onNavigateHome,
}) => {
  const { login } = useAuth();
  const { showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both admin email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = login(email.trim(), password.trim());
      if (!result.success) {
        setError(result.error || 'Invalid admin credentials. Access denied.');
        return;
      }

      if (result.user?.role === 'customer') {
        setError('This account does not have administrative privileges.');
        return;
      }

      showToast(`Authentication successful. Welcome to Admin Portal.`, 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            Sign in with authorized administrator credentials.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-2xl text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

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
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white pl-9 placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-sky-600 hover:from-pink-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In as Admin'}
          </button>
        </form>

        {/* Back to Customer Store */}
        <div className="text-center pt-2 border-t border-slate-800/80">
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
