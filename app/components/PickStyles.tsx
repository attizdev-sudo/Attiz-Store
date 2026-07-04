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
    <section className="py-16 bg-white border-t border-brand-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-cream border border-brand-cream-dark flex items-center justify-center mb-4 shadow-sm">
            <Image src="/ATTIZ.png" alt="ATTIZ Emblem" width={40} height={40} className="object-contain" />
          </div>
          <h2 className="font-sans text-xs font-bold tracking-[0.25em] text-brand-dark">PICK YOUR STYLES</h2>
        </div>

        <div className="relative group">
          <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-20 w-10 h-10 rounded-full border border-brand-cream-dark bg-white/90 hover:bg-brand-brown hover:text-white text-brand-dark flex items-center justify-center transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-20 w-10 h-10 rounded-full border border-brand-cream-dark bg-white/90 hover:bg-brand-brown hover:text-white text-brand-dark flex items-center justify-center transition-all duration-300 shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer">
            <ChevronRight className="w-5 h-5" />
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
                className="shrink-0 w-72 sm:w-70 md:w-[18rem] snap-start border border-brand-cream-dark bg-white shadow-sm overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-96 overflow-hidden bg-brand-cream relative">
                  <img src={style.image} alt={style.name} className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="bg-brand-brown group-hover:bg-brand-brown-dark p-3 text-center transition-colors duration-300">
                  <span className="font-sans text-[10px] font-bold tracking-[0.2em] text-white">{style.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
