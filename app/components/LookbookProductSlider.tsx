'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Heart, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SafeImage } from '@/app/components/SafeImage';
import type { Product } from '@/lib/types';

function getProductImages(product: Product): { primary: string; secondary?: string } {
  const urls: string[] = [];
  if (product.image) urls.push(product.image);

  product.product_variants?.forEach((v) => {
    v.product_variant_images?.forEach((img) => {
      if (img.image_url && !urls.includes(img.image_url)) {
        urls.push(img.image_url);
      }
    });
  });

  if (urls.length <= 1 && product.images) {
    product.images
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean)
      .forEach((img) => {
        if (!urls.includes(img)) {
          urls.push(img);
        }
      });
  }

  return {
    primary: urls[0] || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
    secondary: urls[1] || undefined,
  };
}

export default function LookbookProductSlider() {
  const router = useRouter();
  const { products: allProducts, categories: allCategories, lookbookSettings, dbLoading } = useStore();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist, togglingIds } = useWishlist();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);

  // If slider is explicitly disabled by admin, return null
  if (lookbookSettings && lookbookSettings.is_enabled === false) {
    return null;
  }

  // 1. Gather all descendant category IDs for selected category
  const targetCategoryId = lookbookSettings?.category_id || 'all';

  const getDescendantIds = (catId: string): string[] => {
    const ids = [catId];
    const queue = [catId];
    while (queue.length > 0) {
      const currId = queue.shift();
      const children = allCategories.filter((c) => c.parent_id === currId);
      for (const child of children) {
        if (!ids.includes(child.id)) {
          ids.push(child.id);
          queue.push(child.id);
        }
      }
    }
    return ids;
  };

  let matchingCatIds: string[] | null = null;
  let selectedCategoryName = lookbookSettings?.category_name || 'All Collections';

  if (targetCategoryId && targetCategoryId !== 'all') {
    const matchingCat = allCategories.find(
      (c) => c.id === targetCategoryId || c.name.toLowerCase() === targetCategoryId.toLowerCase()
    );
    if (matchingCat) {
      matchingCatIds = getDescendantIds(matchingCat.id);
      selectedCategoryName = matchingCat.name;
    }
  }

  // 2. Filter products based on matching category IDs
  let filteredProducts = allProducts.filter((product) => {
    if (!matchingCatIds) return true;
    const pCats = product.category_ids || (product.category_id ? [product.category_id] : []);
    return pCats.some((id) => matchingCatIds!.includes(id));
  });

  // Fallback to latest products if category has no items yet
  if (filteredProducts.length === 0 && allProducts.length > 0) {
    filteredProducts = allProducts;
  }

  const limitCount = lookbookSettings?.limit_count || 12;
  const displayProducts = filteredProducts.slice(0, limitCount);

  // Smooth Scroll controls & arrow updates with RAF throttling
  const animFrameRef = useRef<number | null>(null);

  const updateScrollState = () => {
    if (animFrameRef.current !== null) return;
    animFrameRef.current = requestAnimationFrame(() => {
      animFrameRef.current = null;
      const el = scrollContainerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const nextCanLeft = scrollLeft > 10;
      const nextCanRight = scrollLeft + clientWidth < scrollWidth - 10;
      setCanScrollLeft(nextCanLeft);
      setCanScrollRight(nextCanRight);
    });
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.removeEventListener('resize', updateScrollState);
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [displayProducts]);

  // Mouse Drag-to-Scroll Support (Desktop primary mouse button only)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftPos(el.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftPos - walk;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const stepWidth = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -stepWidth : stepWidth,
      behavior: 'smooth',
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedSize = product.sizes ? product.sizes.split(',')[0].trim() : 'M';
    const firstVariant = product.product_variants?.[0];
    const itemGst = (product as any).gst_rate || firstVariant?.gst_rate || 0;
    const taxablePrice = Math.max(0, (product.price || 0) * (1 - (product.discount || 0) / 100));
    const finalPrice = Math.round(taxablePrice * (1 + itemGst / 100));

    addToCart({
      ...product,
      variant_id: firstVariant?.id,
      sku: firstVariant?.sku,
      price: finalPrice,
      discount: product.discount || 0,
      original_mrp: product.price,
      gst_rate: itemGst,
      quantity: 1,
      selectedSize,
      selectedColor: firstVariant?.color || '',
    } as any, true);

    setAddedCardId(product.id);
    setTimeout(() => setAddedCardId(null), 1500);
  };

  const exploreCategoryUrl =
    targetCategoryId && targetCategoryId !== 'all'
      ? `/?secondary=${encodeURIComponent(selectedCategoryName)}#catalog-grid`
      : '/?parent=All+Collections#catalog-grid';

  return (
    <section className="py-8 sm:py-16 md:py-20 border-t border-b border-black/10 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">

        {/* Section Header with Explore & Arrow Navigation Buttons */}
        <div className="flex items-end justify-between gap-3 sm:gap-4 border-b border-black/10 pb-3 sm:pb-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className="attiz-mono text-[10px] sm:text-[11px] font-bold text-black/85 tracking-[0.2em] uppercase">
                {lookbookSettings?.tag || 'MOST POPULAR'}
              </span>
              <span className="text-black/30">•</span>
              <span className="attiz-mono text-[10px] sm:text-[11px] font-bold text-black/60 tracking-widest uppercase">
                {selectedCategoryName}
              </span>
            </div>

            <h2 className="attiz-display text-2xl xs:text-3xl sm:text-3xl md:text-5xl text-black uppercase tracking-tight font-normal leading-tight">
              {lookbookSettings?.title || 'Trending Collection'}
            </h2>

            <p className="hidden sm:block attiz-body text-xs sm:text-sm text-black/85 font-light leading-relaxed mt-1">
              {lookbookSettings?.subtitle || 'Handpicked bestsellers & top-rated garments loved by our community.'}
            </p>
          </div>

          {/* Action Header Group: Explore Button (Visible on All) + Arrows (Hidden on Mobile) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end">
            <button
              onClick={() => router.push(exploreCategoryUrl)}
              className="group px-3.5 py-2 sm:px-5 sm:py-2.5 bg-black hover:bg-brand-brown text-white attiz-mono text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll Left"
                className={`w-9 h-9 sm:w-10 sm:h-10 border border-black/15 bg-white flex items-center justify-center transition-all cursor-pointer ${canScrollLeft
                    ? 'text-black hover:bg-black hover:text-white hover:border-black shadow-xs active:scale-95'
                    : 'text-black/25 border-black/5 bg-black/[0.02] cursor-not-allowed'
                  }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              </button>

              <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll Right"
                className={`w-9 h-9 sm:w-10 sm:h-10 border border-black/15 bg-white flex items-center justify-center transition-all cursor-pointer ${canScrollRight
                    ? 'text-black hover:bg-black hover:text-white hover:border-black shadow-xs active:scale-95'
                    : 'text-black/25 border-black/5 bg-black/[0.02] cursor-not-allowed'
                  }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {dbLoading && displayProducts.length === 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="aspect-[3/4] bg-black/5 animate-pulse relative" />
                <div className="h-3.5 bg-black/5 animate-pulse w-3/4" />
                <div className="h-3.5 bg-black/5 animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Horizontal Products Slider Row */}
        {displayProducts.length > 0 && (
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollState}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-3 sm:gap-6 overflow-x-auto scrollbar-none pb-3 pt-0.5 snap-x snap-mandatory scroll-smooth ${isDragging ? 'cursor-grabbing snap-none md:select-none' : 'cursor-grab'
              }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {displayProducts.map((product) => {
              const images = getProductImages(product);
              const firstVariant = product.product_variants?.[0];

              const itemGst = (product as any).gst_rate || firstVariant?.gst_rate || 0;
              const taxablePrice = Math.max(0, (product.price || 0) * (1 - (product.discount || 0) / 100));
              const finalPrice = Math.round(taxablePrice * (1 + itemGst / 100));
              const isLiked = isWishlisted(product.id);

              return (
                <div
                  key={product.id}
                  className="w-[160px] xs:w-[180px] sm:w-[240px] md:w-[260px] shrink-0 snap-start group relative flex flex-col justify-between"
                >
                  <Link href={`/product/${product.id}`} className="flex flex-col h-full relative">

                    {/* Media Container (ProductGrid Style aspect-[3/4]) */}
                    <div className="relative aspect-[3/4] bg-[#F0EDE6] overflow-hidden transition-all duration-500 ease-out group-hover:shadow-xl group-hover:shadow-black/5">

                      {/* Product Base & Alternate Hover Images */}
                      <SafeImage
                        src={images.primary}
                        hoverSrc={images.secondary}
                        alt={product.title}
                        fill
                        className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, 260px"
                      />

                      {/* Floating Discount Badge */}
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-black text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 attiz-mono text-[7px] sm:text-[9px] font-bold tracking-wider sm:tracking-widest uppercase">
                          <span className="inline sm:hidden">-{product.discount}%</span>
                          <span className="hidden sm:inline">Save {product.discount}%</span>
                        </div>
                      )}

                      {/* Wishlist Button Core */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product, firstVariant?.id);
                        }}
                        disabled={togglingIds.has(product.id)}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white active:scale-90 transition-transform duration-100 cursor-pointer"
                        aria-label="Wishlist item"
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-[16px] sm:h-[16px] transition-colors duration-100 ${isLiked ? 'fill-[#E63B2E] stroke-[#E63B2E]' : 'stroke-black fill-none'}`} />
                      </button>

                      {/* Quick Add Overlay System (Desktop) */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden lg:block z-20 bg-gradient-to-t from-black/60 to-transparent">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="w-full py-3 bg-white hover:bg-black text-black hover:text-white attiz-mono text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer uppercase transition-all duration-300"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add +</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="pt-2.5 sm:pt-5 flex flex-col justify-between grow">
                      <div>
                        <h4 className="attiz-body text-[12px] sm:text-[14px] font-medium text-black/90 group-hover:text-black transition-colors line-clamp-1 sm:line-clamp-2 leading-snug">
                          {product.title}
                        </h4>
                      </div>

                      <div className="flex items-baseline justify-between mt-1.5 sm:mt-3 pt-1.5 sm:pt-2 border-t border-black/5">
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                          {product.discount && product.discount > 0 ? (
                            <>
                              <span className="attiz-mono text-[12px] sm:text-[15px] font-bold text-[#E63B2E]">
                                ₹{finalPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="attiz-body text-[9px] sm:text-xs text-black/85 line-through font-light">
                                ₹{parseFloat(String(product.price || 0)).toLocaleString('en-IN')}
                              </span>
                            </>
                          ) : (
                            <span className="attiz-mono text-[12px] sm:text-[15px] font-bold text-black">
                              ₹{parseFloat(String(product.price || 0)).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Inline Interactive CTA */}
                        <div className="flex items-center text-[11px] attiz-mono font-bold tracking-wider text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 lg:flex hidden">
                          <span>VIEW</span>
                          <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                        </div>

                        {/* Mobile Action Button Trigger */}
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`lg:hidden w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-none cursor-pointer transition-colors ${addedCardId === product.id ? 'bg-emerald-600 text-white' : 'bg-black text-white'
                            }`}
                          aria-label="Add to cart context"
                        >
                          {addedCardId === product.id ? (
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          ) : (
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
