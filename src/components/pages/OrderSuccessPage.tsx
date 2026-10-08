import React from 'react';
import { db } from '../../services/db';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Package, Printer, ArrowRight, Truck, MapPin } from 'lucide-react';

interface OrderSuccessPageProps {
  orderId: string;
  onNavigate: (route: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, onNavigate }) => {
  const { formatPrice } = useStore();
  const order = db.getOrderById(orderId);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order confirmed!</h2>
        <p className="text-xs text-slate-500 mt-2">Thank you for ordering from MJ.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in space-y-8">
      
      {/* Success Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
          Thank you for choosing MJ
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          Order Successfully Placed!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          We have received your order. Our Banani atelier team is preparing your package for express dispatch.
        </p>

        <div className="pt-2">
          <span className="inline-block px-4 py-2 bg-slate-100 rounded-xl font-mono text-sm font-bold text-slate-800 border border-slate-200">
            Order Reference: {order.order_number}
          </span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6 print:border-none print:shadow-none">
        
        {/* Header with Meta */}
        <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900">MJ Invoice & Delivery Slip</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Date: {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-100 text-pink-700">
              Status: {order.order_status.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
              Payment: {order.payment_method.toUpperCase()} ({order.payment_status})
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Delivery Address:
            </span>
            <p className="font-bold text-slate-900">{order.customer_name}</p>
            <p className="text-slate-600">{order.shipping_address.street_address}</p>
            <p className="text-slate-600">
              {order.shipping_address.upazila}, {order.shipping_address.district}, {order.shipping_address.division}
            </p>
            <p className="text-slate-600 font-mono mt-1">Phone: {order.customer_phone}</p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Fulfillment Partner:
            </span>
            <p className="font-bold text-slate-900">MJ Express Delivery Service</p>
            <p className="text-slate-600">Banani Atelier Hub, Dhaka</p>
            <p className="text-slate-500 mt-1">Estimated Arrival: 24 - 48 Hours</p>
          </div>
        </div>

        {/* Item Rows */}
        <div className="divide-y divide-slate-100">
          <div className="py-2 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Item Description</span>
            <span>Total</span>
          </div>

          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.product_name}
                  className="w-12 h-16 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.product_name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SKU: {item.sku} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Calculation Totals */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-right">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount ({order.coupon_code})</span>
              <span className="font-semibold">-{formatPrice(order.discount_amount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500">
            <span>Delivery Charge</span>
            <span className="font-semibold text-slate-800">
              {order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
            <span>Amount Payable</span>
            <span className="text-pink-600">{formatPrice(order.total_amount)}</span>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
        <button
          onClick={handlePrint}
          className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full text-xs font-bold flex items-center gap-2 bg-white shadow-xs"
        >
          <Printer className="w-4 h-4" /> Print Invoice Slip
        </button>

        <button
          onClick={() => onNavigate('track-order', `order=${order.order_number}`)}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-xs"
        >
          <Truck className="w-4 h-4" /> Live Tracking
        </button>

        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-sky-600 hover:opacity-95 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-md"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
