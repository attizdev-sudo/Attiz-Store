import React from 'react';

interface AttizLoaderProps {
  label?: string;
  badge?: string;
  className?: string;
}

export default function AttizLoader({
  label = 'Loading Order Details...',
  badge = 'ATTIZ',
  className = '',
}: AttizLoaderProps) {
  return (
    <div className={`flex flex-col items-center gap-3 text-center ${className}`}>
      {/* Neobrutalist custom dual-ring loading indicator */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-black/20 animate-spin"
          style={{ animationDuration: '6s' }}
        />
        <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-transparent animate-spin" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-2 py-0.5 -skew-x-6">
          <span className="skew-x-6">{badge}</span>
        </span>
        {label && (
          <p className="attiz-mono text-[9px] font-bold text-black/85 tracking-[0.25em] uppercase animate-pulse">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
