import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Order, Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  DollarSign, ShoppingCart, Clock, AlertTriangle, 
  TrendingUp, Users, ArrowRight, CheckCircle2, ShieldCheck 
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { formatPrice, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      setOrders(db.getOrders());
      setProducts(db.getProducts());
    };
    load();
    const unsubscribe = db.subscribe(load);
    return unsubscribe;
  }, []);

  const totalSales = orders
    .filter((o) => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingOrders = orders.filter((o) => o.order_status === 'pending');
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const handleQuickStatusChange = (orderId: string, newStatus: any) => {
    try {
      db.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleRestock = (productId: string) => {
    try {
      const prod = db.getProductById(productId);
      if (prod) {
        db.updateProduct(productId, { stock: prod.stock + 10 });
        showToast(`Added +10 stock to ${prod.name}`, 'success');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatPrice(totalSales)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            +18.4% from last month
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {orders.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {pendingOrders.length} orders pending fulfillment
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Products</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {products.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {products.filter(p => p.is_published).length} published in shop
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {lowStockProducts.length + outOfStockProducts.length}
          </div>
          <p className="text-[11px] text-orange-600 font-semibold">
            {outOfStockProducts.length} completely sold out
          </p>
        </div>

      </div>

      {/* Quick Launch Action Banner */}
      <div className="p-6 bg-gradient-to-r from-pink-900 via-rose-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Production Zero-Bug QA Engine
          </div>
          <h3 className="text-lg font-bold font-serif">Run Full System Automated Audit</h3>
          <p className="text-xs text-slate-200">
            Validate all 24 criteria: database integrity, atomic inventory deduction, coupons, and payments.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('qa-audit')}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shrink-0 flex items-center gap-2"
        >
          Run Audit Suite <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-serif">Recent Customer Orders</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-pink-600 font-semibold hover:underline"
            >
              View all orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {ord.order_number}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{ord.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{ord.shipping_address.district}</p>
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700">
                        {ord.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {ord.order_status === 'pending' && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'confirmed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                      )}
                      {ord.order_status === 'confirmed' && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'shipped')}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Ship Parcel
                        </button>
                      )}
                      {ord.order_status === 'shipped' && (
                        <button
                          onClick={() => handleQuickStatusChange(ord.id, 'delivered')}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {ord.order_status === 'delivered' && (
                        <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-serif">Low Stock Alert</h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs text-sky-600 font-semibold hover:underline"
            >
              Catalog
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All inventory is well stocked.</p>
            ) : (
              [...lowStockProducts, ...outOfStockProducts].slice(0, 5).map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-orange-600 font-semibold">
                      {p.stock === 0 ? 'Out of stock' : `Only ${p.stock} units remaining`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestock(p.id)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shrink-0"
                  >
                    +10 Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
