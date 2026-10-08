import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Product, ProductVariant, Review } from '../../types';
import { useStore } from '../../context/StoreContext';
import { RatingStars } from '../common/RatingStars';
import { Modal } from '../common/Modal';
import { 
  Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, 
  Ruler, Share2, Star, Check, AlertCircle, Scale, MessageSquare 
} from 'lucide-react';

interface ProductPageProps {
  slug: string;
  onNavigate: (route: string, param?: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ slug, onNavigate }) => {
  const { addToCart, isInWishlist, toggleWishlist, toggleCompare, formatPrice, showToast } = useStore();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'sizing' | 'shipping' | 'reviews'>('details');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Review form state
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Load product & reviews from DB
  useEffect(() => {
    const loadData = () => {
      const p = db.getProductBySlug(slug) || db.getProductById(slug);
      if (p) {
        setProduct(p);
        setActiveImage(p.primary_image);
        if (p.variants.length > 0) {
          const firstActive = p.variants.find((v) => v.is_active && v.stock > 0) || p.variants[0];
          setSelectedVariant(firstActive);
        }
        setReviews(db.getReviews(p.id));
      }
    };

    loadData();
    const unsubscribe = db.subscribe(loadData);
    return unsubscribe;
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Design Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The selected MJ item may have been moved or unpublished.</p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? selectedVariant.sale_price ?? selectedVariant.price
    : product.sale_price ?? product.regular_price;

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    const added = addToCart(product, selectedVariant, quantity);
    if (added) {
      onNavigate('checkout');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewerName.trim() || !newReviewText.trim()) {
      showToast('Please provide your name and review remarks.', 'error');
      return;
    }

    db.addReview({
      product_id: product.id,
      user_id: `user-${Date.now()}`,
      user_name: newReviewerName.trim(),
      rating: newRating,
      review_text: newReviewText.trim(),
      is_verified_purchase: true,
    });

    showToast('Thank you! Your verified review has been published.', 'success');
    setNewReviewerName('');
    setNewReviewText('');
    setNewRating(5);
  };

  // Related products
  const relatedProducts = db.getProducts({ onlyPublished: true })
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-16">
      
      {/* Breadcrumb */}
      <div className="text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-pink-600">Home</button>
        {' '}/ <button onClick={() => onNavigate('shop')} className="hover:text-pink-600">Shop</button>
        {' '}/ <span className="text-slate-800 font-semibold">{product.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-3/4 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
            <img
              src={activeImage || product.primary_image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.discount_percentage && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                -{product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-26 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-pink-600 scale-102 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Controls */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold text-pink-600 uppercase tracking-widest text-[11px]">
                {product.category_name}
              </span>
              <div className="flex items-center gap-1.5">
                <RatingStars rating={product.rating} showNumber size="sm" />
                <span className="text-slate-400">({product.review_count} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
              <span>SKU: <strong className="text-slate-600 font-mono">{selectedVariant?.sku || product.sku}</strong></span>
              {product.fabric && <span>• Fabric: <strong className="text-slate-600">{product.fabric}</strong></span>}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {product.regular_price > currentPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Tax Included (৳ BDT)
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">
                  Select Size & Color Variant:
                </label>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.filter(v => v.is_active).map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOOS = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={isOOS}
                      className={`p-3 rounded-2xl border text-xs text-left transition-all relative ${
                        isSelected
                          ? 'border-pink-600 bg-pink-50/60 font-bold ring-2 ring-pink-500/20'
                          : isOOS
                          ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{v.size}</span>
                        {v.color_code && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200"
                            style={{ backgroundColor: v.color_code }}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{v.color}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {isOOS ? 'Out of stock' : `${v.stock} in stock`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Inventory Status Alert */}
          <div className="text-xs">
            {isOutOfStock ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                This specific size/color combination is currently sold out.
              </div>
            ) : currentStock <= 5 ? (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Hurry! Only {currentStock} units left in stock at our Banani atelier.
              </div>
            ) : (
              <div className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ready to dispatch within 24 hours.
              </div>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 px-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-3 text-slate-500 hover:text-slate-800 text-sm font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                  className="px-2 py-3 text-slate-500 hover:text-slate-800 text-sm font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isFavorite
                    ? 'border-pink-600 bg-pink-50 text-pink-600'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-600' : ''}`} />
              </button>
            </div>

            {/* Direct Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-500 to-sky-600 hover:from-pink-700 hover:to-sky-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-pink-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              Buy It Now with Cash on Delivery / bKash
            </button>
          </div>

          {/* Atelier Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <Truck className="w-4 h-4 text-pink-600 mx-auto mb-1" />
              Express BD Delivery
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <RefreshCw className="w-4 h-4 text-sky-600 mx-auto mb-1" />
              7-Day Size Exchange
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              100% Genuine Fabric
            </div>
          </div>

        </div>

      </div>

      {/* Tabs Section */}
      <div className="pt-8 border-t border-slate-100">
        <div className="flex border-b border-slate-200 space-x-8 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 uppercase tracking-wider transition-colors ${
              activeTab === 'details' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Design & Fabric Details
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 uppercase tracking-wider transition-colors ${
              activeTab === 'shipping' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Shipping & Returns
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 uppercase tracking-wider transition-colors ${
              activeTab === 'reviews' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-6 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{product.full_description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {product.fabric && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Fabric:</span>
                    <span>{product.fabric}</span>
                  </div>
                )}
                {product.material && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Composition:</span>
                    <span>{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 block">Weight:</span>
                    <span>{product.weight}</span>
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-800 block">Care Instructions:</span>
                  <span>Dry clean only for embroidered/silk apparel. Mild wash for cottons.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Nationwide Express Delivery</h4>
              <p>• Dhaka City: 24 to 48 hours delivery (Fee: ৳60).</p>
              <p>• Outside Dhaka: 48 to 72 hours delivery (Fee: ৳120).</p>
              <p>• Free shipping applies automatically to all orders above ৳2,500.</p>
              <h4 className="font-bold text-slate-800 pt-2">Exchange Guarantee</h4>
              <p>We facilitate hassle-free 7-day size exchanges. Please retain tags and original luxury packaging.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-slate-400">Be the first to leave a verified review for this design!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{rev.user_name}</span>
                          {rev.is_verified_purchase && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                              Verified
                            </span>
                          )}
                        </div>
                        <RatingStars rating={rev.rating} size="sm" />
                      </div>
                      <p className="text-slate-600">{rev.review_text}</p>
                      {rev.admin_reply && (
                        <div className="mt-2 pl-3 border-l-2 border-pink-500 text-[11px] text-pink-700 font-medium">
                          <strong>MJ Atelier response:</strong> {rev.admin_reply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <h4 className="font-bold text-slate-900 font-serif text-sm">Write a Review</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nusrat Jahan"
                      value={newReviewerName}
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                    >
                      <option value="5">★★★★★ (5 - Excellent Quality)</option>
                      <option value="4">★★★★☆ (4 - Very Good)</option>
                      <option value="3">★★★☆☆ (3 - Average)</option>
                      <option value="2">★★☆☆☆ (2 - Below Expectation)</option>
                      <option value="1">★☆☆☆☆ (1 - Poor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Share feedback on stitching, texture, drape and fit..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Post Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related Collection */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-100">
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">
            You May Also Admire
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('product', p.slug)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all"
              >
                <div className="aspect-3/4 overflow-hidden bg-slate-50">
                  <img
                    src={p.primary_image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">{p.name}</h4>
                  <p className="text-xs font-bold text-pink-600 mt-1">
                    {formatPrice(p.sale_price || p.regular_price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <Modal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} title="MJ Size Chart & Measurement Guide">
        <div className="space-y-4 text-xs text-slate-600">
          <p>All measurements are provided in inches. For customized tailoring inquiries, contact our atelier helpline.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50 font-bold text-slate-800">
                  <th className="p-2.5 border border-slate-200">Size</th>
                  <th className="p-2.5 border border-slate-200">Bust (in)</th>
                  <th className="p-2.5 border border-slate-200">Waist (in)</th>
                  <th className="p-2.5 border border-slate-200">Hip (in)</th>
                  <th className="p-2.5 border border-slate-200">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border border-slate-200 font-bold">XS</td>
                  <td className="p-2.5 border border-slate-200">32 - 34</td>
                  <td className="p-2.5 border border-slate-200">26 - 28</td>
                  <td className="p-2.5 border border-slate-200">34 - 36</td>
                  <td className="p-2.5 border border-slate-200">46</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-slate-200 font-bold">S</td>
                  <td className="p-2.5 border border-slate-200">34 - 36</td>
                  <td className="p-2.5 border border-slate-200">28 - 30</td>
                  <td className="p-2.5 border border-slate-200">36 - 38</td>
                  <td className="p-2.5 border border-slate-200">48</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-slate-200 font-bold">M</td>
                  <td className="p-2.5 border border-slate-200">36 - 38</td>
                  <td className="p-2.5 border border-slate-200">30 - 32</td>
                  <td className="p-2.5 border border-slate-200">38 - 40</td>
                  <td className="p-2.5 border border-slate-200">50</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-slate-200 font-bold">L</td>
                  <td className="p-2.5 border border-slate-200">38 - 40</td>
                  <td className="p-2.5 border border-slate-200">32 - 34</td>
                  <td className="p-2.5 border border-slate-200">40 - 42</td>
                  <td className="p-2.5 border border-slate-200">50</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-slate-200 font-bold">XL</td>
                  <td className="p-2.5 border border-slate-200">40 - 42</td>
                  <td className="p-2.5 border border-slate-200">34 - 36</td>
                  <td className="p-2.5 border border-slate-200">42 - 44</td>
                  <td className="p-2.5 border border-slate-200">52</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

    </div>
  );
};
