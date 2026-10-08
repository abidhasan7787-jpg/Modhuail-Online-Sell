import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Tag, Check, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { formatPrice, showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(1500);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [usageLimit, setUsageLimit] = useState<number>(500);

  useEffect(() => {
    const load = () => setCoupons(db.getCoupons());
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, []);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    db.createCoupon({
      code: code.trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_amount: Number(minOrder),
      max_discount_amount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 90).toISOString(),
      usage_limit: Number(usageLimit),
      per_user_limit: 1,
      is_active: true,
    });

    showToast(`Created promo code "${code.toUpperCase()}"`, 'success');
    setIsModalOpen(false);
    setCode('');
  };

  const handleToggle = (c: Coupon) => {
    db.updateCoupon(c.id, { is_active: !c.is_active });
    showToast(`Coupon ${c.code} is now ${!c.is_active ? 'Active' : 'Disabled'}`, 'info');
  };

  const handleDelete = (id: string, codeStr: string) => {
    if (confirm(`Delete coupon "${codeStr}"?`)) {
      db.deleteCoupon(id);
      showToast(`Deleted coupon "${codeStr}"`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-serif">Promo Coupons & Vouchers</h2>
          <p className="text-xs text-slate-500">Configure promotional discount codes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Spend</th>
                <th className="p-4">Used / Limit</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-mono font-bold text-slate-900">
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                      {c.code}
                    </span>
                  </td>

                  <td className="p-4 font-bold text-slate-900">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% Off` : formatPrice(c.discount_value)}
                  </td>

                  <td className="p-4 text-slate-600">
                    {formatPrice(c.min_order_amount)}
                  </td>

                  <td className="p-4 text-slate-600">
                    {c.used_count} / {c.usage_limit}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              placeholder="e.g. SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Minimum Order (৳)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Usage Limit</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 border border-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-pink-600 text-white rounded-xl font-bold shadow-md"
            >
              Save Coupon
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
