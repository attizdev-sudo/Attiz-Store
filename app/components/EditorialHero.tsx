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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const slides = editorialBanners || [];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides, currentSlide]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Touch handlers for swipe navigation
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (slides.length === 0) {
    if (dbLoading) {
      return (
        <section className="relative w-full min-h-[500px] lg:min-h-[680px] bg-[#FAF8F5] overflow-hidden flex items-center border-b border-black/10">
          {/* Halftone texture background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] z-0 animate-pulse"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
              {/* Left Content Skeleton */}
              <div className="lg:col-span-6 flex flex-col items-start text-left space-y-4 lg:space-y-6">
                <div className="h-5 bg-black/10 w-20 skew-x-6 animate-pulse" />
                <div className="h-10 lg:h-16 bg-black/10 w-3/4 animate-pulse" />
                <div className="h-4 bg-black/10 w-1/2 animate-pulse" />
                <div className="h-16 lg:h-20 bg-black/10 w-5/6 animate-pulse" />
                <div className="h-10 lg:h-12 bg-black/10 w-36 animate-pulse border border-black" />
              </div>
              {/* Right Card Skeleton */}
              <div className="lg:col-span-6 flex justify-center order-first lg:order-last">
                <div className="relative w-full max-w-[280px] sm:max-w-[360px] aspect-3/4 bg-black/[0.02] border-[3px] border-black shadow-[6px_6px_0_0_#111111] lg:shadow-[8px_8px_0_0_#111111] rotate-[-1.5deg]">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-black/25 animate-spin" style={{ animationDuration: '6s' }} />
                      <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
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
    <section 
      className="relative w-full lg:min-h-[680px] bg-[#FAF8F5] overflow-hidden flex flex-col lg:flex-row lg:items-center border-b border-black/10 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Halftone texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full relative z-10">
        <div className="relative w-full h-auto lg:h-[480px]">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const slideImage = slide.image_url;
            const slideLink = slide.redirect_url;

            return (
              <div
                key={idx}
                className={`w-full transition-all duration-700 ease-in-out ${
                  isActive 
                    ? 'relative opacity-100 z-10 lg:absolute lg:inset-0 lg:h-full block' 
                    : 'absolute inset-0 opacity-0 z-0 pointer-events-none hidden lg:block'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center w-full h-full">
                  
                  {/* Left: Content */}
                  <div className={`lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-700 delay-100 ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[8px] sm:text-[9px] font-bold tracking-[0.3em] uppercase px-2.5 py-1 -skew-x-6 border-2 border-black mb-4 lg:mb-6">
                      <span className="skew-x-6">{slide.tag}</span>
                    </span>
                    <h1 className="attiz-display text-3xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight uppercase text-black mb-3 lg:mb-4">
                      {slide.title}
                    </h1>
                    <p className="attiz-mono text-[9px] sm:text-[10px] font-bold text-black/85 tracking-[0.2em] uppercase mb-4 lg:mb-5">
                      {slide.subtitle}
                    </p>
                    <p className="hidden lg:block attiz-body text-xs sm:text-sm text-black/90 leading-relaxed tracking-wide mb-6 lg:mb-8 max-w-md font-light">
                      {slide.description}
                    </p>
                    <Link
                      href={slideLink || '/#catalog-grid'}
                      className="inline-block py-2.5 px-6 sm:py-3 sm:px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                    >
                      Shop Collection
                    </Link>
                  </div>

                  {/* Right: Neobrutalist Image Card */}
                  <div className={`lg:col-span-6 flex justify-center order-first lg:order-last transition-all duration-700 ${
                    isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                  }`}>
                    <Link href={slideLink || '/#catalog-grid'} className="block w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[400px]">
                      <div className="relative w-full aspect-3/4 bg-white border-[3px] border-black shadow-[6px_6px_0_0_#111111] lg:shadow-[8px_8px_0_0_#111111] rotate-[-1.5deg] hover:rotate-0 hover:shadow-[10px_10px_0_0_#E63B2E] transition-all duration-300 overflow-hidden">
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

        {/* Mobile controls: Dots flanked by small chevron buttons */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-5 mt-8 lg:hidden">
            <button
              onClick={prevSlide}
              className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black active:bg-[#FFCB05] shadow-[2px_2px_0_0_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 border border-black transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-6 bg-[#E63B2E]' : 'w-1.5 bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black active:bg-[#FFCB05] shadow-[2px_2px_0_0_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          {/* Nav arrows - Refined Neobrutalist Style (Desktop Only) */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-black border-2 border-black items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:ml-[1px] hover:mt-[1px] hover:shadow-[1px_1px_0_0_#111111] active:ml-[2px] active:mt-[2px] active:shadow-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-[#111111] border-2 border-black items-center justify-center transition-all duration-200 cursor-pointer shadow-[2px_2px_0_0_#111111] hover:ml-[1px] hover:mt-[1px] hover:shadow-[1px_1px_0_0_#111111] active:ml-[2px] active:mt-[2px] active:shadow-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot Indicators matching ProductDetails (Desktop Only) */}
          <div className="hidden lg:flex absolute bottom-6 left-12 z-20 space-x-2.5">
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
