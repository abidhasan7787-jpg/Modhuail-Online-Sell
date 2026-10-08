import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { 
  Search, Eye, CheckCircle2, Truck, XCircle, 
  Clock, Package, MapPin, Printer 
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { formatPrice, showToast } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = () => {
      setOrders(db.getOrders());
    };
    load();
    const unsub = db.subscribe(load);
    return unsub;
  }, []);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = db.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${updated.order_number} marked as ${newStatus.toUpperCase()}`, 'success');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.order_status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return true;
  });

  const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs pl-8 focus:outline-none focus:border-pink-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs capitalize"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statuses.map((st) => (
              <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total & Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono">
                    <span className="font-bold text-slate-900 block">{ord.order_number}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-800">{ord.customer_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{ord.customer_phone}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">
                      {ord.shipping_address.upazila}, {ord.shipping_address.district}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-700">{ord.items.length} items</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">
                      {ord.items.map((i) => i.product_name).join(', ')}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900">{formatPrice(ord.total_amount)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {ord.payment_method} • {ord.payment_status}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={ord.order_status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 uppercase focus:outline-none focus:border-pink-500"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.order_number}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Status & Payment header */}
            <div className="p-4 bg-slate-50 rounded-2xl flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Current Status
                </span>
                <span className="text-sm font-bold text-pink-700 uppercase">
                  {selectedOrder.order_status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Payment
                </span>
                <span className="text-sm font-bold text-emerald-700 uppercase">
                  {selectedOrder.payment_method} ({selectedOrder.payment_status})
                </span>
              </div>
            </div>

            {/* Recipient info */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                Delivery Address:
              </span>
              <p className="font-bold text-slate-900">{selectedOrder.customer_name}</p>
              <p className="text-slate-600">{selectedOrder.shipping_address.street_address}</p>
              <p className="text-slate-600">
                {selectedOrder.shipping_address.upazila}, {selectedOrder.shipping_address.district}, {selectedOrder.shipping_address.division}
              </p>
              <p className="text-slate-500 font-mono">Phone: {selectedOrder.customer_phone}</p>
            </div>

            {/* Items table */}
            <div className="divide-y divide-slate-100">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt={it.product_name} className="w-10 h-14 object-cover rounded-lg bg-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800">{it.product_name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">
                        SKU: {it.sku} {it.size && `• Size: ${it.size}`} {it.color && `• Color: ${it.color}`}
                      </p>
                      <p className="text-slate-500">Qty: {it.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-slate-100 space-y-1 text-right">
              <p>Subtotal: <strong>{formatPrice(selectedOrder.subtotal)}</strong></p>
              {selectedOrder.discount_amount > 0 && (
                <p className="text-emerald-600">Coupon Discount: <strong>-{formatPrice(selectedOrder.discount_amount)}</strong></p>
              )}
              <p>Shipping: <strong>{selectedOrder.shipping_fee === 0 ? 'FREE' : formatPrice(selectedOrder.shipping_fee)}</strong></p>
              <p className="text-base font-black text-pink-600 pt-1">Total: {formatPrice(selectedOrder.total_amount)}</p>
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex gap-2">
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                className="flex-1 py-2 bg-sky-600 text-white font-bold rounded-xl"
              >
                Dispatch / Mark Shipped
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
