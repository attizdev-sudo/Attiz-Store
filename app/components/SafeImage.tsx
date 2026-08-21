'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  hoverSrc?: string | null;
  fallbackSrc?: string;
  hoverClassName?: string;
  showHoverEffect?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  hoverSrc,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  alt = 'Product Image',
  className = '',
  hoverClassName = '',
  showHoverEffect = true,
  fill = false,
  sizes,
  priority,
  ...props
}) => {
  const [baseError, setBaseError] = useState(false);
  const [baseUnoptimized, setBaseUnoptimized] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const [hoverError, setHoverError] = useState(false);
  const [hoverUnoptimized, setHoverUnoptimized] = useState(false);

  // Normalize base image src
  const initialSrc = (src && typeof src === 'string' && src.trim().length > 0) ? src.trim() : fallbackSrc;
  const currentBaseSrc = baseError ? fallbackSrc : initialSrc;

  // Determine if valid hover image exists and hasn't errored out
  const validHoverSrc = (hoverSrc && typeof hoverSrc === 'string' && hoverSrc.trim().length > 0) ? hoverSrc.trim() : null;
  const hasWorkingHover = showHoverEffect && Boolean(validHoverSrc) && !hoverError && validHoverSrc !== currentBaseSrc;

  const handleBaseError = () => {
    if (!baseUnoptimized && !baseError) {
      // First try unoptimized mode in case Next.js Image Optimization endpoint errored
      setBaseUnoptimized(true);
    } else if (!baseError) {
      // If unoptimized also fails, switch to fallbackSrc
      setBaseError(true);
    } else {
      // If even fallbackSrc fails, activate final SVG placeholder
      setFallbackError(true);
    }
  };

  const handleHoverError = () => {
    if (!hoverUnoptimized && !hoverError) {
      setHoverUnoptimized(true);
    } else {
      setHoverError(true);
    }
  };

  const baseOpacityClass = hasWorkingHover ? 'group-hover:opacity-0 transition-opacity duration-700 ease-out' : '';

  if (fallbackError) {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center bg-[#F0EDE6] border border-black/10 p-4 text-center select-none ${className}`}>
        <svg className="w-10 h-10 text-black/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="attiz-mono text-[9px] font-bold uppercase tracking-widest text-black/70 line-clamp-1">{alt}</span>
        <span className="attiz-mono text-[8px] font-medium text-black/85 uppercase tracking-wider mt-0.5">ATTIZ Collection</span>
      </div>
    );
  }

  return (
    <>
      {/* Primary / Base Image */}
      <Image
        {...props}
        src={currentBaseSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        sizes={sizes}
        unoptimized={baseUnoptimized || currentBaseSrc.endsWith('.svg')}
        onError={handleBaseError}
        className={`${className} ${baseOpacityClass}`}
      />

      {/* Alternate / Hover Image */}
      {hasWorkingHover && validHoverSrc && (
        <Image
          {...props}
          src={validHoverSrc}
          alt={`${alt} Alternate`}
          fill={fill}
          sizes={sizes}
          unoptimized={hoverUnoptimized || validHoverSrc.endsWith('.svg')}
          onError={handleHoverError}
          className={`${hoverClassName || className} absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-102 group-hover:scale-105`}
        />
      )}
    </>
  );
};

export default SafeImage;
