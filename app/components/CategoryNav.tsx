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

        {/* Mobile: 3 per row center-aligned flex | Desktop: 5-Column Grid */}
        <div className="flex flex-wrap justify-center gap-y-6 gap-x-2 sm:grid sm:grid-cols-5 sm:gap-4 sm:items-start">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="w-[30%] sm:w-auto flex flex-col items-center group cursor-pointer active:scale-95 transition-transform duration-150"
            >
              {/* Icon Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                <img
                  src={cat.src}
                  alt={cat.name}
                  className="w-full h-full object-contain scale-115 sm:scale-100 drop-shadow-[4px_4px_0_#000000] sm:drop-shadow-[5px_5px_0_#000000] group-hover:drop-shadow-[7px_7px_0_#000000] transition-all duration-300"
                />
              </div>

              {/* Text Label */}
              <span className="mt-2 attiz-mono text-[10px] sm:text-[11px] md:text-[12px] font-black tracking-wider sm:tracking-[0.15em] text-black group-hover:text-[#E63B2E] transition-colors duration-300 uppercase text-center leading-tight px-0.5">
                {cat.name}
              </span>

              {/* Underline indicator */}
              <span className="mt-1 block w-0 group-hover:w-full h-[2.5px] bg-black transition-all duration-300 ease-out" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
