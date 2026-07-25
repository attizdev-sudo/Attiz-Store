import React from 'react';
import { ArrowLeft, Heart } from 'lucide-react';

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/40 uppercase">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </div>

        {/* Page Header Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between border-b-2 border-black/15 pb-6">
          <div>
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-3">
              <span className="skew-x-6 flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-[#E63B2E] stroke-[#E63B2E]" />
                Sartorial Vault
              </span>
            </span>
            <h1 className="attiz-display text-3xl sm:text-5xl text-black tracking-tight uppercase">
              My Wishlist
            </h1>
            <p className="attiz-body text-xs text-black/60 font-light mt-1">
              Curated collection of your saved pieces ready for order.
            </p>
          </div>
        </div>

        {/* Skeleton loading grid */}
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-black border-t-[#E63B2E] animate-spin" />
          <span className="attiz-mono text-[10px] font-bold tracking-[0.35em] uppercase text-black/70 animate-pulse">
            Loading your wishlist…
          </span>
        </div>
      </div>
    </div>
  );
}
