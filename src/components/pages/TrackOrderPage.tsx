import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';

interface TrackOrderPageProps {
  initialParam?: string;
  onNavigate: (route: string, param?: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ initialParam, onNavigate }) => {
  const { formatPrice } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialParam) {
      const params = new URLSearchParams(initialParam);
      const orderParam = params.get('order');
      if (orderParam) {
        setSearchInput(orderParam);
        const found = db.getOrderById(orderParam);
        if (found) setOrder(found);
        setHasSearched(true);
      }
    }
  }, [initialParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const term = searchInput.trim().toUpperCase();
    const orders = db.getOrders();
    const matched = orders.find(
      (o) => o.order_number.toUpperCase() === term || o.customer_phone === searchInput.trim()
    );

    setOrder(matched || null);
    setHasSearched(true);
  };

  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Atelier Processing' },
    { key: 'shipped', label: 'Dispatched / In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    if (status === 'returned' || status === 'refunded') return 5;
    const index = steps.findIndex((s) => s.key === status);
    return index !== -1 ? index : 1;
  };

  const currentStepIdx = order ? getStepIndex(order.order_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
      
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
          Real-time Shipment Logistics
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">
          Track Your MJ Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your Order Number (e.g. MJ-202610-8492) or contact phone number to track delivery.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. MJ-202610-8492 or 01711223344"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs uppercase tracking-wider font-semibold text-slate-900 focus:outline-none focus:border-pink-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md shrink-0"
        >
          Track
        </button>
      </form>

      {/* Result Container */}
      {hasSearched && !order && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No matching order found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Please double-check your order number or phone. You can also contact our Banani support line at +880 1700-123456.
          </p>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Order Tracking ID
              </span>
              <h2 className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {order.order_number}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100">
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Graphical Step Progress */}
          {order.order_status !== 'cancelled' ? (
            <div className="py-4">
              <div className="grid grid-cols-5 relative">
                {/* Horizontal Progress Bar Track */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-sky-500 transition-all duration-500"
                    style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {steps.map((st, i) => {
                  const isCompleted = i <= currentStepIdx;
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                          isCompleted
                            ? 'bg-pink-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-200 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 mt-2 leading-tight">
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold">
              This order was cancelled. If you need assistance, please contact customer care.
            </div>
          )}

          {/* Delivery & Items details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Recipient & Delivery
              </span>
              <p className="font-bold text-slate-900">{order.customer_name}</p>
              <p className="text-slate-600">{order.shipping_address.street_address}</p>
              <p className="text-slate-600">
                {order.shipping_address.upazila}, {order.shipping_address.district}
              </p>
              <p className="text-slate-600 font-mono">Mobile: {order.customer_phone}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Payment & Total
              </span>
              <p className="font-bold text-slate-900">
                Payment Method: {order.payment_method.toUpperCase()}
              </p>
              <p className="text-slate-600">
                Payment Status:{' '}
                <strong className={order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                  {order.payment_status.toUpperCase()}
                </strong>
              </p>
              <p className="text-slate-900 font-bold text-sm pt-1">
                Total Payable: {formatPrice(order.total_amount)}
              </p>
            </div>
          </div>

          {/* Ordered items list */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ordered Garments ({order.items.length})
            </h4>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-10 h-14 object-cover rounded-lg bg-slate-100"
                    />
                    <div>
                      <h5 className="font-bold text-slate-800">{item.product_name}</h5>
                      <p className="text-slate-400 font-mono text-[11px]">
                        Qty: {item.quantity} {item.size && `• Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
