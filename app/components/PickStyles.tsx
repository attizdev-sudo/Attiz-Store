'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const styles = [
  {
    name: 'ATTIZ POLOS',
    subtitle: 'Classic Sartorial Knit',
    tag: 'Structured Fit',
    category: 'Polos',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80',
    color: '#E63B2E',
  },
  {
    name: 'ATTIZ CREWS',
    subtitle: 'Everyday Heavyweight Tees',
    tag: 'Drop Shoulder',
    category: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&auto=format&fit=crop&q=80',
    color: '#FFCB05',
  },
  {
    name: 'ATTIZ JOGGERS',
    subtitle: 'Tailored Daily Fleece',
    tag: 'Tapered Profile',
    category: 'Joggers',
    image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=800&auto=format&fit=crop&q=80',
    color: '#FFFFFF',
  },
  {
    name: 'ATTIZ SWEATS',
    subtitle: 'Premium Loopback Fleece',
    tag: 'Relaxed Silhouette',
    category: 'Sweatshirts',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    color: '#E63B2E',
  },
];

export default function PickStyles() {
  const router = useRouter();
  const { lookbookStyles } = useStore();

  const slides = lookbookStyles && lookbookStyles.length > 0
    ? lookbookStyles.map((item) => ({
        name: item.name,
        subtitle: item.subtitle,
        tag: item.tag,
        category: item.category,
        image: item.image_url,
        color: item.color || '#E63B2E',
      }))
    : styles;

  return (
    <section className="py-14 sm:py-24 border-t border-b border-black/10 bg-[#FAF8F5] relative overflow-hidden">
      {/* Subtle halftone background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center mb-10 sm:mb-16 text-center">
          <span className="inline-block bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.25em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-4">
            <span className="inline-block skew-x-6">LOOKBOOK</span>
          </span>
          <h2 className="attiz-display text-2xl sm:text-3xl md:text-4xl tracking-tight text-black uppercase">
            Wear Your Attitude
          </h2>
          <p className="attiz-mono text-[10px] sm:text-xs font-bold text-black/55 tracking-[0.15em] uppercase mt-2 max-w-xs sm:max-w-none">
            Streetwear engineered for those who stand apart - not for everyone.
          </p>
        </div>

        {/* Expanding Accordion Container */}
        {/* Desktop Layout */}
        <div className="hidden md:flex h-[540px] w-full border-[3px] border-black bg-black shadow-[8px_8px_0_0_#111111] overflow-hidden">
          {styles.map((style, idx) => (
            <div
              key={idx}
              onClick={() => router.push(`/?secondary=${style.category}#catalog-grid`)}
              className="flex-1 hover:flex-[2.8] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.3,1)] relative overflow-hidden h-full border-r-[3px] border-black last:border-r-0 cursor-pointer group"
            >
              {/* Background Image */}
              <img
                src={style.image}
                alt={style.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Dark Overlays */}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-all duration-300 z-10" />

              {/* Colorful active bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-2 z-25 transition-transform duration-300 translate-y-full group-hover:translate-y-0"
                style={{ backgroundColor: style.color }}
              />

              {/* Content Panel */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-20 text-white select-none">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <span className="bg-[#FFCB05] text-black border-2 border-black px-2.5 py-0.5 attiz-mono text-[8px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {style.tag}
                  </span>
                </div>

                {/* Center / Bottom Section (Collapsed vs Expanded) */}
                <div className="relative w-full h-full flex flex-col justify-end">
                  
                  {/* Collapsed view: Title */}
                  <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                    <h3 className="attiz-display text-2xl uppercase tracking-widest text-white/90 origin-center select-none text-center whitespace-nowrap">
                      {style.name}
                    </h3>
                  </div>

                  {/* Expanded view: Rich Info */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0 flex flex-col items-start text-left max-w-md pb-4">
                    <h3 className="attiz-display text-3xl text-[#FFCB05] uppercase tracking-wide mb-1">
                      {style.name}
                    </h3>
                    <p className="attiz-mono text-[9px] font-bold tracking-widest text-white/70 uppercase mb-3">
                      {style.subtitle}
                    </p>
                    <button className="flex items-center gap-2 border-2 border-white hover:bg-white hover:text-black px-4 py-2 attiz-mono text-[9px] font-bold tracking-widest uppercase transition-all shadow-[2px_2px_0_0_rgba(255,255,255,0.25)] hover:shadow-none">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden overflow-x-auto scrollbar-none -mx-4 px-4 gap-4 pb-4">
          {slides.map((style, idx) => (
            <div
              key={idx}
              onClick={() => router.push(`/?secondary=${style.category}#catalog-grid`)}
              className="relative w-[240px] xs:w-[280px] aspect-[4/5] border-[3px] border-black bg-black shadow-[4px_4px_0_0_#111111] overflow-hidden group cursor-pointer shrink-0 active:scale-[0.99] transition-transform"
            >
              {/* Background Image */}
              <img
                src={style.image}
                alt={style.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
              />

              {/* Gradient overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />

              {/* Accent color bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 z-20" style={{ backgroundColor: style.color }} />

              {/* Content Panel */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between z-20 text-white select-none">
                <div className="flex justify-between items-start">
                  <span className="bg-[#FFCB05] text-black border-2 border-black px-2 py-0.5 attiz-mono text-[8px] font-bold tracking-wider uppercase">
                    {style.tag}
                  </span>
                </div>

                <div className="flex flex-col items-start text-left gap-1">
                  <h3 className="attiz-display text-lg sm:text-2xl text-[#FFCB05] uppercase tracking-wide leading-none">
                    {style.name}
                  </h3>
                  <p className="attiz-mono text-[8px] font-bold tracking-widest text-white/70 uppercase">
                    {style.subtitle}
                  </p>
                  <span className="mt-2 flex items-center gap-1.5 attiz-mono text-[8px] font-bold tracking-widest uppercase text-white/60 border border-white/30 px-2 py-0.5">
                    Explore →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
