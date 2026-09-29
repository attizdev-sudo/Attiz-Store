'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function triggerRouteProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:start-route-progress'));
  }
}

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  const startProgress = () => {
    setIsNavigating(true);
    setProgress(25);
    setTimeout(() => setProgress((p) => (p >= 25 && p < 65 ? 65 : p)), 150);
    setTimeout(() => setProgress((p) => (p >= 65 && p < 85 ? 85 : p)), 500);
  };

  // Complete progress bar when route changes
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Listen for programmatic route start events
  useEffect(() => {
    const handleCustomStart = () => {
      startProgress();
    };
    window.addEventListener('app:start-route-progress', handleCustomStart);
    return () => window.removeEventListener('app:start-route-progress', handleCustomStart);
  }, []);

  // Intercept all internal link clicks for 0ms instant visual feedback
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Ignore modified clicks (cmd, ctrl, shift, middle click)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      if (!href || targetAttr === '_blank') return;
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;

      // Handle relative or same-origin URLs
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // Skip in-page hash anchor navigation (e.g., #catalog-grid)
        const isSamePageAnchor =
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          Boolean(url.hash);
        if (isSamePageAnchor) return;

        // Skip if clicking link to the current exact page
        const isCurrentUrl =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;
        if (isCurrentUrl) return;

        // Start progress immediately!
        startProgress();
      } catch {
        /* ignore invalid URLs */
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => document.removeEventListener('click', handleDocumentClick, { capture: true });
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none bg-black/10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FFCB05] via-[#E63B2E] to-[#FFCB05] shadow-[0_0_10px_#E63B2E,0_0_4px_#FFCB05] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}

export default function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
