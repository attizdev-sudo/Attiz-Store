'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'SHOP ALL', src: '/Artboard 2.svg' },
  { name: 'POLOS',    src: '/Artboard 3.svg' },
  { name: 'CREWS',    src: '/Artboard 4.svg' },
  { name: 'JOGGERS',  src: '/Artboard 5.svg' },
  { name: 'SWEATSHIRTS', src: '/Artboard 6.svg' },
];

export default function CategoryNav() {
  const router = useRouter();

  const handleCategoryClick = (catName: string) => {
    if (catName === 'SHOP ALL') {
      router.push('/#catalog-grid');
    } else if (catName === 'CREWS') {
      router.push('/?secondary=T-Shirts#catalog-grid');
    } else {
      const formatted = catName.charAt(0) + catName.slice(1).toLowerCase();
      router.push(`/?secondary=${formatted}#catalog-grid`);
    }
    const gridEl = document.getElementById('catalog-grid');
    if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-4 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center attiz-display text-lg sm:text-2xl md:text-3xl font-bold tracking-wider text-black mb-2 sm:mb-12 uppercase">
          Shop by Category
        </h2>

        {/* Category Row - horizontally scrollable on mobile */}
        <div className="flex items-center justify-center overflow-x-auto scrollbar-none -mx-4 px-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:gap-0 pb-1 sm:pb-0">
          {categories.map((cat, i) => (
            <React.Fragment key={cat.name}>
              {/* Category item */}
              <div
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center group cursor-pointer px-1 sm:px-4 shrink-0 active:scale-95 transition-transform duration-150"
              >
                {/* Icon */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center transition-all duration-300 group-hover:opacity-100 group-hover:scale-[1.08]">
                  <img
                    src={cat.src}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Label */}
                <span className="mt-1 attiz-mono text-[7px] sm:text-[9px] md:text-[10px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-black/85 group-hover:text-black transition-colors duration-300 uppercase text-center leading-tight">
                  {cat.name}
                </span>

                {/* Underline indicator */}
                <span className="mt-1 sm:mt-2 block w-0 group-hover:w-full h-[1.5px] bg-black transition-all duration-300 ease-out" />
              </div>

              {/* Vertical divider between items */}
              {i < categories.length - 1 && (
                <div className="hidden sm:block self-center h-10 w-px bg-black/10 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
