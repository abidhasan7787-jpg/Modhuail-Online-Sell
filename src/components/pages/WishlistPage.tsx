import React from 'react';
import { useStore } from '../../context/StoreContext';
import { db } from '../../services/db';
import { ProductCard } from '../store/ProductCard';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist } = useStore();
  const allProducts = db.getProducts({ onlyPublished: true });
  const favoriteProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          My Saved Wishlist ({favoriteProducts.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your saved items are preserved here for easy ordering anytime.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the heart icon on any gown, shirt, or accessory to save it here.
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-sky-600 text-white rounded-full text-xs font-bold"
          >
            Explore Collections
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
