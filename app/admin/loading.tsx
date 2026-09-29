import React from 'react';
import AttizLoader from '@/app/components/AttizLoader';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <AttizLoader label="Loading Admin Console..." badge="ADMIN" />
    </div>
  );
}
