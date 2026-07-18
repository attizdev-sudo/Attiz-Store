'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const DEFAULT_SLIDES = [
  { image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&q=80', redirect_url: '/#catalog-grid' },
  { image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&q=80', redirect_url: '/?secondary=Polos#catalog-grid' },
  { image_url: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1000&q=80', redirect_url: '/?secondary=Joggers#catalog-grid' },
];

const SLIDE_INFO = [
  {
    tag: 'Attiz Season 01',
    title: 'Sartorial Heritage',
    subtitle: 'Modern Streetwear Redefined',
    description: 'Exquisitely crafted garments blending architectural profiles, functional daily wear, and premium heavy-knit fabrics.',
  },
  {
    tag: 'New Arrivals',
    title: 'Tailored Comfort',
    subtitle: 'Premium Knit Heavyweights',
    description: 'Explore our latest collection of structured drop-shoulder tees, heavyweight hoodies, and tailored utility trousers.',
  },
  {
    tag: 'Classic Essentials',
    title: 'Urban Silhouette',
    subtitle: 'Engineered Daily Profiles',
    description: 'Minimal designs engineered for modern ergonomics. Styled for clean aesthetics and maximum comfort.',
  },
];

export default function EditorialHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { editorialBanners } = useStore();
  
  const slides = editorialBanners && editorialBanners.length > 0
    ? editorialBanners
    : DEFAULT_SLIDES.map((slide, idx) => {
        const info = SLIDE_INFO[idx % SLIDE_INFO.length];
        return {
          ...slide,
          title: info.title,
          subtitle: info.subtitle,
          tag: info.tag,
          description: info.description,
        };
      });

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full min-h-[620px] lg:min-h-[680px] bg-[#FAF8F5] overflow-hidden flex items-center border-b border-black/10">
      
      {/* Halftone texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full relative z-10">
        <div className="relative w-full h-[520px] lg:h-[480px]">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const slideImage = slide.image_url;
            const slideLink = slide.redirect_url;

            return (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full h-full">
                  
                  {/* Left: Content */}
                  <div className={`lg:col-span-6 flex flex-col items-start text-left transition-all duration-700 delay-100 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-6">
                      <span className="skew-x-6">{slide.tag}</span>
                    </span>
                    <h1 className="attiz-display text-4xl sm:text-6xl leading-[0.95] tracking-tight uppercase text-black mb-4">
                      {slide.title}
                    </h1>
                    <p className="attiz-mono text-[10px] sm:text-xs font-bold text-black/55 tracking-[0.2em] uppercase mb-5">
                      {slide.subtitle}
                    </p>
                    <p className="attiz-body text-xs sm:text-sm text-black/70 leading-relaxed tracking-wide mb-8 max-w-md font-light">
                      {slide.description}
                    </p>
                    <Link
                      href={slideLink || '/#catalog-grid'}
                      className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                    >
                      Shop Collection
                    </Link>
                  </div>

                  {/* Right: Neobrutalist Image Card */}
                  <div className={`lg:col-span-6 flex justify-center transition-all duration-700 ${
                    isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                  }`}>
                    <Link href={slideLink || '/#catalog-grid'} className="block w-full max-w-[360px] sm:max-w-[400px]">
                      <div className="relative w-full aspect-3/4 bg-white border-[3px] border-black shadow-[8px_8px_0_0_#111111] rotate-[-1.5deg] hover:rotate-0 hover:shadow-[10px_10px_0_0_#E63B2E] transition-all duration-300 overflow-hidden">
                        <Image
                          src={slideImage}
                          alt={slide.title}
                          fill
                          className="object-cover object-center transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={idx === 0}
                        />
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          {/* Nav arrows - Refined Neobrutalist Style */}
          <button
            onClick={prevSlide}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-black border-2 border-black flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-[#111111] border-2 border-black flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot Indicators matching ProductDetails */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-12 lg:-translate-x-0 z-20 flex space-x-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 border-2 border-black transition-all cursor-pointer ${
                  idx === currentSlide ? 'w-8 bg-[#E63B2E]' : 'w-2 bg-white hover:bg-[#FFCB05]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
