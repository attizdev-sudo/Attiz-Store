import React from 'react';
import { RotateCcw, ShieldCheck, Truck, Headphones } from 'lucide-react';

const propsList = [
  { title: 'FREE RETURNS', description: 'Easy 7-day returns & exchanges', icon: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.2]" /> },
  { title: 'SAFE PAYMENT', description: '100% encrypted & secure checkout', icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.2]" /> },
  { title: 'FREE SHIPPING', description: 'Free shipping on all orders', icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.2]" /> },
  { title: 'CUSTOMER SERVICE', description: '24/7 dedicated priority support', icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.2]" /> },
];

export default function ValueProps() {
  return (
    <section className="bg-[#FAF8F5]">
      {/* ── TOP SECTION (Assurances) ── */}
      <div className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 lg:gap-4 divide-y-0 lg:divide-x divide-black/10">
            {propsList.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-3 sm:gap-5 py-3 lg:py-4 px-2 sm:px-4 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-black flex items-center justify-center bg-white text-black group-hover:bg-[#FFCB05] transition-all duration-300 shadow-[2px_2px_0_0_#111111] group-hover:shadow-[3.5px_3.5px_0_0_#111111] group-hover:-translate-x-[1.5px] group-hover:-translate-y-[1.5px] -rotate-3 group-hover:rotate-0 shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <h4 className="attiz-display text-xs sm:text-sm tracking-wider text-black mb-1 group-hover:text-[#E63B2E] transition-colors uppercase">{item.title}</h4>
                  <p className="attiz-body text-[9.5px] sm:text-[10px] text-black/85 tracking-wider font-light leading-snug sm:leading-normal">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAYMENT METHODS SECTION (Clean & Simple, centered) ── */}
      <div className="border-t border-black/10 bg-[#FAF8F5] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <span className="attiz-mono text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-black/50 uppercase mb-5 block">
            Payment Methods
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-85 hover:opacity-100 transition-opacity">
            {/* VISA */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center">
              <span className="font-extrabold italic text-sm sm:text-base tracking-wider text-[#1A1F71]">
                VISA
              </span>
            </div>

            {/* Mastercard */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center space-x-1.5">
              <div className="flex items-center -space-x-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90" />
              </div>
              <span className="attiz-mono text-[9px] font-bold tracking-tight text-black">
                mastercard
              </span>
            </div>

            {/* UPI */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center">
              <span className="attiz-mono text-[10px] sm:text-xs font-black tracking-widest text-[#0F8A5F]">
                UPI
              </span>
            </div>

            {/* Apple Pay */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center space-x-1">
              <span className="text-black font-bold text-xs"></span>
              <span className="attiz-mono text-[10px] sm:text-xs font-bold text-black">Pay</span>
            </div>

            {/* RuPay */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center">
              <span className="attiz-mono text-[10px] sm:text-xs font-extrabold text-[#004B87] uppercase tracking-wider">
                RuPay
              </span>
            </div>

            {/* COD */}
            <div className="h-6 sm:h-7 px-3 bg-white border border-black/15 rounded flex items-center justify-center">
              <span className="attiz-mono text-[9px] font-bold text-black/80 uppercase tracking-wider">
                COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
