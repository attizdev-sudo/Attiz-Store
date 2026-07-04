import React from 'react';

export default function QuoteSection() {
  return (
    <section className="py-16 bg-white flex justify-center items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative rounded-2xl overflow-hidden border border-brand-cream-dark shadow-sm grid grid-cols-1 md:grid-cols-12 bg-white">
          <div className="md:col-span-3 bg-brand-cream flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-brand-cream-dark min-h-16">
            <div className="w-1.5 h-16 bg-brand-brown rounded-full hidden md:block" />
          </div>
          <div className="md:col-span-9 bg-brand-cream/30 p-8 sm:p-12 relative flex flex-col justify-center text-center md:text-left">
            <div className="absolute top-6 right-8 text-6xl font-serif text-brand-brown opacity-20 select-none">"</div>
            <h3 className="font-sans text-lg sm:text-xl md:text-2xl font-bold text-brand-dark tracking-wider uppercase mb-6 leading-snug">
              It is a lifestyle, a statement, a voice.
            </h3>
            <p className="font-sans text-xs sm:text-sm leading-relaxed text-brand-dark/75 tracking-wider text-justify md:text-left max-w-2xl">
              Our exquisitely acclaimed garments are meticulously crafted to provide unparalleled quality and comfort, 
              trusting us to deliver the ultimate in style, luxury, and sophistication. Every stitch is a testament 
              to our dedication to modern sartorial heritage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
