import React from 'react';
import { Truck, Sparkles, Phone, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 text-white text-xs font-medium py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-4 text-pink-100">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-pink-200" />
            Hotline: +880 1700-123456
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
            100% Genuine Designer Fashion
          </span>
        </div>

        <div className="flex-1 sm:flex-none text-center sm:text-left flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse hidden sm:inline" />
          <span>
            Complimentary Express Delivery nationwide on orders over <strong>৳2,500</strong>! Use code{' '}
            <span className="underline decoration-wavy underline-offset-2 font-bold text-amber-200">MJ10</span> for 10% off.
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-pink-100 text-xs">
          <span className="bg-white/20 px-2 py-0.5 rounded-full font-semibold text-[11px]">
            ৳ BDT
          </span>
          <a href="#/track-order" className="hover:text-white underline underline-offset-2">
            Track Order
          </a>
        </div>
      </div>
    </div>
  );
};
