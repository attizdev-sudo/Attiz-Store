'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  {
    name: 'SHOP ALL',
    icon: (
      <svg className="w-10 h-10 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    name: 'POLOS',
    icon: (
      <svg className="w-10 h-10 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 22V9l3-2 3 2 3-2 3 2v13H6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7v4m6-4v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9h12" />
      </svg>
    ),
  },
  {
    name: 'CREWS',
    icon: (
      <svg className="w-10 h-10 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h3v13h10V9h3l-2-4H6L4 9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 5a2 2 0 004 0" />
      </svg>
    ),
  },
  {
    name: 'JOGGERS',
    icon: (
      <svg className="w-10 h-10 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v2l2 15h-4l-2-8-2 8H6L8 5V3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8" />
      </svg>
    ),
  },
  {
    name: 'SWEATSHIRTS',
    icon: (
      <svg className="w-10 h-10 stroke-[1.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h4v14h10V8h4L19 4H5L3 8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8a5 5 0 0110 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4 2m14-2l-4 2" />
      </svg>
    ),
  },
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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-sans text-xs font-bold tracking-[0.25em] text-brand-dark mb-10">SHOP BY CATEGORY</h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {categories.map((cat) => (
            <div key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 rounded-full border border-brand-cream-dark flex items-center justify-center bg-brand-cream/10 text-brand-brown hover:text-brand-brown-dark hover:border-brand-brown group-hover:bg-brand-cream/35 group-hover:scale-105 transition-all duration-300 shadow-sm">
                {cat.icon}
              </div>
              <span className="mt-4 font-sans text-[10px] font-semibold tracking-widest text-brand-dark group-hover:text-brand-brown transition-colors duration-300">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
