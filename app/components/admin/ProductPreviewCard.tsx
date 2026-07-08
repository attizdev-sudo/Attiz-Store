'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import type { Category } from '@/lib/types';

interface ProductPreviewCardProps {
  target: {
    title: string;
    price: string | number;
    discount?: string | number;
    sizes: string;
    colors: string;
    image: string;
    description?: string;
  };
  activeCategoryId: string | null;
  categories: Category[];
}

export default function ProductPreviewCard({
  target,
  activeCategoryId,
  categories,
}: ProductPreviewCardProps) {
  const activeCat = categories.find((c) => c.id === activeCategoryId);
  const displayCategory = activeCat ? activeCat.name : 'No category';

  const displayImage =
    target.image ||
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
  const displayTitle = target.title || 'Premium Garment';
  const discountVal = parseFloat(String(target.discount || '0'));
  const isDiscounted = discountVal > 0 && discountVal <= 100;
  const finalPrice = isDiscounted
    ? Math.round(parseFloat(String(target.price || 0)) * (1 - discountVal / 100))
    : parseFloat(String(target.price || 0));

  const pSizes = (target.sizes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const pColors = (target.colors || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="bg-white border border-brand-cream-dark rounded-xl overflow-hidden shadow-xs sticky top-24 transition-all duration-300 hover:shadow-md hidden lg:block h-fit w-full">
      <div className="p-4 bg-brand-cream/15 border-b border-brand-cream-dark flex items-center justify-between">
        <h5 className="font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>Storefront Preview</span>
        </h5>
        <span className="text-[8px] font-bold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded uppercase tracking-wider">
          Live
        </span>
      </div>
      <div className="p-8 flex items-center justify-center bg-brand-cream/5 border-b border-brand-cream-dark/50">
        <div className="w-full max-w-[200px] bg-white border border-brand-cream-dark rounded-lg overflow-hidden relative transition-all duration-300 hover:shadow-md group">
          <div className="relative aspect-3/4 bg-brand-cream overflow-hidden">
            <img
              src={displayImage}
              alt="Cover Preview"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-xs text-brand-dark hover:text-brand-brown cursor-pointer transition-colors">
              <span className="text-[10px]">♡</span>
            </div>
          </div>
          <div className="pt-3 pb-4 px-3 flex flex-col justify-between bg-white border-t border-brand-cream-dark/40">
            <div>
              <h6 className="font-sans text-[10px] font-bold tracking-wider text-brand-dark line-clamp-1 group-hover:text-brand-brown transition-colors">
                {displayTitle}
              </h6>
              <span className="text-[8px] text-brand-dark/40 font-bold tracking-widest uppercase block mt-0.5">
                Category: {displayCategory}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 gap-1.5">
              {isDiscounted ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-green-700 font-extrabold text-[9px] flex items-center shrink-0">
                    ↓{discountVal}%
                  </span>
                  <span className="font-sans text-[9px] text-brand-dark/40 line-through shrink-0">
                    {parseFloat(String(target.price || 0)).toFixed(0)}
                  </span>
                  <span className="font-sans text-[10px] font-bold text-brand-dark whitespace-nowrap">
                    ₹{finalPrice.toFixed(0)}
                  </span>
                </div>
              ) : (
                <span className="font-sans text-[10px] font-bold text-brand-brown">
                  ₹{parseFloat(String(target.price || 0)).toFixed(0)}
                </span>
              )}
              <span className="bg-brand-brown text-white text-[7px] font-bold tracking-wider px-2 py-0.5 rounded cursor-pointer hover:bg-brand-brown-dark transition-colors shrink-0">
                ADD
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4 bg-brand-cream/5">
        <div>
          <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">
            Available Sizes
          </span>
          <div className="flex flex-wrap gap-1">
            {pSizes.length > 0 ? (
              pSizes.map((s, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-white border border-brand-cream-dark rounded text-[8px] font-bold text-brand-dark"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-[9px] text-brand-dark/30 italic uppercase">
                No sizes selected
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">
            Colors
          </span>
          <div className="flex flex-wrap gap-1">
            {pColors.length > 0 ? (
              pColors.map((c, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-white border border-brand-cream-dark rounded text-[8px] font-semibold text-brand-dark/80"
                >
                  {c}
                </span>
              ))
            ) : (
              <span className="text-[9px] text-brand-dark/30 italic uppercase">
                No colors added
              </span>
            )}
          </div>
        </div>
        {target.description && (
          <div className="pt-2 border-t border-brand-cream-dark/50">
            <span className="text-[8px] font-bold text-brand-dark/50 uppercase tracking-widest block mb-1">
              Description
            </span>
            <p className="text-[9px] text-brand-dark/70 line-clamp-2 leading-relaxed">
              {target.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
