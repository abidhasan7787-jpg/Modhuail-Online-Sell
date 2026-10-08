import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'gradient';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'gradient',
  showSubtitle = true 
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7 text-xs', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9 text-sm', text: 'text-2xl', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12 text-base', text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16 text-xl', text: 'text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer">
      {/* MJ Monogram Emblem */}
      <div 
        className={`${currentSize.icon} rounded-xl bg-gradient-to-tr from-pink-500 via-rose-400 to-sky-500 p-[1.5px] shadow-sm shadow-pink-500/20 transition-transform duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
          <span className="font-serif font-black tracking-tighter bg-gradient-to-br from-pink-600 via-pink-500 to-sky-600 bg-clip-text text-transparent">
            MJ
          </span>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span className={`font-serif font-extrabold tracking-tight text-slate-900 ${currentSize.text}`}>
            MJ
          </span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-pink-500"></span>
        </div>
        {showSubtitle && (
          <span className={`font-sans uppercase tracking-[0.22em] text-slate-400 font-semibold -mt-0.5 ${currentSize.sub}`}>
            Couture & Living
          </span>
        )}
      </div>
    </div>
  );
};
