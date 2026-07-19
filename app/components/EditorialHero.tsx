'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function EditorialHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { editorialBanners, dbLoading } = useStore();
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  
  const slides = editorialBanners || [];

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

  if (slides.length === 0) {
    if (dbLoading) {
      return (
        <section className="relative w-full min-h-[620px] lg:min-h-[680px] bg-[#FAF8F5] overflow-hidden flex items-center border-b border-black/10">
          {/* Halftone texture background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] z-0 animate-pulse"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
              {/* Left Content Skeleton */}
              <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
                <div className="h-6 bg-black/10 w-24 skew-x-6 animate-pulse" />
                <div className="h-16 bg-black/10 w-3/4 animate-pulse" />
                <div className="h-4 bg-black/10 w-1/2 animate-pulse" />
                <div className="h-20 bg-black/10 w-5/6 animate-pulse" />
                <div className="h-12 bg-black/10 w-40 animate-pulse border border-black" />
              </div>
              {/* Right Card Skeleton */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-3/4 bg-black/[0.02] border-[3px] border-black shadow-[8px_8px_0_0_#111111] rotate-[-1.5deg]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-black/25 animate-spin" style={{ animationDuration: '6s' }} />
                      <div className="w-6 h-6 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

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
                          className={`object-cover object-center transition-all duration-700 hover:scale-105 ${
                            loadedImages[idx] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                          }`}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={idx === 0}
                          onLoad={() => setLoadedImages((prev) => ({ ...prev, [idx]: true }))}
                        />
                        {!loadedImages[idx] && (
                          <div className="absolute inset-0 bg-[#FAF8F5] flex items-center justify-center z-10">
                            {/* Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                            {/* Spinning loader */}
                            <div className="relative w-8 h-8 flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full border-2 border-dashed border-black/20 animate-spin" style={{ animationDuration: '6s' }} />
                              <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                            </div>
                          </div>
                        )}
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
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-black border-2 border-black flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:ml-[1px] hover:mt-[1px] hover:shadow-[1px_1px_0_0_#111111] active:ml-[2px] active:mt-[2px] active:shadow-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-[#111111] border-2 border-black flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:ml-[1px] hover:mt-[1px] hover:shadow-[1px_1px_0_0_#111111] active:ml-[2px] active:mt-[2px] active:shadow-none"
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
