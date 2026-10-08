import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  max = 5, 
  size = 'sm', 
  showNumber = false 
}) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i + 1 <= Math.round(rating);
          return (
            <Star
              key={i}
              className={`${sizeClass} ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
