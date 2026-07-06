'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Heart, ShoppingCart, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import type { CartItem, Product } from '@/lib/types';

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

  // Helper function to get all descendants of a category (including itself)
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
      if (!product.category_id || !activeFilterCatIds.includes(product.category_id)) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (selectedSort === 'low-high') return parseFloat(String(a.price)) - parseFloat(String(b.price));
    if (selectedSort === 'high-low') return parseFloat(String(b.price)) - parseFloat(String(a.price));
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const hasFilter = !!filterParam && filterParam !== 'All';

  let bannerTitle = 'OUR COLLECTIONS';
  if (hasFilter) {
    const mainCat = activeCategoryName || filterParam || '';
    if (mainCat) {
      const lowerCat = mainCat.toLowerCase();
      if (lowerCat.includes('polo')) bannerTitle = 'PREMIUM POLO T-SHIRTS';
      else if (lowerCat.includes('crew') || lowerCat.includes('tee')) bannerTitle = 'PREMIUM CREW NECK T-SHIRTS';
      else if (lowerCat.includes('jogger')) bannerTitle = 'PREMIUM JOGGER PANTS';
      else if (lowerCat.includes('sweatshirt')) bannerTitle = 'PREMIUM SWEATSHIRTS';
      else bannerTitle = `PREMIUM ${mainCat.toUpperCase()} SELECTIONS`;
    }
  }

  return (
    <section id="catalog-grid" className="py-16 bg-white border-t border-brand-cream-dark scroll-mt-24">
      {hasFilter && (
        <div className="bg-brand-brown text-white text-center py-6 sm:py-8 tracking-[0.3em] font-serif text-sm sm:text-base font-extrabold uppercase mb-10 shadow-sm">
          {bannerTitle.toUpperCase()}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasFilter ? (
          <>
            <div className="flex flex-col items-center justify-center mb-10 text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-cream border border-brand-cream-dark flex items-center justify-center mb-4 shadow-sm relative">
                <Image src="/ATTIZ.png" alt="ATTIZ" fill className="object-contain p-1" />
              </div>
              <h2 className="font-sans text-xs font-bold tracking-[0.25em] text-brand-dark uppercase">OUR COLLECTIONS</h2>
              <p className="font-sans text-[10px] text-brand-dark/50 tracking-widest font-semibold uppercase mt-1">Explore premium comfort & tailored collections</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-brand-cream-dark mb-10">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryTabClick(cat)}
                    className={`px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${selectedCategory === cat ? 'bg-brand-brown text-white shadow-sm' : 'bg-brand-cream/40 text-brand-dark hover:bg-brand-cream hover:text-brand-brown'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-end">
                <SlidersHorizontal className="w-4 h-4 text-brand-dark/65" />
                <span className="font-sans text-[10px] font-bold tracking-wider text-brand-dark/45 uppercase">Sort By:</span>
                <div className="relative">
                  <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="appearance-none bg-brand-cream/20 border border-brand-cream-dark text-brand-dark font-sans text-xs font-semibold px-4 py-2 pr-8 rounded outline-none focus:border-brand-brown cursor-pointer">
                    <option value="latest">Latest Arrivals</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-brand-dark/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-b border-brand-cream-dark py-4 mb-8 text-[10px] sm:text-xs font-bold tracking-widest text-brand-dark/70 uppercase">
            <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center sm:justify-start">
              <span className="text-brand-dark/45 font-extrabold">Filter:</span>
              {['Availability', 'Price', 'Collections', 'Size'].map((f) => (
                <div key={f} className="flex items-center space-x-1 cursor-pointer hover:text-brand-brown transition-colors">
                  <span>{f}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-4 sm:mt-0 justify-center sm:justify-end">
              <div className="flex items-center space-x-2">
                <span className="text-brand-dark/45 font-extrabold">Sort By:</span>
                <div className="relative flex items-center">
                  <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="appearance-none bg-transparent border-none text-brand-dark font-sans text-[10px] sm:text-xs font-bold uppercase pr-4 outline-none cursor-pointer focus:text-brand-brown">
                    <option value="latest">Latest Arrivals</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-brand-dark/60 pointer-events-none ml-0.5" />
                </div>
              </div>
              <span className="text-brand-dark/45 font-extrabold">{filteredProducts.length} Products</span>
            </div>
          </div>
        )}

        {(parentParam || secondaryParam || subcategoryParam) && (
          <div className="mb-8 flex flex-wrap items-center justify-between bg-brand-cream/15 border border-brand-cream-dark/60 rounded-xl px-5 py-3.5 gap-3">
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark/50 font-sans">
              <span>Filtering:</span>
              <span className="text-brand-brown font-extrabold">{parentParam || 'All Collections'}</span>
              {secondaryParam && (<><span className="text-brand-dark/25 font-light">/</span><span className="text-brand-brown font-extrabold">{secondaryParam}</span></>)}
              {subcategoryParam && (<><span className="text-brand-dark/25 font-light">/</span><span className="text-brand-brown font-extrabold">{subcategoryParam}</span></>)}
            </div>
            <button onClick={() => router.push('/')} className="text-[9px] font-bold tracking-widest text-white bg-brand-brown hover:bg-brand-brown-dark rounded-full px-3.5 py-1.5 uppercase transition-all shadow-xs flex items-center space-x-1 cursor-pointer">
              <span>Clear Filter</span>
              <span>&times;</span>
            </button>
          </div>
        )}

        {dbLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col bg-white border border-brand-cream-dark rounded-lg overflow-hidden">
                <div className="aspect-3/4 bg-brand-cream animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-brand-cream animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-brand-cream animate-pulse rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/45 font-sans text-xs font-bold tracking-widest uppercase">
            No products found matching this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {sortedProducts.map((product) => {
              const isLiked = wishlist[product.id] || false;
              return (
                <div key={product.id} className="group flex flex-col cursor-pointer bg-white overflow-hidden border border-brand-cream-dark rounded-lg hover:shadow-md transition-shadow duration-300 relative">
                  <Link href={`/product/${product.id}`} className="flex flex-col h-full">
                    <div className="relative aspect-3/4 bg-brand-cream overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm text-brand-dark hover:text-brand-brown hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 transition-colors duration-300 ${isLiked ? 'fill-red-500 stroke-red-500' : 'stroke-currentColor'}`} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-brand-dark/85 py-3 text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out hidden lg:block z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const finalPrice = product.discount && product.discount > 0 
                              ? Math.round(product.price * (1 - product.discount / 100)) 
                              : product.price;
                            addToCart({
                              ...product,
                              price: finalPrice,
                              quantity: 1,
                              selectedSize: product.sizes ? product.sizes.split(',')[0].trim() : 'M',
                            });
                          }}
                          className="w-full h-full text-[10px] font-bold tracking-[0.25em] text-white flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>ADD TO CART</span>
                        </button>
                      </div>
                    </div>
                    <div className="pt-4 pb-5 px-3 flex flex-col text-center sm:text-left grow justify-between border-t border-brand-cream-dark/50">
                      <div className="mb-2">
                        <h4 className="font-sans text-[11px] sm:text-xs font-semibold tracking-wider text-brand-dark hover:text-brand-brown transition-colors duration-300 line-clamp-1">{product.title}</h4>
                        <span className="text-[9px] text-brand-dark/45 font-bold tracking-wider uppercase block mt-0.5">Category: {allCategories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                        {product.discount && product.discount > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-green-700 font-extrabold text-[10px] flex items-center shrink-0">
                              ↓{product.discount}%
                            </span>
                            <span className="font-sans text-[10px] text-brand-dark/40 line-through shrink-0">
                              {parseFloat(String(product.price)).toLocaleString('en-IN')}
                            </span>
                            <span className="font-sans text-xs font-bold text-brand-dark whitespace-nowrap">
                              ₹{Math.round(product.price * (1 - product.discount / 100)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="font-sans text-xs font-bold text-brand-brown">₹{parseFloat(String(product.price)).toLocaleString('en-IN')}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const finalPrice = product.discount && product.discount > 0 
                              ? Math.round(product.price * (1 - product.discount / 100)) 
                              : product.price;
                            addToCart({
                              ...product,
                              price: finalPrice,
                              quantity: 1,
                              selectedSize: product.sizes ? product.sizes.split(',')[0].trim() : 'M',
                            });
                          }}
                          className="lg:hidden p-1.5 px-3 rounded bg-brand-brown hover:bg-brand-brown-dark text-white text-[9px] font-bold tracking-widest uppercase flex items-center space-x-1 cursor-pointer transition-colors z-20"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Add</span>
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
