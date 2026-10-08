import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { RatingStars } from '../common/RatingStars';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
  onNavigate: (route: string, param?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenQuickView, 
  onNavigate 
}) => {
  const { addToCart, isInWishlist, toggleWishlist, formatPrice } = useStore();

  const isFavorite = isInWishlist(product.id);
  const currentPrice = product.sale_price ?? product.regular_price;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.regular_price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-pink-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-50 cursor-pointer"
           onClick={() => onNavigate('product', product.slug)}>
        <img
          src={product.primary_image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-gradient-to-r from-pink-600 to-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
              {product.discount_percentage ? `-${product.discount_percentage}%` : 'SALE'}
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              NEW
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              BESTSELLER
            </span>
          )}
          {isLowStock && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-pink-600 text-white shadow-md'
              : 'bg-white/90 text-slate-600 hover:text-pink-600 hover:bg-white shadow-sm'
          }`}
          title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Quick Actions Hover Drawer on Desktop */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          {onOpenQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuickView(product);
              }}
              className="flex-1 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold py-2 px-3 rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Quick View
            </button>
          )}

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              // Add first active variant if available
              const firstVariant = product.variants.find((v) => v.is_active && v.stock > 0);
              addToCart(product, firstVariant, 1);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition-colors ${
              isOutOfStock
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-sky-600 hover:from-pink-700 hover:to-sky-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">
              {product.category_name || 'MJ Atelier'}
            </span>
            <RatingStars rating={product.rating} showNumber size="sm" />
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onNavigate('product', product.slug)}
            className="text-sm font-semibold text-slate-800 hover:text-pink-600 cursor-pointer line-clamp-2 leading-snug transition-colors"
          >
            {product.name}
          </h3>

          {/* Fabric / Material note if present */}
          {product.fabric && (
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {product.fabric}
            </p>
          )}

          {/* Available Sizes preview */}
          {product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {Array.from(new Set(product.variants.map((v) => v.size))).map((size) => (
                <span
                  key={size}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-slate-900 tracking-tight">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>

          {/* Mobile direct Add button */}
          <button
            onClick={() => {
              const firstVariant = product.variants.find((v) => v.is_active && v.stock > 0);
              addToCart(product, firstVariant, 1);
            }}
            disabled={isOutOfStock}
            className="sm:hidden p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 active:scale-95 disabled:opacity-50"
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
