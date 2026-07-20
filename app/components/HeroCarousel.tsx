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
        <section className="relative w-full aspect-[3/2] sm:aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-[#FAF8F5] border-b border-black/10 flex items-center justify-center">
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
              <p className="attiz-mono text-[9px] font-bold text-black/35 tracking-[0.25em] uppercase animate-pulse">
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
    <section className="relative w-full aspect-[3/2] sm:aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-[#FAF8F5] border-b border-black/10">
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const slideImage = slide.image_url;
          const slideLink = slide.redirect_url;

          const content = (
            <div className="relative w-full h-full select-none cursor-pointer bg-[#FAF8F5]">
              <Image
                src={slideImage}
                alt="ATTIZ Hero Banner"
                fill
                className="object-cover sm:object-contain object-center"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          );

          return (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'
                }`}
            >
              {slideLink ? (
                <Link href={slideLink} className="block w-full h-full">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>

          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-2.5 bg-black/25 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full backdrop-blur-xs">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
