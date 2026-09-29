import React from 'react';
import AttizLoader from '@/app/components/AttizLoader';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-16">
      <AttizLoader label="Loading Product Details..." badge="ATTIZ" />
    </div>
  );
}
