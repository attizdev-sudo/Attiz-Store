'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners } = useStore();
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

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full aspect-[16/7] md:aspect-[21/9] overflow-hidden bg-[#FAF8F5] border-b border-black/10">
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
                className="object-contain object-center"
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
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/40 bg-black/15 hover:bg-white hover:text-brand-dark text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md group"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5 bg-black/10 hover:bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
