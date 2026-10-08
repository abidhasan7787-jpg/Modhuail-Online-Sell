import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, Banner, Category, Review } from '../../types';
import { ProductCard } from '../store/ProductCard';
import { QuickViewModal } from '../store/QuickViewModal';
import { useStore } from '../../context/StoreContext';
import { 
  ArrowRight, Sparkles, ChevronLeft, ChevronRight, 
  ShieldCheck, Clock, Truck, RefreshCw, Star, Heart, Flame 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { formatPrice } = useStore();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load from database service and listen to real-time changes
  useEffect(() => {
    const loadData = () => {
      setBanners(db.getBanners().filter((b) => b.is_active));
      setCategories(db.getCategories().filter((c) => c.is_published));
      setProducts(db.getProducts({ onlyPublished: true }));
      setReviews(db.getReviews().filter((r) => r.is_approved));
    };

    loadData();
    const unsubscribe = db.subscribe(loadData);
    return unsubscribe;
  }, []);

  // Auto rotate hero slides
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.is_best_seller || p.is_featured).slice(0, 4);
  const onSaleProducts = products.filter((p) => p.is_on_sale).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 animate-fade-in pb-12">
      
      {/* 1. HERO SLIDER */}
      {banners.length > 0 && (
        <section className="relative w-full overflow-hidden bg-slate-950">
          <div className="relative h-[480px] sm:h-[560px] lg:h-[620px] w-full">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Dark Vignette */}
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center scale-105 transform animate-kenburns"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent" />

                {/* Banner Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full">
                    <div className="max-w-xl space-y-4 text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-pink-300 text-xs font-bold tracking-wider uppercase border border-white/10">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Exclusive Collection 2026
                      </div>
                      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] text-white">
                        {banner.title}
                      </h1>
                      {banner.subtitle && (
                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-md">
                          {banner.subtitle}
                        </p>
                      )}
                      <div className="pt-2 flex flex-wrap gap-3">
                        <button
                          onClick={() => onNavigate('shop')}
                          className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 text-white rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-pink-500/25 flex items-center gap-2 hover:gap-3 transition-all active:scale-95"
                        >
                          {banner.button_text || 'Shop Now'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNavigate('shop', 'filter=sale')}
                          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-colors"
                        >
                          Explore Sale
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentSlide ? 'w-8 bg-pink-500' : 'w-2 bg-white/40'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
              Curated Wardrobe
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            Browse all categories
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', `category=${cat.id}`)}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              <div className="absolute inset-x-4 bottom-4 text-white">
                <h3 className="text-sm sm:text-base font-bold font-serif group-hover:text-pink-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 hidden sm:block">
                  {cat.description}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-300 mt-1 sm:mt-2 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
                Just Unveiled
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'filter=new')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            View all new arrivals
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL SHOWCASE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-900 via-rose-950 to-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Limited Festive Offer
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                Festive Splendor & Bridal Edit
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                Indulge in artisanal zardosi work, organza drapes, and bespoke menswear. Enjoy complimentary doorstep express delivery and a <strong>৳300 voucher</strong> on orders above ৳2,500.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest block font-bold">Use Code</span>
                  <span className="text-sm font-mono font-black text-amber-300">FESTIVE300</span>
                </div>
                <button
                  onClick={() => onNavigate('shop', 'filter=sale')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 shadow-md flex items-center gap-2"
                >
                  Shop the Festive Edit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt="Festive model"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Most Adored Pieces
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            Explore all collection
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="bg-gradient-to-b from-pink-50/50 via-sky-50/30 to-white py-16 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">
                Real Customer Love
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
                Loved Across Bangladesh
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Discover why over 12,000+ fashion connoisseurs choose MJ for their festive and daily elegance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 3).map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                      &ldquo;{rev.review_text}&rdquo;
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.user_name}</h4>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3" /> Verified MJ Purchaser
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">Dhaka, BD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />

    </div>
  );
};
