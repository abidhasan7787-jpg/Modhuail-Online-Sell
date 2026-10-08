import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { ShoppingBag, Heart, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, param?: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { addToCart, isInWishlist, toggleWishlist, formatPrice } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  if (!product) return null;

  // Active variant resolution
  const activeVariants = product.variants.filter((v) => v.is_active);
  const selectedVariant =
    activeVariants.find((v) => v.id === selectedVariantId) || activeVariants[0];

  const currentPrice = selectedVariant
    ? selectedVariant.sale_price ?? selectedVariant.price
    : product.sale_price ?? product.regular_price;

  const regularPrice = product.regular_price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const isFavorite = isInWishlist(product.id);

  const displayImage = selectedImage || selectedVariant?.image_url || product.primary_image;

  const handleAddToCart = () => {
    const success = addToCart(product, selectedVariant, quantity);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Images Column */}
        <div className="space-y-3">
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-18 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    displayImage === img ? 'border-pink-500 scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                {product.category_name}
              </span>
              <RatingStars rating={product.rating} showNumber size="sm" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">SKU: {selectedVariant?.sku || product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 py-2 border-y border-slate-100">
            <span className="text-xl font-black text-slate-900">
              {formatPrice(currentPrice)}
            </span>
            {regularPrice > currentPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
            {product.discount_percentage && (
              <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                Save {product.discount_percentage}%
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variations Selection */}
          {activeVariants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800">
                Choose Size / Color:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {activeVariants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVariantOOS = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={isVariantOOS}
                      className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-pink-500 bg-pink-50/50 text-slate-900 font-bold ring-1 ring-pink-500'
                          : isVariantOOS
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {v.color_code && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200 shrink-0"
                            style={{ backgroundColor: v.color_code }}
                          />
                        )}
                        <span className="truncate">
                          {v.size} ({v.color})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {isVariantOOS ? 'Out' : `${v.stock} in stock`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Notification */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="text-red-600 font-bold">Currently Sold Out</span>
            ) : currentStock <= 5 ? (
              <span className="text-orange-600 font-bold">
                Hurry! Only {currentStock} units remaining in stock.
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In stock ready to dispatch
              </span>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="flex gap-3 pt-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-2 text-slate-500 hover:text-slate-800"
              >
                -
              </button>
              <span className="px-2 text-xs font-bold text-slate-900 min-w-6 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                disabled={quantity >= currentStock}
                className="px-2 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 rounded-xl border transition-colors ${
                isFavorite
                  ? 'border-pink-500 bg-pink-50 text-pink-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-500'
              }`}
              title="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-600' : ''}`} />
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onNavigate('product', product.slug);
              }}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-4"
            >
              View Full Product Details & Sizing Guide →
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
