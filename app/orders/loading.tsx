import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        {/* Back button */}
        <div className="mb-10 flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/40 uppercase">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </div>

        {/* Page Header */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-4">
            <span className="skew-x-6">My Account</span>
          </span>
          <h1 className="attiz-display text-3xl sm:text-4xl md:text-5xl uppercase leading-[0.95] tracking-tight text-black mb-3">
            Track Orders
          </h1>
          <p className="attiz-mono text-[10px] font-bold tracking-[0.25em] text-black/50 uppercase">
            Fetching order history…
          </p>
        </div>

        {/* Skeleton loading list */}
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-black border-t-[#E63B2E] animate-spin" />
          <span className="attiz-mono text-[10px] font-bold tracking-[0.35em] uppercase text-black/70 animate-pulse">
            Loading your orders…
          </span>
        </div>
      </div>
    </div>
  );
}
