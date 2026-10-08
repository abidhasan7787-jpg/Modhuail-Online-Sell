import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Logo } from '../common/Logo';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthPagesProps {
  initialMode?: 'login' | 'register';
  onNavigate: (route: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode = 'login', onNavigate }) => {
  const { login, register } = useAuth();
  const { showToast } = useStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Login failed.');
        return;
      }
      showToast(`Welcome back, ${res.user?.full_name}!`, 'success');
      if (['super_admin', 'admin', 'manager', 'editor', 'order_manager'].includes(res.user?.role || '')) {
        onNavigate('admin');
      } else {
        onNavigate('account');
      }
    } else if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setError('Please fill in all registration fields.');
        return;
      }
      const res = register(fullName, email, phone, password);
      if (!res.success) {
        setError(res.error || 'Registration failed.');
        return;
      }
      showToast(`Welcome to MJ, ${res.user?.full_name}!`, 'success');
      onNavigate('account');
    } else if (mode === 'forgot') {
      showToast('If an account exists for this email, reset instructions have been sent.', 'info');
      setMode('login');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block" onClick={() => onNavigate('home')}>
            <Logo size="md" />
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900 mt-2">
            {mode === 'login' ? 'Sign in to MJ' : mode === 'register' ? 'Join the MJ Circle' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Access orders, wishlist & express checkout'
              : mode === 'register'
              ? 'Create your account for bespoke recommendations'
              : 'Enter your registered email address'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Abid Hasan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (BD)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-pink-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-pink-500/20 active:scale-[0.99] transition-all"
          >
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              New to MJ?{' '}
              <button onClick={() => setMode('register')} className="text-pink-600 font-bold hover:underline">
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-pink-600 font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
