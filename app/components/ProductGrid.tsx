'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Heart, ShoppingBag, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';

const getProductImages = (product: Product) => {
  const urls: string[] = [];
  if (product.image) urls.push(product.image);

  product.product_variants?.forEach((v) => {
    v.product_variant_images?.forEach((img) => {
      if (img.image_url && !urls.includes(img.image_url)) {
        urls.push(img.image_url);
      }
    });
  });

  if (urls.length === 1 && product.images) {
    product.images.split(',').map((img) => img.trim()).filter(Boolean).forEach((img) => {
      if (!urls.includes(img)) {
        urls.push(img);
      }
    });
  }

  return urls;
};

function ProductGridInner() {
  const { addToCart } = useCart();
  const { products: allProducts, categories: allCategories, dbLoading } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const parentParam = searchParams.get('parent');
  const secondaryParam = searchParams.get('secondary');
  const subcategoryParam = searchParams.get('subcategory');
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  const categories = ['All', ...allCategories.filter(c => !c.parent_id).map(c => c.name)];

  useEffect(() => {
    setSelectedCategory(parentParam || 'All');
  }, [parentParam]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#catalog-grid') {
      const timer = setTimeout(() => {
        const gridEl = document.getElementById('catalog-grid');
        if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleCategoryTabClick = (cat: string) => {
    router.push(cat === 'All' ? '/' : `/?parent=${cat}`);
  };

  const getDescendantIds = (catId: string): string[] => {
    const ids = [catId];
    const queue = [catId];
    while (queue.length > 0) {
      const currId = queue.shift();
      const children = allCategories.filter(c => c.parent_id === currId);
      for (const child of children) {
        if (!ids.includes(child.id)) {
          ids.push(child.id);
          queue.push(child.id);
        }
      }
    }
    return ids;
  };

  const filterParam = categoryParam || secondaryParam || parentParam || subcategoryParam;
  let activeFilterCatIds: string[] | null = null;
  let activeCategoryName = '';

  if (filterParam && filterParam !== 'All') {
    const matchingCat = allCategories.find(
      (c) => c.id === filterParam || c.name.toLowerCase() === filterParam.toLowerCase()
    );
    if (matchingCat) {
      activeFilterCatIds = getDescendantIds(matchingCat.id);
      activeCategoryName = matchingCat.name;
    }
  }

  const filteredProducts = allProducts.filter((product) => {
    if (activeFilterCatIds) {
      const pCats = product.category_ids || (product.category_id ? [product.category_id] : []);
      const matches = pCats.some((id) => activeFilterCatIds.includes(id));
      if (!matches) return false;
    }
    return true;
  });

  // Split products by color variants if split_variants is checked
  const splitProducts: (Product & { selectedColorVariant?: string; colorSpecificImage?: string; colorSpecificAltImage?: string })[] = [];
  
  filteredProducts.forEach((product) => {
    if (product.split_variants && product.product_variants && product.product_variants.length > 0) {
      const colors = Array.from(new Set(product.product_variants.map(v => v.color))).filter(Boolean);
      if (colors.length > 0) {
        colors.forEach((color) => {
          const colorVariants = product.product_variants!.filter(v => v.color === color);
          const firstColorVariant = colorVariants[0];
          
          const colorImages: string[] = [];
          colorVariants.forEach((v) => {
            v.product_variant_images?.forEach((img) => {
              if (img.image_url && !colorImages.includes(img.image_url)) {
                colorImages.push(img.image_url);
              }
            });
          });
          
          const primaryImage = colorImages[0] || product.image;
          const secondaryImage = colorImages[1] || colorImages[0] || product.image;
          
          splitProducts.push({
            ...product,
            title: `${product.title} - ${color}`,
            price: firstColorVariant ? parseFloat(String(firstColorVariant.price)) : product.price,
            discount: firstColorVariant ? parseFloat(String(firstColorVariant.discount || 0)) : product.discount,
            image: primaryImage,
            selectedColorVariant: color,
            colorSpecificImage: primaryImage,
            colorSpecificAltImage: secondaryImage,
          });
        });
        return;
      }
    }
    splitProducts.push(product);
  });

  const sortedProducts = [...splitProducts].sort((a, b) => {
    if (selectedSort === 'low-high') return parseFloat(String(a.price)) - parseFloat(String(b.price));
    if (selectedSort === 'high-low') return parseFloat(String(b.price)) - parseFloat(String(a.price));
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const hasFilter = !!filterParam && filterParam !== 'All';

  let bannerTitle = 'Collections';
  if (hasFilter) {
    const mainCat = activeCategoryName || filterParam || '';
    if (mainCat) {
      const lowerCat = mainCat.toLowerCase();
      if (lowerCat.includes('polo')) bannerTitle = 'Polo T-Shirts';
      else if (lowerCat.includes('crew') || lowerCat.includes('tee')) bannerTitle = 'Crew Necks';
      else if (lowerCat.includes('jogger')) bannerTitle = 'Jogger Pants';
      else if (lowerCat.includes('sweatshirt')) bannerTitle = 'Sweatshirts';
      else bannerTitle = mainCat;
    }
  }

  return (
    <section id="catalog-grid" className="bg-[#FAF8F5] text-black scroll-mt-24 relative overflow-hidden">
      {/* Decorative Large Background Typography */}
      <div className="absolute right-0 top-10 pointer-events-none select-none opacity-[0.02] translate-x-1/4 hidden lg:block">
        <span className="attiz-display text-[240px] leading-none tracking-tighter uppercase">{bannerTitle}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        
        {/* Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-black/10 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E63B2E]" />
              <span className="attiz-mono text-[11px] font-bold tracking-[0.3em] text-[#E63B2E] uppercase">Attiz</span>
            </div>
            <h2 className="attiz-display text-5xl sm:text-6xl tracking-tight uppercase leading-none">
              {bannerTitle}
            </h2>
            <p className="attiz-body text-sm text-black/50 mt-4 max-w-md font-light">
              Architected profiles engineered for comfort. Functional daily wear prioritizing modern ergonomics.
            </p>
          </div>

          {/* Filtering controls unified */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full border border-black/5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-black/60" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-transparent attiz-mono text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer pr-2"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="low-high">Price: Low - High</option>
                <option value="high-low">Price: High - Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Navigation Slider */}
        <div className="mb-12 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-3 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryTabClick(cat)}
                  className={`px-5 py-2.5 attiz-mono text-[11px] font-bold tracking-wider uppercase transition-all duration-300 border rounded-none ${
                    isActive 
                      ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                      : 'bg-transparent text-black/60 border-black/10 hover:border-black hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Breadcrumbs */}
        {(parentParam || secondaryParam || subcategoryParam) && (
          <div className="mb-10 p-4 bg-black/[0.02] border border-black/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center flex-wrap gap-2 attiz-mono text-[11px] font-medium tracking-wide text-black/50">
              <span className="text-black/30">Active Scope:</span>
              <span className="text-black font-bold">{parentParam || 'All'}</span>
              {secondaryParam && <><span className="text-black/25">→</span><span className="text-black font-bold">{secondaryParam}</span></>}
              {subcategoryParam && <><span className="text-black/25">→</span><span className="text-black font-bold">{subcategoryParam}</span></>}
              <span className="ml-2 px-2 py-0.5 bg-black/5 text-[10px] text-black font-normal rounded">{filteredProducts.length} items</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="attiz-mono text-[10px] font-bold tracking-widest text-[#E63B2E] uppercase hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product System Grid */}
        {dbLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <div className="aspect-[3/4] bg-black/5 animate-pulse relative" />
                <div className="h-4 bg-black/5 animate-pulse w-3/4" />
                <div className="h-4 bg-black/5 animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-black/10 bg-black/[0.01]">
            <span className="attiz-mono text-black/40 text-xs font-bold tracking-widest uppercase block mb-2">Zero Results Found</span>
            <p className="attiz-body text-sm text-black/35 font-light">Try adjusting your selected filters or categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {sortedProducts.map((product) => {
              const isLiked = wishlist[product.id] || false;
              const cardKey = (product as any).selectedColorVariant 
                ? `${product.id}-${(product as any).selectedColorVariant}` 
                : product.id;
              const images = getProductImages(product);
              const nextImage = (product as any).colorSpecificAltImage || images[1];
              const finalPrice = product.discount && product.discount > 0
                ? Math.round((product.price || 0) * (1 - (product.discount || 0) / 100))
                : (product.price || 0);

              const handleQuickAdd = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                
                const selectedSize = product.sizes ? product.sizes.split(',')[0].trim() : 'M';
                const targetColor = (product as any).selectedColorVariant || '';
                const targetVariant = product.product_variants?.find(v => 
                  v.size === selectedSize && 
                  (!targetColor || v.color.toLowerCase() === targetColor.toLowerCase())
                ) || product.product_variants?.[0];

                addToCart({
                  ...product,
                  price: finalPrice,
                  quantity: 1,
                  selectedSize,
                  selectedColor: targetColor || (targetVariant?.color) || '',
                } as any);
              };

              const queryColor = (product as any).selectedColorVariant 
                ? `?color=${encodeURIComponent((product as any).selectedColorVariant)}` 
                : '';

              return (
                <div key={cardKey} className="group relative flex flex-col justify-between">
                  <Link href={`/product/${product.id}${queryColor}`} className="flex flex-col h-full relative">
                    
                    {/* Media container */}
                    <div className="relative aspect-[3/4] bg-[#F0EDE6] overflow-hidden transition-all duration-500 ease-out group-hover:shadow-xl group-hover:shadow-black/5">
                      
                      {/* Product Base Image */}
                      <Image
                        src={product.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                        alt={product.title}
                        fill
                        className={`object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105 ${nextImage ? 'group-hover:opacity-0' : ''}`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Product Alternative Hover Image */}
                      {nextImage && (
                        <Image
                          src={nextImage}
                          alt={`${product.title} Alternate`}
                          fill
                          className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-102 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      )}

                      {/* Floating Discount Badge */}
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-4 left-4 z-20 bg-black text-white px-2.5 py-1 attiz-mono text-[9px] font-bold tracking-widest uppercase">
                          Save {product.discount}%
                        </div>
                      )}

                      {/* Wishlist Button Core */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors duration-200 cursor-pointer"
                        aria-label="Wishlist item"
                      >
                        <Heart className={`w-[16px] h-[16px] transition-colors duration-200 ${isLiked ? 'fill-[#E63B2E] stroke-[#E63B2E]' : 'stroke-black fill-none'}`} />
                      </button>

                      {/* Quick Add Overlay System (Desktop) */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden lg:block z-20 bg-gradient-to-t from-black/60 to-transparent">
                        <button
                          onClick={handleQuickAdd}
                          className="w-full py-3 bg-white hover:bg-black text-black hover:text-white attiz-mono text-[10px] font-bold tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer uppercase transition-all duration-300"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Quick Add +</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Content */}
                    <div className="pt-5 flex flex-col justify-between grow">
                      <div>
                        {/* <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="attiz-mono text-[9px] text-black/40 uppercase tracking-widest font-semibold">
                            {product.sizes ? `Sizes: ${product.sizes}` : 'Standard Fit'}
                          </span>
                          <span className="w-1 h-1 bg-black/20 rounded-full group-hover:bg-[#E63B2E] transition-colors" />
                        </div> */}
                        <h4 className="attiz-body text-[14px] font-medium text-black/90 group-hover:text-black transition-colors line-clamp-2 leading-snug">
                          {product.title}
                        </h4>
                      </div>

                      <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-black/5">
                        <div className="flex items-baseline gap-2">
                          {product.discount && product.discount > 0 ? (
                            <>
                              <span className="attiz-mono text-[15px] font-bold text-[#E63B2E]">
                                ₹{finalPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="attiz-body text-xs text-black/35 line-through font-light">
                                ₹{parseFloat(String(product.price || 0)).toLocaleString('en-IN')}
                              </span>
                            </>
                          ) : (
                            <span className="attiz-mono text-[15px] font-bold text-black">
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
                          onClick={handleQuickAdd}
                          className="lg:hidden w-8 h-8 flex items-center justify-center bg-black text-white rounded-none cursor-pointer"
                          aria-label="Add to cart context"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
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

export default function ProductGrid() {
  return (
    <Suspense fallback={null}>
      <ProductGridInner />
    </Suspense>
  );
}