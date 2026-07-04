'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const DEFAULT_SLIDES = [
  { title: 'INAUGURAL OFFER', discount: 'FLAT 30% OFF', tagline: 'Exclusive Deal | Limited Time Only', bgSplitLeft: '#dc2626', bgSplitRight: '#991b1b', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1000&auto=format&fit=crop&q=90' },
  { title: 'SUMMER ESSENTIALS', discount: 'UP TO 40% OFF', tagline: 'Premium Comfort | Light Fabric Collection', bgSplitLeft: '#1a1a1a', bgSplitRight: '#0a0a0a', image: 'https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=1000&auto=format&fit=crop&q=90' },
  { title: 'NEW SEASONS DROP', discount: 'FLAT 15% OFF', tagline: 'Tailored Knitwear & Premium Athleisure', bgSplitLeft: '#991b1b', bgSplitRight: '#0a0a0a', image: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=1000&auto=format&fit=crop&q=90' },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { banners } = useStore();
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;

  useEffect(() => {
    if (currentSlide >= slides.length) setCurrentSlide(0);
  }, [slides, currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-128 sm:h-144 md:h-160 lg:h-180 overflow-hidden bg-[#F7F3EE]">
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full relative">
              <div className="relative flex items-center justify-center h-full overflow-hidden" style={{ backgroundColor: slide.bgSplitLeft }}>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-black/5 skew-x-12 transform origin-top-right" />
                <Image
                  src={slide.image}
                  alt="ATTIZ Collection"
                  fill
                  className="object-cover object-center lg:object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={idx === 0}
                />
              </div>
              <div className="relative flex flex-col justify-center px-8 sm:px-16 lg:px-24 h-full text-white" style={{ backgroundColor: slide.bgSplitRight }}>
                <div className="max-w-xl">
                  <span className="inline-block font-sans text-xs sm:text-sm font-bold tracking-[0.35em] text-white/95 uppercase mb-4 sm:mb-6">{slide.title}</span>
                  <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider leading-tight mb-4 sm:mb-6">{slide.discount}</h1>
                  <p className="font-sans text-xs sm:text-sm md:text-base font-light tracking-[0.2em] text-white/80 uppercase">{slide.tagline}</p>
                </div>
                <div className="absolute bottom-10 right-10 text-[9px] font-bold tracking-[0.4em] opacity-20 uppercase hidden sm:block">ATTIZ CLOTHING CO.</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/60 bg-black/10 hover:bg-white hover:text-brand-dark text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md group">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>
      <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/60 bg-black/10 hover:bg-white hover:text-brand-dark text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md group">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-300" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>
    </section>
  );
}
