import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { StoreSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Save, Store, Truck, CreditCard, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export const AdminSettings: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { showToast } = useStore();
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(db.getStoreSettings());

  useEffect(() => {
    setSettings(db.getStoreSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateStoreSettings(settings);
    showToast('Store settings & shipping rules updated.', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-slate-900 font-serif">Store & Shipping Settings</h2>
        <p className="text-xs text-slate-500">Configure business information, Bangladesh delivery fees, and gateways.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-pink-600" />
            General Store Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer Care Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Banani Atelier Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-600" />
            Bangladesh Delivery Rates (৳ BDT)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Inside Dhaka Shipping (৳)</label>
              <input
                type="number"
                value={settings.inside_dhaka_shipping}
                onChange={(e) => setSettings({ ...settings, inside_dhaka_shipping: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Outside Dhaka Shipping (৳)</label>
              <input
                type="number"
                value={settings.outside_dhaka_shipping}
                onChange={(e) => setSettings({ ...settings, outside_dhaka_shipping: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Delivery Threshold (৳)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Payments Mode */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Payment Gateway Environment
          </h3>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={settings.demo_payment_enabled}
                onChange={(e) => setSettings({ ...settings, demo_payment_enabled: e.target.checked })}
                className="rounded accent-pink-600"
              />
              Enable bKash / Nagad / Rocket Sandbox Gateways
            </label>
          </div>
        </div>

        {/* Admin Password & Security Quick Access */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Admin Account Security</span>
            </div>
            <h4 className="text-sm font-bold text-white font-serif">
              Administrator Password & Access Management
            </h4>
            <p className="text-slate-400 text-xs">
              Signed in as <strong className="text-slate-200">{user?.email || 'admin@mj.com'}</strong>. Change your password or manage credentials.
            </p>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('security')}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-sm"
            >
              <span>Change Password Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:opacity-95"
        >
          <Save className="w-4 h-4" /> Save Store Configuration
        </button>
      </form>
    </div>
  );
};
