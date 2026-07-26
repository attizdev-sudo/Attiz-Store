import React from 'react';

export default function QuoteSection() {
  return (
    <section className="py-8 md:py-16 flex justify-center items-center bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative border-2 md:border-[3px] border-black bg-white shadow-[4px_4px_0_0_#111111] md:shadow-[6px_6px_0_0_#111111] grid grid-cols-1 md:grid-cols-12 md:rotate-[0.5deg]">
          
          {/* Quote Mark Left Banner */}
          <div className="md:col-span-3 bg-[#FFCB05] flex items-center justify-center p-3 md:p-6 border-b-2 md:border-b-0 md:border-r-[3px] border-black min-h-12 md:min-h-24">
            <span className="attiz-display text-5xl md:text-8xl text-black select-none leading-none pt-1 md:pt-6">“</span>
          </div>

          {/* Quote Content Right */}
          <div className="md:col-span-9 bg-white p-5 sm:p-8 md:p-10 relative flex flex-col justify-center text-center md:text-left">
            <h3 className="attiz-display text-lg sm:text-2xl md:text-3xl font-bold text-black tracking-wide uppercase mb-2 md:mb-4 leading-snug">
              WE DON'T FOLLOW TRENDS. WE CREATE THEM.
            </h3>
            <p className="attiz-body text-[11px] sm:text-xs md:text-sm leading-relaxed text-black/90 tracking-wider text-center md:text-left max-w-2xl font-light">
              Every ATTIZ piece is designed with purpose, crafted with premium fabrics, and finished with uncompromising attention to detail. More than clothing, it's confidence you wear—built for those who choose authenticity over approval.
            </p>
            <div className="mt-4 md:mt-6 flex items-center justify-center md:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E63B2E]" />
              <span className="attiz-mono text-[9px] md:text-[10px] font-bold text-black/85 tracking-[0.2em] uppercase">TEAM ATTIZ</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
