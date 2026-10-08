import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import { 
  User, Package, MapPin, Heart, LogOut, ShieldCheck, 
  Clock, CheckCircle2, XCircle, ArrowRight, Edit3 
} from 'lucide-react';

interface AccountPageProps {
  initialParam?: string;
  onNavigate: (route: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialParam, onNavigate }) => {
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const { formatPrice, showToast, wishlist } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  // Profile Form state
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');

  useEffect(() => {
    if (initialParam?.includes('tab=')) {
      const tab = initialParam.split('tab=')[1] as any;
      if (['orders', 'profile', 'addresses', 'wishlist'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [initialParam]);

  useEffect(() => {
    if (user) {
      setNameInput(user.full_name);
      setPhoneInput(user.phone);
      // Fetch user's orders from database
      const allOrders = db.getOrders();
      const userOrders = allOrders.filter(
        (o) => o.user_id === user.id || o.customer_email.toLowerCase() === user.email.toLowerCase() || o.customer_phone === user.phone
      );
      setOrders(userOrders);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 font-serif">Sign in to your MJ Account</h2>
        <p className="text-xs text-slate-500 mt-1">Access your order history, delivery tracking, and saved profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="mt-6 w-full py-3 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: nameInput.trim(), phone: phoneInput.trim() });
    showToast('Your profile details were updated.', 'success');
  };

  const handleCancelOrder = (orderId: string) => {
    try {
      db.updateOrderStatus(orderId, 'cancelled', 'Cancelled by customer request');
      setOrders(db.getOrders().filter(o => o.user_id === user.id || o.customer_email === user.email));
      showToast('Order was cancelled successfully.', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      
      {/* Account Hero Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-sky-500 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif">{user.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {user.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'orders' ? 'bg-pink-50 text-pink-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            My Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'profile' ? 'bg-pink-50 text-pink-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            Profile Settings
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'addresses' ? 'bg-pink-50 text-pink-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Saved Addresses
          </button>

          <button
            onClick={() => onNavigate('wishlist')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Heart className="w-4 h-4" />
            My Wishlist ({wishlist.length})
          </button>
        </aside>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 font-serif">Order History</h2>

              {orders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">You haven&apos;t placed any orders yet.</p>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <span className="text-xs font-bold font-mono text-slate-900">
                          #{ord.order_number}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(ord.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700">
                          {ord.order_status.replace(/_/g, ' ')}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                          {ord.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-50">
                      {ord.items.map((it) => (
                        <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={it.image} alt={it.product_name} className="w-10 h-14 object-cover rounded-lg bg-slate-100" />
                            <div>
                              <p className="font-bold text-slate-800">{it.product_name}</p>
                              <p className="text-slate-400 text-[11px]">
                                Qty: {it.quantity} {it.size && `• Size: ${it.size}`}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Total Amount: <strong className="text-slate-900 font-bold">{formatPrice(ord.total_amount)}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {ord.order_status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(ord.id)}
                            className="text-xs text-red-600 font-bold hover:underline"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => onNavigate('track-order', `order=${ord.order_number}`)}
                          className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                        >
                          Track Shipment →
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6">
              <h2 className="text-base font-bold text-slate-900 font-serif">Account Profile Details</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email (Registered)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-slate-900 font-serif">Default Delivery Address</h2>
              {user.default_address ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{user.default_address.full_name}</p>
                  <p className="text-slate-600">{user.default_address.street_address}</p>
                  <p className="text-slate-600">
                    {user.default_address.upazila}, {user.default_address.district}, {user.default_address.division}
                  </p>
                  <p className="text-slate-500 font-mono">Phone: {user.default_address.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Your delivery addresses are saved automatically during checkout.
                </p>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
