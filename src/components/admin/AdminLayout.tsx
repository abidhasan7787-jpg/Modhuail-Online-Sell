import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import { 
  LayoutDashboard, ShoppingBag, Layers, ShoppingCart, 
  Tag, Image, Settings, FileText, Activity, ShieldCheck, 
  LogOut, ExternalLink, Menu, X, CheckCircle2, AlertTriangle, KeyRound 
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onNavigateHome,
  children,
}) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products & Variants', icon: ShoppingBag },
    { key: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
    { key: 'categories', label: 'Categories & Brands', icon: Layers },
    { key: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
    { key: 'banners', label: 'Hero Banners & CMS', icon: Image },
    { key: 'activity', label: 'Activity Logs', icon: Activity },
    { key: 'settings', label: 'Store & Shipping Settings', icon: Settings },
    { key: 'security', label: 'Admin Password & Security', icon: KeyRound },
    { key: 'qa-audit', label: 'System QA Audit Suite', icon: ShieldCheck, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col md:flex-row antialiased">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-white shrink-0 border-r border-slate-900">
        
        {/* Brand header */}
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <div onClick={onNavigateHome} className="cursor-pointer">
            <Logo size="sm" variant="light" />
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
            ADMIN
          </span>
        </div>

        {/* Current Admin user tag */}
        <div 
          onClick={() => onTabChange('security')}
          className="px-5 py-4 bg-slate-900/60 border-b border-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors group"
          title="Click to manage account password & security"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Santo Admin'}</p>
              <p className="text-[10px] text-pink-400 font-semibold uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'Super Admin'}
              </p>
            </div>
          </div>
          <KeyRound className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors shrink-0" />
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.highlight && !isActive
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 hover:bg-emerald-900/40'
                    : isActive
                    ? 'bg-gradient-to-r from-pink-600 to-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Customer Store
          </button>
          <button
            onClick={() => {
              logout();
              onNavigateHome();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <div className="md:hidden bg-slate-950 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-900">
        <Logo size="sm" variant="light" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange('qa-audit')}
            className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
          >
            QA Suite
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 space-y-1 border-b border-slate-800 animate-slide-down">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onTabChange(item.key);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${
                currentTab === item.key ? 'bg-pink-600 text-white' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={onNavigateHome}
              className="flex-1 py-2 bg-slate-800 text-xs font-bold text-center rounded-lg"
            >
              Customer Store
            </button>
            <button
              onClick={() => {
                logout();
                onNavigateHome();
              }}
              className="flex-1 py-2 bg-red-900/50 text-xs font-bold text-center text-red-200 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar Header with Realtime Database Status Badge */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-serif text-slate-900 capitalize">
              {currentTab.replace('-', ' ')}
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Database Engine Active (Live Sync)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('security')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors"
              title="Change Admin Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-pink-600" />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => onTabChange('qa-audit')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Run QA Test Audit
            </button>
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline underline-offset-4"
            >
              Store Preview →
            </button>
          </div>
        </div>

        {/* Workspace Container */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>

    </div>
  );
};
