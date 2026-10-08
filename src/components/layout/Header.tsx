import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../common/Logo';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Product } from '../../types';
import { 
  Search, Heart, ShoppingBag, User, Menu, X, 
  ChevronDown, ShieldAlert, LogOut, Package, Sparkles, Scale 
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (route: string, param?: string) => void;
  currentRoute: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute }) => {
  const { cartCount, cartSubtotal, setIsCartDrawerOpen, wishlist, compareList, formatPrice } = useStore();
  const { user, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Live search debounced
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = db.getProducts({ search: searchQuery, onlyPublished: true }).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', `search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', route: 'home' },
    { label: 'Shop All', route: 'shop' },
    { label: 'Women', route: 'shop', param: 'category=cat-women' },
    { label: 'Men', route: 'shop', param: 'category=cat-men' },
    { label: 'Exclusives', route: 'shop', param: 'category=cat-exclusive' },
    { label: 'Bags & Accessories', route: 'shop', param: 'category=cat-accessories' },
    { label: 'Sale %', route: 'shop', param: 'filter=sale', highlight: true },
    { label: 'Story', route: 'page', param: 'about-us' },
    { label: 'Admin Panel', route: 'admin', adminBadge: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-700 hover:text-pink-600 rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* MJ Brand Logo */}
          <div onClick={() => onNavigate('home')} className="shrink-0">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route && !link.param;
              if (link.adminBadge) {
                return (
                  <button
                    key={link.label}
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                    <span>Admin Panel</span>
                  </button>
                );
              }
              return (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.route, link.param)}
                  className={`text-sm font-medium transition-colors relative py-2 ${
                    link.highlight
                      ? 'text-pink-600 font-semibold hover:text-pink-700'
                      : isActive
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-sky-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xs relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search dresses, shirts, silks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-sm pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-pink-300 focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Live Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3">
                  Matching Products
                </div>
                <div className="divide-y divide-slate-50">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onNavigate('product', prod.slug);
                        setSearchResults([]);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-pink-50/50 cursor-pointer transition-colors"
                    >
                      <img
                        src={prod.primary_image}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{prod.name}</p>
                        <p className="text-[11px] text-pink-600 font-bold">
                          {formatPrice(prod.sale_price || prod.regular_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={handleSearchSubmit}
                  className="p-2 text-center text-xs text-sky-600 font-semibold hover:bg-sky-50 cursor-pointer border-t border-slate-100"
                >
                  View all results →
                </div>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare */}
            {compareList.length > 0 && (
              <button
                onClick={() => onNavigate('compare')}
                className="relative p-2 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Compare Products"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-slate-600 hover:text-pink-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="My Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-pink-50 text-pink-600' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                title="Account"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-100 to-sky-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {user ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-600" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in">
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.full_name}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="px-2 py-1">
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-rose-500" />
                          Admin Control Panel
                        </button>
                      </div>

                      <div className="px-2 py-1 space-y-0.5 border-t border-slate-100">
                        <button
                          onClick={() => {
                            onNavigate('account');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile & Addresses
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('account', 'tab=orders');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          Order History
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">Welcome to MJ</p>
                        <p className="text-xs text-slate-500 mt-0.5">Sign in to track orders & access perks</p>
                      </div>
                      <div className="p-3 space-y-2">
                        <button
                          onClick={() => {
                            onNavigate('login');
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-pink-600 to-sky-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-opacity"
                        >
                          Sign In / Register
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-sky-600 hover:from-pink-600 hover:to-sky-700 text-white px-3 sm:px-4 py-2 rounded-full shadow-md shadow-pink-500/15 transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-pink-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-tight">
                {cartCount > 0 ? formatPrice(cartSubtotal) : 'Bag'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Input Drawer (Visible when search toggled) */}
        {isSearchOpen && (
          <div className="py-3 border-t border-slate-100 md:hidden animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, sizes, fabrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-slate-100 text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:border-pink-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}

      </div>

      {/* Mobile Menu Slide-Over */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-right">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <Logo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    onNavigate(link.route, link.param);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors ${
                    link.highlight
                      ? 'text-pink-600 bg-pink-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('track-order');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-medium text-slate-600"
                >
                  Track Order
                </button>
                <button
                  onClick={() => {
                    onNavigate('page', 'faq');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-medium text-slate-600"
                >
                  FAQ & Help
                </button>
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-xs font-bold text-pink-600 bg-pink-50/70 rounded-lg flex items-center justify-between"
                >
                  <span>Admin Control Portal</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* User status in mobile drawer */}
            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-500 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-xl text-xs font-bold"
                >
                  Login or Register
                </button>
              )}
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};
