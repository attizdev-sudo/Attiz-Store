import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AttizLoader from '@/app/components/AttizLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back Link Skeleton */}
        <div className="flex items-center space-x-2 attiz-mono text-xs font-bold uppercase text-black/40">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </div>

        {/* Skeleton Card */}
        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#111111] space-y-6">
          <div className="border-b border-black/10 pb-4">
            <div className="w-24 h-4 bg-black/10 mb-3 animate-pulse" />
            <div className="w-48 h-7 bg-black/15 mb-2 animate-pulse" />
            <div className="w-64 h-3 bg-black/10 animate-pulse" />
          </div>

          <div className="py-16 flex items-center justify-center">
            <AttizLoader label="Loading Order Details..." />
          </div>
        </div>
      </div>
    </div>
  );
}
