'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CategoryNav from '@/app/components/CategoryNav';
import HeroCarousel from '@/app/components/HeroCarousel';
import EditorialHero from '@/app/components/EditorialHero';
import QuoteSection from '@/app/components/QuoteSection';
import LookbookProductSlider from '@/app/components/LookbookProductSlider';
import PickStyles from '@/app/components/PickStyles';
import ProductGrid from '@/app/components/ProductGrid';
import Newsletter from '@/app/components/Newsletter';
import ValueProps from '@/app/components/ValueProps';
import AttizLoader from '@/app/components/AttizLoader';

function HomeContent() {
  const searchParams = useSearchParams();
  const hasFilter =
    searchParams.get('parent') ||
    searchParams.get('secondary') ||
    searchParams.get('subcategory') ||
    searchParams.get('category');

  if (hasFilter) {
    return <ProductGrid />;
  }

  return (
    <>
      <CategoryNav />
      <HeroCarousel />
      <QuoteSection />
      <EditorialHero />
      <LookbookProductSlider />
      <PickStyles />
      <ProductGrid />
      <Newsletter />
      <ValueProps />
    </>
  );
}

function HomePageFallback() {
  return (
    <div className="w-full min-h-[90vh] bg-[#FAF8F5]" aria-hidden="true">
      {/* CategoryNav Placeholder */}
      <div className="h-11 sm:h-12 w-full border-b border-black/10 bg-[#FAF8F5]" />
      {/* HeroCarousel Placeholder with matching responsive aspect ratio */}
      <div className="w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[21/9] bg-[#111111] flex items-center justify-center">
        <AttizLoader label="Loading Attiz..." badge="ATTIZ" />
      </div>
      {/* Content Space Placeholder to keep footer stable below fold */}
      <div className="h-96 w-full bg-[#FAF8F5]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomeContent />
    </Suspense>
  );
}
