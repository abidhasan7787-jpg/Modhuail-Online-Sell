import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { db } from '../services/db';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => boolean;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  compareList: string[];
  toggleCompare: (productId: string) => void;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  formatPrice: (amount: number) => string;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_KEY = 'mj_cart_v1';
const WISHLIST_KEY = 'mj_wishlist_v1';
const COMPARE_KEY = 'mj_compare_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(COMPARE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  // Sync wishlist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // Sync compare
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList));
    }
  }, [compareList]);

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Re-verify coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const check = db.validateCoupon(appliedCoupon.code, cartSubtotal);
      if (check.valid) {
        setCouponDiscount(check.discountAmount);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(check.message);
      }
    }
  }, [cartSubtotal, appliedCoupon]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1): boolean => {
    // Check available stock
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) {
      showToast('This item is currently out of stock.', 'error');
      return false;
    }

    const itemId = variant ? `${product.id}_${variant.id}` : `${product.id}_base`;
    const existing = cart.find((i) => i.id === itemId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + quantity > availableStock) {
      showToast(`Cannot add more. Only ${availableStock} units available.`, 'error');
      return false;
    }

    const price = variant ? (variant.sale_price ?? variant.price) : (product.sale_price ?? product.regular_price);

    if (existing) {
      setCart((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity, stock_available: availableStock } : i
        )
      );
    } else {
      const newItem: CartItem = {
        id: itemId,
        product_id: product.id,
        variant_id: variant?.id,
        name: product.name,
        sku: variant ? variant.sku : product.sku,
        image: variant?.image_url || product.primary_image,
        size: variant?.size,
        color: variant?.color,
        price,
        regular_price: product.regular_price,
        quantity,
        stock_available: availableStock,
      };
      setCart((prev) => [...prev, newItem]);
    }

    showToast(`Added "${product.name}" to your bag.`, 'success');
    setIsCartDrawerOpen(true);
    return true;
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (quantity > item.stock_available) {
            showToast(`Maximum available stock reached (${item.stock_available} units).`, 'error');
            return { ...item, quantity: item.stock_available };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your Wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from comparison.', 'info');
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 4) {
        showToast('You can compare up to 4 items at a time.', 'error');
        return prev;
      }
      showToast('Added to compare list.', 'success');
      return [...prev, productId];
    });
  };

  const applyCouponCode = (code: string): boolean => {
    const result = db.validateCoupon(code, cartSubtotal);
    if (!result.valid) {
      setCouponError(result.message);
      showToast(result.message, 'error');
      return false;
    }

    setAppliedCoupon(result.coupon || null);
    setCouponDiscount(result.discountAmount);
    setCouponError(null);
    showToast(result.message, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
    showToast('Coupon removed.', 'info');
  };

  const formatPrice = (amount: number): string => {
    return `৳${Math.round(amount).toLocaleString('en-BD')}`;
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        toggleCompare,
        appliedCoupon,
        couponDiscount,
        couponError,
        applyCouponCode,
        removeCoupon,
        formatPrice,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
};
