'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CategoryNav from '@/app/components/CategoryNav';
import HeroCarousel from '@/app/components/HeroCarousel';
import EditorialHero from '@/app/components/EditorialHero';
import QuoteSection from '@/app/components/QuoteSection';
import PickStyles from '@/app/components/PickStyles';
import ProductGrid from '@/app/components/ProductGrid';
import Newsletter from '@/app/components/Newsletter';
import ValueProps from '@/app/components/ValueProps';

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
      <PickStyles />
      <ProductGrid />
      <Newsletter />
      <ValueProps />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
