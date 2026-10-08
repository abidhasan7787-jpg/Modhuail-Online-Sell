import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Sparkles } from 'lucide-react';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    cart,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCouponCode,
    removeCoupon,
    formatPrice,
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const settings = db.getStoreSettings();

  const freeThreshold = settings.free_shipping_threshold;
  const neededForFree = Math.max(0, freeThreshold - cartSubtotal);
  const grandTotal = Math.max(0, cartSubtotal - couponDiscount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCouponCode(couponCodeInput.trim());
      setCouponCodeInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-900">Your Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          You haven&apos;t added any items to your shopping bag yet. Explore our latest arrivals to begin your order.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-6 px-8 py-3.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          Shopping Bag ({cart.length} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your chosen luxury items before checkout.
        </p>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-sky-50 rounded-2xl border border-pink-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        {neededForFree > 0 ? (
          <div className="text-slate-700">
            Add <strong className="text-pink-600">{formatPrice(neededForFree)}</strong> more to unlock{' '}
            <strong className="text-sky-700">Free Express Delivery</strong> anywhere in Bangladesh!
          </div>
        ) : (
          <div className="text-emerald-700 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            You qualify for Free Nationwide Delivery!
          </div>
        )}
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs text-pink-600 font-bold hover:underline"
        >
          Continue Shopping →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {cart.map((item) => (
              <div key={item.id} className="p-5 flex gap-4 items-center sm:items-start">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-28 object-cover rounded-xl bg-slate-50 shrink-0 border border-slate-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">{item.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-slate-600 mt-1">
                          {item.size && <span className="font-semibold">Size: {item.size}</span>}
                          {item.size && item.color && ' | '}
                          {item.color && <span>Color: {item.color}</span>}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-800"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_available}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 px-2">
            <button onClick={clearCart} className="text-red-500 hover:underline">
              Clear entire cart
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-serif">Order Summary</h3>

            {/* Promo Code Form */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. MJ10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
            </div>

            <div className="space-y-2 pt-2 text-xs border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Estimated Total</span>
                <span className="text-pink-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all"
            >
              Proceed to Bangladesh Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
