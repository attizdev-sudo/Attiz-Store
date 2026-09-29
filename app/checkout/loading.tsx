import React from 'react';
import AttizLoader from '@/app/components/AttizLoader';

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="border-b-2 border-black pb-4">
          <div className="w-24 h-4 bg-black/10 mb-2 animate-pulse" />
          <div className="w-48 h-8 bg-black/20 animate-pulse" />
        </div>

        {/* Content Skeleton with AttizLoader */}
        <div className="bg-white border-2 border-black p-8 sm:p-12 shadow-[6px_6px_0_0_#111111] flex items-center justify-center min-h-[400px]">
          <AttizLoader label="Preparing checkout..." badge="CHECKOUT" />
        </div>
      </div>
    </div>
  );
}
