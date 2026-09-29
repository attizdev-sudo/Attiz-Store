import React from 'react';
import Image from 'next/image';
import AttizLoader from '@/app/components/AttizLoader';

export default function LoginLoading() {
  return (
    <div className="min-h-[calc(100dvh-112px)] sm:min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-6 pb-20 sm:pb-8">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      />
      <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.5deg] relative z-10">
        <div className="bg-[#111111] px-6 py-5 border-b-[3px] border-black flex items-center justify-between">
          <Image src="/ATTIZ.png" alt="ATTIZ" width={80} height={32} className="h-8 w-auto object-contain" priority />
          <span className="bg-[#FFCB05] text-black attiz-mono text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
            Sign In
          </span>
        </div>
        <div className="p-10 flex flex-col items-center justify-center">
          <AttizLoader label="Loading Sign In..." badge="AUTH" />
        </div>
      </div>
    </div>
  );
}
