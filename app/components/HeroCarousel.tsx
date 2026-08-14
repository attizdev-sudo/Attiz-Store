'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners, dbLoading } = useStore();
  const slides = banners || [];

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const MIN_SWIPE_DISTANCE = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    if (dbLoading) {
      return (
        <section className="relative w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-[#FAF8F5] border-b border-black/10 flex items-center justify-center">
          {/* Halftone texture background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] z-0 animate-pulse"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />

          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-3 text-center">
            {/* Neobrutalist custom loading indicator */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-black/20 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-transparent animate-spin" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-2 py-0.5 -skew-x-6">
                <span className="skew-x-6">ATTIZ</span>
              </span>
              <p className="attiz-mono text-[9px] font-bold text-black/85 tracking-[0.25em] uppercase animate-pulse">
                Loading Banners...
              </p>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-black border-b-2 border-black touch-pan-y select-none"
    >
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const slideImage = slide.image_url;
          const slideLink = slide.redirect_url;

          // Check if position is explicitly right (default to left)
          const isRightAligned = slide.bg_split_left?.toLowerCase() === 'right';
          const smallTitle = slide.tagline;
          const mainTitle = slide.title;
          const description = slide.discount;
          const primaryBtnText = slide.bg_split_left && !['left', 'right'].includes(slide.bg_split_left.toLowerCase())
            ? slide.bg_split_left
            : 'SHOP NOW';
          const secondaryBtnText = slide.bg_split_right;

          const hasTextContent = Boolean(smallTitle || mainTitle || description || secondaryBtnText);

          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'
                }`}
            >
              <div className="relative w-full h-full select-none bg-black overflow-hidden group">
                {/* Banner Background Image with Smooth Subtle Scale/Ken Burns Motion */}
                <Image
                  src={slideImage}
                  alt={mainTitle || 'ATTIZ Hero Banner'}
                  fill
                  className={`object-cover object-center transition-transform duration-[8000ms] ease-out ${isActive ? 'scale-105' : 'scale-100'
                    }`}
                  sizes="100vw"
                  priority={idx === 0}
                />

                {/* Clean Content Overlay — ZERO Black Fade Background */}
                <div
                  className={`absolute inset-0 z-10 flex flex-col justify-end sm:justify-center p-4 sm:p-12 md:p-16 lg:p-20 pb-5 sm:pb-12 transition-opacity duration-700 ${isRightAligned
                    ? 'items-end text-right'
                    : 'items-start text-left'
                    }`}
                >
                  {hasTextContent && (
                    <div className={`max-w-xl space-y-1 sm:space-y-3.5 ${isRightAligned ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      {/* Small Title / Tagline */}
                      {smallTitle && (
                        <div
                          className={`transform transition-all duration-700 ease-out delay-150 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                          <span className="attiz-mono text-[10px] sm:text-xs md:text-sm font-bold text-[#FFCB05] tracking-[0.2em] uppercase block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {smallTitle}
                          </span>
                        </div>
                      )}

                      {/* Main Title / Headline */}
                      {mainTitle && (
                        <div
                          className={`transform transition-all duration-700 ease-out delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                          <h1 className="attiz-display text-lg sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-wide leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                            {mainTitle}
                          </h1>
                        </div>
                      )}

                      {/* Title Description — Hidden on Mobile to Keep Hero Image Unobscured */}
                      {description && (
                        <div
                          className={`hidden sm:block transform transition-all duration-700 ease-out delay-450 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                        >
                          <p className="attiz-body text-sm md:text-base text-white/90 font-normal leading-snug max-w-lg line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {description}
                          </p>
                        </div>
                      )}

                      {/* CTA Buttons — Hidden on Mobile for Maximum Image Visibility */}
                      <div
                        className={`hidden sm:flex pt-2 sm:pt-4 flex-wrap items-center gap-2 sm:gap-3 transform transition-all duration-700 ease-out delay-600 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                          }`}
                      >
                        {/* Primary Button */}
                        {slideLink ? (
                          <Link
                            href={slideLink}
                            className="attiz-mono text-xs font-bold text-white bg-[#E63B2E] hover:bg-[#c92a1e] border-2 border-[#E63B2E] px-6 py-3 uppercase tracking-wider transition-all duration-200 shadow-[2px_2px_0_0_#111111] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{primaryBtnText}</span>
                          </Link>
                        ) : (
                          <span className="attiz-mono text-xs font-bold text-white bg-[#E63B2E] border-2 border-[#E63B2E] px-6 py-3 uppercase tracking-wider inline-flex items-center gap-1.5">
                            <span>{primaryBtnText}</span>
                          </span>
                        )}

                        {/* Secondary Button */}
                        {secondaryBtnText && (
                          <Link
                            href={slideLink || '/'}
                            className="attiz-mono text-xs font-bold text-[#FFCB05] bg-transparent hover:bg-[#FFCB05] hover:text-black border-2 border-[#FFCB05] px-6 py-3 uppercase tracking-wider transition-all duration-200 shadow-[2px_2px_0_0_#111111] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{secondaryBtnText}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Banner Slide"
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Banner Slide"
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>

          <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 sm:space-x-2.5 bg-black/35 px-2 py-1 sm:px-3 sm:py-2 rounded-full backdrop-blur-xs">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to banner slide ${idx + 1}`}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
