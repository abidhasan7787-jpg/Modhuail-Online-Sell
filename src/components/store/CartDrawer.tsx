import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, Tag } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    couponDiscount,
    couponError,
    applyCouponCode,
    removeCoupon,
    formatPrice,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const settings = db.getStoreSettings();

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = settings.free_shipping_threshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim());
      setCouponInput('');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-left">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Shopping Bag ({cartCount})
              </h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-gradient-to-r from-pink-50 to-sky-50 border-b border-slate-100">
            {amountToFreeShipping > 0 ? (
              <p className="text-xs text-slate-700 font-medium">
                Add <strong className="text-pink-600">{formatPrice(amountToFreeShipping)}</strong> more to get{' '}
                <strong className="text-sky-700">Free Express Delivery</strong>!
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Congratulations! You qualified for Free Delivery nationwide!
              </p>
            )}
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Explore our luxury gowns, shirts and artisan collections to add items to your cart.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigate('shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-full text-xs font-bold shadow-md hover:opacity-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-start first:pt-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-18 h-24 object-cover rounded-xl bg-slate-50 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 -mr-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {(item.size || item.color) && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {item.size && <span className="font-medium">Size: {item.size}</span>}
                        {item.size && item.color && ' | '}
                        {item.color && <span>{item.color}</span>}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-pink-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-700 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-pink-600 transition-colors"
                          disabled={item.quantity >= item.stock_available}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-slate-400">
                            {formatPrice(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-4">
              
              {/* Promo Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(couponDiscount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. MJ10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl uppercase tracking-wider placeholder-normal focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 -mt-2">{couponError}</p>
              )}

              {/* Subtotal & Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-medium text-slate-600">Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-base text-pink-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigate('checkout');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    onNavigate('cart');
                  }}
                  className="w-full py-2.5 text-xs text-slate-600 hover:text-slate-900 font-semibold text-center border border-slate-200 hover:border-slate-300 rounded-xl bg-white transition-colors"
                >
                  View Full Bag & Cart
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
