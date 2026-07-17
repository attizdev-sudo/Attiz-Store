'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const styles = [
  { name: 'ATTIZ POLO', category: 'Polos', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80' },
  { name: 'ATTIZ JOGGERS', category: 'Joggers', image: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=600&auto=format&fit=crop&q=80' },
  { name: 'ATTIZ SWEATSHIRT', category: 'Sweatshirts', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80' },
  { name: 'ATTIZ POLOS', category: 'Polos', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&auto=format&fit=crop&q=80' },
];

export default function PickStyles() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

  return (
    <section className="py-20 border-t border-black/10 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center mb-4 shadow-[2px_2px_0_0_#111111] -rotate-2">
            <Image src="/ATTIZ.png" alt="ATTIZ Emblem" width={32} height={32} className="object-contain" />
          </div>
          <h2 className="attiz-display text-2xl tracking-wider text-black uppercase">Pick Your Styles</h2>
        </div>

        <div className="relative group">
          <button 
            onClick={scrollLeft} 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#111111] transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={scrollRight} 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-20 w-9 h-9 bg-white hover:bg-[#FFCB05] text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#111111] transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory justify-start lg:justify-center"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {styles.map((style, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/?secondary=${style.category}`)}
                className="shrink-0 w-72 sm:w-70 md:w-[18rem] snap-start border-2 border-black bg-white shadow-[3px_3px_0_0_#111111] hover:shadow-[6px_6px_0_0_#111111] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-96 overflow-hidden bg-[#FAF8F5] relative border-b-2 border-black">
                  <img src={style.image} alt={style.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="bg-black group-hover:bg-[#E63B2E] p-3.5 text-center transition-colors duration-300">
                  <span className="attiz-mono text-[9px] font-bold tracking-[0.2em] text-[#FFCB05] group-hover:text-white uppercase transition-colors">{style.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
