import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigate: (route: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }
    showToast('Subscribed! Check your inbox for your 10% welcome voucher.', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-slate-800/80">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">24-48 hrs in Dhaka, 72 hrs outside</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free size & style exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Fabric</h4>
              <p className="text-xs text-slate-400 mt-0.5">Handpicked premium silks & cottons</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">10 AM - 10 PM daily hotline & chat</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => onNavigate('home')} className="inline-block">
              <Logo size="md" variant="light" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MJ is Bangladesh&apos;s premier contemporary couture & lifestyle brand. Bringing effortless elegance, custom embroidery, and artisanal craftsmanship to your everyday celebration.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                Banani Atelier: House 42, Road 11, Block D, Dhaka-1213
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                +880 1700-123456 / +880 1811-654321
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-400 shrink-0" />
                support@mjfashion.com.bd
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Shop Collections</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('shop', 'category=cat-women')} className="hover:text-pink-400 transition-colors">
                  Women&apos;s Collection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=cat-men')} className="hover:text-pink-400 transition-colors">
                  Men&apos;s Couture & Panjabi
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=cat-exclusive')} className="hover:text-pink-400 transition-colors">
                  MJ Signature Exclusives
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=cat-accessories')} className="hover:text-pink-400 transition-colors">
                  Bags & Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'filter=sale')} className="hover:text-pink-400 transition-colors font-semibold text-pink-400">
                  Special Festive Sale %
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-sky-400 transition-colors">
                  Track Your Package
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('page', 'shipping-policy')} className="hover:text-sky-400 transition-colors">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('page', 'return-refund-policy')} className="hover:text-sky-400 transition-colors">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('page', 'faq')} className="hover:text-sky-400 transition-colors">
                  Size Guide & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('page', 'about-us')} className="hover:text-sky-400 transition-colors">
                  Our Story & Heritage
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Join the MJ Circle</h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive private sale invitations, Eid preview edits, and 10% off your first purchase.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-sky-500 text-white p-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('admin')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors"
              >
                Admin Control Portal →
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar & Payment Gateways */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong>MJ</strong> (Modern Elegance & Couture). All rights reserved. Registered in Bangladesh.
          </p>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-pink-400">
              bKash
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-amber-400">
              Nagad
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-purple-400">
              Rocket
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-emerald-400">
              Cash on Delivery
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[10px] font-bold text-sky-400">
              Visa / Mastercard
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
