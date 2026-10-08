import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { BD_DIVISIONS, BD_DISTRICTS } from '../../lib/bangladesh-geo';
import { PaymentMethod, Address } from '../../types';
import { PaymentGatewayModal } from '../store/PaymentGatewayModal';
import { 
  ShieldCheck, Truck, Lock, ArrowRight, AlertCircle, 
  CheckCircle2, CreditCard, Banknote, Sparkles 
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, cartSubtotal, clearCart, appliedCoupon, couponDiscount, formatPrice, showToast } = useStore();
  const { user } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Banani');
  const [streetAddress, setStreetAddress] = useState(user?.default_address?.street_address || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [pendingTxnId, setPendingTxnId] = useState<string | null>(null);

  const settings = db.getStoreSettings();

  // Redirect if cart empty
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-xs text-slate-500 mt-2">Add items to proceed with checkout.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  // Shipping Fee Calculation
  const isInsideDhaka = division.toLowerCase() === 'dhaka' && district.toLowerCase() === 'dhaka';
  let shippingFee = isInsideDhaka ? settings.inside_dhaka_shipping : settings.outside_dhaka_shipping;
  if (cartSubtotal >= settings.free_shipping_threshold) {
    shippingFee = 0;
  }

  const finalTotal = Math.max(0, cartSubtotal + shippingFee - couponDiscount);

  // Validate Bangladesh Mobile Number format
  const validatePhone = (p: string) => {
    const clean = p.replace(/\s+/g, '');
    return /^01[3-9]\d{8}$/.test(clean);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!fullName.trim()) {
      setValidationError('Please enter your full recipient name.');
      return;
    }
    if (!validatePhone(phone)) {
      setValidationError('Please provide a valid 11-digit Bangladesh mobile number (e.g. 01712345678).');
      return;
    }
    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      setValidationError('Please enter a detailed street/house address for courier delivery.');
      return;
    }

    // If online mobile payment selected, launch payment gateway modal first
    if (paymentMethod !== 'cod' && !pendingTxnId) {
      setIsGatewayOpen(true);
      return;
    }

    // Execute atomic order placement
    finalizeOrder();
  };

  const finalizeOrder = (transactionId?: string) => {
    setIsSubmitting(true);

    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      division,
      district,
      upazila,
      street_address: streetAddress.trim(),
    };

    const orderPayload = {
      customer_name: fullName.trim(),
      customer_email: email.trim() || `${phone.trim()}@mj.guest`,
      customer_phone: phone.trim(),
      shipping_address: shippingAddress,
      items: cart.map((i) => ({
        product_id: i.product_id,
        variant_id: i.variant_id,
        quantity: i.quantity,
      })),
      coupon_code: appliedCoupon?.code,
      payment_method: paymentMethod,
      order_notes: orderNotes.trim() || undefined,
      user_id: user?.id,
    };

    // Atomic transaction execution in database
    const result = db.placeOrderAtomic(orderPayload);

    if (!result.success || !result.order) {
      setIsSubmitting(false);
      setValidationError(result.error || 'Failed to complete order.');
      showToast(result.error || 'Order failed', 'error');
      return;
    }

    // Success
    clearCart();
    setIsSubmitting(false);
    showToast(`Order #${result.order.order_number} confirmed!`, 'success');
    onNavigate('order-success', result.order.id);
  };

  const availableDistricts = BD_DISTRICTS[division] || ['Dhaka'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          Bangladesh Express Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details for courier dispatch.
        </p>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Delivery & Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recipient Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Truck className="w-4 h-4 text-pink-600" />
              1. Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abid Hasan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (BD) <span className="text-pink-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Courier delivery rider will call this number.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Optional for invoice)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Geographic dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Division <span className="text-pink-600">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => {
                    const newDiv = e.target.value;
                    setDivision(newDiv);
                    setDistrict(BD_DISTRICTS[newDiv]?.[0] || 'Dhaka');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District <span className="text-pink-600">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500"
                >
                  {availableDistricts.map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Thana / Upazila
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi / Gulshan"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed House / Street Address <span className="text-pink-600">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="House No, Road No, Sector, Flat No, Landmark..."
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave with security guard / call before arriving..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              2. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                  <span className="text-[11px] text-slate-500">
                    Pay in cash when your parcel is delivered to your doorstep.
                  </span>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-0.5 accent-pink-600"
                />
                <div>
                  <span className="font-bold text-[#e2136e] block">bKash (Sandbox Demo)</span>
                  <span className="text-[11px] text-slate-500">
                    Instant sandbox payment simulation with verified token.
                  </span>
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-0.5 accent-amber-600"
                />
                <div>
                  <span className="font-bold text-[#f7941d] block">Nagad (Demo Gateway)</span>
                  <span className="text-[11px] text-slate-500">
                    Fast mobile banking sandbox checkout.
                  </span>
                </div>
              </label>

              {/* Card / Online */}
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5 accent-sky-600"
                />
                <div>
                  <span className="font-bold text-sky-700 block">Card / Visa / Mastercard</span>
                  <span className="text-[11px] text-slate-500">
                    Sandbox gateway for credit & debit cards.
                  </span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Order Breakdown ({cart.length} items)
            </h3>

            {/* Quick Items Thumbnail view */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-14 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} {item.size && `• ${item.size}`}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>
                  Delivery Fee ({isInsideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-pink-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-pink-500/25 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Place Order with {paymentMethod.toUpperCase()}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Secure Cash on Delivery & Sandbox Guarantee</span>
            </div>
          </div>
        </div>

      </form>

      {/* Gateway Simulation Modal for Mobile Banking / Card */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        method={paymentMethod}
        amount={finalTotal}
        orderNumber={`MJ-${Date.now().toString().slice(-6)}`}
        onSuccess={(txnId) => {
          setIsGatewayOpen(false);
          setPendingTxnId(txnId);
          finalizeOrder(txnId);
        }}
        onFailure={(reason) => {
          setIsGatewayOpen(false);
          showToast(reason, 'error');
        }}
      />

    </div>
  );
};
