import React from 'react';

export default function QuoteSection() {
  return (
    <section className="py-20 flex justify-center items-center bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] grid grid-cols-1 md:grid-cols-12 rotate-[0.5deg]">
          
          {/* Quote Mark Left Banner */}
          <div className="md:col-span-3 bg-[#FFCB05] flex items-center justify-center p-6 border-b-[3px] md:border-b-0 md:border-r-[3px] border-black min-h-24">
            <span className="attiz-display text-8xl text-black select-none leading-none pt-6">“</span>
          </div>

          {/* Quote Content Right */}
          <div className="md:col-span-9 bg-white p-8 sm:p-10 relative flex flex-col justify-center text-center md:text-left">
            <h3 className="attiz-display text-2xl sm:text-3xl font-bold text-black tracking-wide uppercase mb-4 leading-snug">
              WE DON'T FOLLOW TRENDS. WE CREATE THEM.
            </h3>
            <p className="attiz-body text-xs sm:text-sm leading-relaxed text-black/75 tracking-wider text-justify md:text-left max-w-2xl font-light">
              Every ATTIZ piece is designed with purpose, crafted with premium fabrics, and finished with uncompromising attention to detail. More than clothing, it's confidence you wear—built for those who choose authenticity over approval.
            </p>
            <div className="mt-6 flex items-center justify-center md:justify-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E63B2E]" />
              <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-[0.2em] uppercase">TEAM ATTIZ</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
