'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'SHOP ALL', src: '/Artboard 2.svg' },
  { name: 'NEW ARRIVALS', src: '/Artboard 3.svg' },
  { name: "DESIGNER'S CHOICE", src: '/Artboard 4.svg' },
  { name: 'TRENDING NOW', src: '/Artboard 5.svg' },
  { name: 'SHOP BY MOOD', src: '/Artboard 6.svg' },
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
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">

        {/* 5-Column Fixed Non-scrollable Grid */}
        <div className="grid grid-cols-5 gap-0.5 sm:gap-4 items-start">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform duration-150"
            >
              {/* Icon Container - Prominently enlarged for mobile */}
              <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <img
                  src={cat.src}
                  alt={cat.name}
                  className="w-full h-full object-contain scale-110 sm:scale-100"
                />
              </div>

              {/* Text Label */}
              <span className="mt-1.5 attiz-mono text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold tracking-tight sm:tracking-[0.15em] text-black/90 group-hover:text-black transition-colors duration-300 uppercase text-center leading-tight px-0.5">
                {cat.name}
              </span>

              {/* Underline indicator */}
              <span className="mt-1 block w-0 group-hover:w-full h-[1.5px] bg-black transition-all duration-300 ease-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
