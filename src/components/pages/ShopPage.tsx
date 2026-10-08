import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../services/db';
import { Product, Category, Brand } from '../../types';
import { ProductCard } from '../store/ProductCard';
import { QuickViewModal } from '../store/QuickViewModal';
import { 
  Filter, X, Search, SlidersHorizontal, ArrowUpDown, 
  Grid, List, Check, RotateCcw 
} from 'lucide-react';

interface ShopPageProps {
  initialParam?: string;
  onNavigate: (route: string, param?: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialParam, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(6000);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Parse initialParam query string (e.g. "category=cat-women" or "filter=sale")
  useEffect(() => {
    if (initialParam) {
      const params = new URLSearchParams(initialParam);
      if (params.get('category')) setSelectedCategory(params.get('category')!);
      if (params.get('search')) setSearchQuery(params.get('search')!);
      if (params.get('filter') === 'sale') setOnSaleOnly(true);
      if (params.get('filter') === 'new') setSortBy('newest');
    }
  }, [initialParam]);

  // Load products & categories from db
  useEffect(() => {
    const loadData = () => {
      setProducts(db.getProducts({ onlyPublished: true }));
      setCategories(db.getCategories().filter(c => c.is_published));
      setBrands(db.getBrands().filter(b => b.is_published));
    };

    loadData();
    const unsubscribe = db.subscribe(loadData);
    return unsubscribe;
  }, []);

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'all' && prod.category_id !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && prod.brand_id !== selectedBrand) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesSku = prod.sku.toLowerCase().includes(q);
        const matchesDesc = prod.short_description.toLowerCase().includes(q);
        const matchesTag = prod.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesDesc && !matchesTag) {
          return false;
        }
      }
      // Price
      const price = prod.sale_price ?? prod.regular_price;
      if (price > priceRange) return false;

      // In stock
      if (inStockOnly && prod.stock <= 0) return false;

      // On sale
      if (onSaleOnly && (!prod.is_on_sale || prod.sale_price === null)) return false;

      // Size
      if (selectedSize !== 'all') {
        const hasSize = prod.variants.some((v) => v.size.toLowerCase() === selectedSize.toLowerCase() && v.is_active);
        if (!hasSize) return false;
      }

      // Color
      if (selectedColor !== 'all') {
        const hasColor = prod.variants.some((v) => v.color.toLowerCase().includes(selectedColor.toLowerCase()) && v.is_active);
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price ?? a.regular_price;
      const priceB = b.sale_price ?? b.regular_price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'bestseller') return (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedBrand, searchQuery, priceRange, inStockOnly, onSaleOnly, selectedSize, selectedColor, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setPriceRange(6000);
    setSelectedSize('all');
    setSelectedColor('all');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortBy('featured');
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44'];
  const colors = [
    { name: 'Pink', hex: '#f472b6' },
    { name: 'Blue', hex: '#38bdf8' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#1e293b' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="text-xs text-slate-400 mb-2">
          <button onClick={() => onNavigate('home')} className="hover:text-pink-600">Home</button>
          {' '}/ <span className="text-slate-800 font-semibold">Shop Collections</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900">
          Curated Atelier Collection
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Discover exclusive luxury hand-embroidered gowns, festive panjabis, silk co-ords and bespoke accessories.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100 flex-wrap">
        {/* Mobile filter toggle */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white"
        >
          <Filter className="w-4 h-4 text-pink-600" />
          Filter & Sort
        </button>

        {/* Results Count */}
        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{filteredProducts.length}</strong> styles
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-pink-500"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="bestseller">Best Selling</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-pink-600" />
              Filter By
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-pink-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search in Catalog */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Keyword Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search styles, fabrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs pl-8 pr-3 py-2 focus:outline-none focus:border-pink-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-pink-50 text-pink-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex justify-between items-center ${
                      selectedCategory === cat.id
                        ? 'bg-pink-50 text-pink-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Max Price</span>
              <span className="text-pink-600">৳{priceRange.toLocaleString('en-BD')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-pink-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>৳1,000</span>
              <span>৳6,000</span>
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Size</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSize('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedSize === 'all'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSize === sz
                      ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedColor('all')}
                className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                  selectedColor === 'all' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 text-slate-600'
                }`}
              >
                All
              </button>
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    selectedColor === c.name
                      ? 'border-pink-500 bg-pink-50 font-bold text-pink-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-slate-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-pink-600"
              />
              In Stock Only
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="rounded accent-pink-600"
              />
              Festive Sale & Discounts
            </label>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No styles found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any designs matching your exact filters. Try adjusting price or size.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onNavigate}
                  onOpenQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={onNavigate}
      />

      {/* MOBILE FILTERS MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Price (৳{priceRange})</label>
              <input
                type="range"
                min="1000"
                max="6000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-pink-600"
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 border border-slate-200 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-pink-600 text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
