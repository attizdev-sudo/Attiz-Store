'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Plus, Minus, ChevronDown, ChevronLeft, ChevronRight, Share2, Star, CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import type { CartItem, Product } from '@/lib/types';

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

const sortSizes = (sizes: string[]): string[] => {
  const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL'];
  return [...sizes].sort((a, b) => {
    const idxA = order.indexOf(a.toUpperCase().trim());
    const idxB = order.indexOf(b.toUpperCase().trim());
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });
};

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { products, dbLoading } = useStore();

  const product = products.find((p) => p.id === id);
  const relatedProducts = products
    .filter((p) => {
      if (p.id === product?.id) return false;
      const productCats = product?.category_ids || (product?.category_id ? [product.category_id] : []);
      const pCats = p.category_ids || (p.category_id ? [p.category_id] : []);
      return pCats.some((catId) => productCats.includes(catId));
    })
    .slice(0, 4);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };
  const [activeThumbIdx, setActiveThumbIdx] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastClickTime = useRef(0);
  const swipeStartX = useRef<number | null>(null);
  const [accordionOpen, setAccordionOpen] = useState({ description: true, specifications: false, washCare: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    setIsTouchDevice(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveThumbIdx(0);
    setQuantity(1);
    const variants = product?.product_variants || [];
    if (variants.length > 0) {
      const colors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean);
      const sizes = sortSizes(Array.from(new Set(variants.map(v => v.size))).filter(Boolean));
      if (colors.length > 0) setSelectedColor(colors[0]);
      if (sizes.length > 0) setSelectedSize(sizes[0]);
    } else {
      if (product?.sizes) {
        const sizes = sortSizes(product.sizes.split(',').map(s => s.trim()));
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      }
      if (product?.colors) {
        const cols = product.colors.split(',');
        if (cols.length > 0) setSelectedColor(cols[0].trim());
      }
    }
  }, [id, product]);

  const toggleAccordion = (section: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: product?.title,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddToCart = () => {
    if (product && activeVariant) {
      const finalPrice = displayDiscount > 0
        ? Math.round(displayPrice * (1 - displayDiscount / 100))
        : displayPrice;
      const primaryImage = thumbnails[activeThumbIdx]?.url || product.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
      addToCart({
        ...product,
        image: primaryImage,
        price: finalPrice,
        selectedSize,
        selectedColor,
        quantity,
      } as any);
    }
  };

  const handleBuyNow = () => {
    if (product && activeVariant) {
      const finalPrice = displayDiscount > 0
        ? Math.round(displayPrice * (1 - displayDiscount / 100))
        : displayPrice;
      const primaryImage = thumbnails[activeThumbIdx]?.url || product.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';
      addToCart({
        ...product,
        image: primaryImage,
        price: finalPrice,
        selectedSize,
        selectedColor,
        quantity,
      } as any);
      setTimeout(() => setIsCartOpen(true), 200);
    }
  };

  // Thumbnails: Select ALL images of ALL colors safely at the top level
  const thumbnails: Array<{ url: string; color: string }> = [];
  if (product) {
    product.product_variants?.forEach((v) => {
      v.product_variant_images?.forEach((img) => {
        if (img.image_url && !thumbnails.some((t) => t.url === img.image_url)) {
          thumbnails.push({ url: img.image_url, color: v.color });
        }
      });
    });

    // Fallbacks if no variant-specific images are found
    if (thumbnails.length === 0) {
      if (product.image) thumbnails.push({ url: product.image, color: '' });
      if (product.images) {
        product.images.split(',').map((img) => img.trim()).filter(Boolean).forEach((img) => {
          if (!thumbnails.some((t) => t.url === img)) {
            thumbnails.push({ url: img, color: '' });
          }
        });
      }
    }
  }

  const currentImageUrl = thumbnails[activeThumbIdx]?.url || product?.image;

  useEffect(() => {
    if (currentImageUrl) {
      setIsImageLoading(true);
    }
  }, [currentImageUrl]);

  if (dbLoading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-9 h-9 rounded-full border-[3px] border-black border-t-[#E63B2E] animate-spin" />
        <span className="font-['Space_Mono'] text-[10px] font-bold tracking-[0.35em] uppercase text-black/60">Loading product details…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-5">
        <span className="font-['Space_Mono'] text-[10px] font-bold tracking-[0.35em] uppercase text-black/60">Product not found</span>
        <Link href="/" className="px-7 py-3 bg-black text-[#FFCB05] font-['Anton'] text-xs tracking-[0.2em] uppercase border-[3px] border-black shadow-[4px_4px_0_0_#E63B2E] hover:shadow-[2px_2px_0_0_#E63B2E] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Unique sizes and colors from variants
  const colorsArray = product.product_variants
    ? Array.from(new Set(product.product_variants.map((v) => v.color))).filter(Boolean)
    : [];

  const sizesArray = sortSizes(
    product.product_variants
      ? Array.from(new Set(product.product_variants.map((v) => v.size))).filter(Boolean)
      : ['S', 'M', 'L', 'XL', 'XXL']
  );

  // Identify the active variant matching BOTH selectedColor and selectedSize
  const activeVariant = product.product_variants?.find(
    (v) =>
      v.color.toLowerCase() === (selectedColor || '').toLowerCase() &&
      v.size.toLowerCase() === (selectedSize || '').toLowerCase()
  ) || product.product_variants?.[0];

  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;
  const displayPrice = activeVariant ? activeVariant.price : 0;
  const displayDiscount = activeVariant ? activeVariant.discount || 0 : 0;

  const handleThumbnailClick = (idx: number) => {
    setActiveThumbIdx(idx);
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    const thumbColor = thumbnails[idx]?.color;
    if (thumbColor && thumbColor.toLowerCase() !== selectedColor.toLowerCase()) {
      setSelectedColor(thumbColor);
      const colVariants = product.product_variants?.filter(
        (v) => v.color.toLowerCase() === thumbColor.toLowerCase() && v.stock > 0
      ) || [];
      const sortedColSizes = sortSizes(colVariants.map(v => v.size));
      if (sortedColSizes.length > 0) setSelectedSize(sortedColSizes[0]);
    }
  };

  const selectColorAndScroll = (col: string) => {
    setSelectedColor(col);
    const targetIdx = thumbnails.findIndex((t) => t.color.toLowerCase() === col.toLowerCase());
    if (targetIdx !== -1) {
      handleThumbnailClick(targetIdx);
    }
  };

  const goToCard = (delta: number) => {
    if (thumbnails.length === 0) return;
    const next = (activeThumbIdx + delta + thumbnails.length) % thumbnails.length;
    handleThumbnailClick(next);
  };

  // Helper selectors
  const isSizeDisabled = (sz: string) => {
    const variant = product.product_variants?.find(
      (v) =>
        v.color.toLowerCase() === (selectedColor || '').toLowerCase() &&
        v.size.toLowerCase() === sz.toLowerCase()
    );
    return !variant || variant.stock <= 0;
  };

  const isColorDisabled = (col: string) => {
    const colVariants = product.product_variants?.filter(
      (v) => v.color.toLowerCase() === col.toLowerCase()
    ) || [];
    return colVariants.length === 0 || colVariants.every((v) => v.stock <= 0);
  };

  const ZOOM_SCALE = 1.7;
  const LIMIT_FACTOR = (ZOOM_SCALE - 1) / 2;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || isOutOfStock) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !isDragging || isOutOfStock) return;
    const container = e.currentTarget;
    const { width, height } = container.getBoundingClientRect();
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    const limitX = width * LIMIT_FACTOR;
    const limitY = height * LIMIT_FACTOR;
    newX = Math.max(-limitX, Math.min(limitX, newX));
    newY = Math.max(-limitY, Math.min(limitY, newY));

    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isOutOfStock) return;

    // Double tap detection for touch devices
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime.current;
    if (timeDiff < 300) {
      if (isZoomed) {
        setIsZoomed(false);
        setPanOffset({ x: 0, y: 0 });
      } else {
        setIsZoomed(true);
        setPanOffset({ x: 0, y: 0 });
      }
      lastClickTime.current = 0;
      setIsDragging(false);
      swipeStartX.current = null;
      return;
    }
    lastClickTime.current = currentTime;

    if (isZoomed) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStart.current = { x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y };
    } else {
      swipeStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZoomed && isDragging && !isOutOfStock) {
      const touch = e.touches[0];
      const container = e.currentTarget;
      const { width, height } = container.getBoundingClientRect();
      let newX = touch.clientX - dragStart.current.x;
      let newY = touch.clientY - dragStart.current.y;

      const limitX = width * LIMIT_FACTOR;
      const limitY = height * LIMIT_FACTOR;
      newX = Math.max(-limitX, Math.min(limitX, newX));
      newY = Math.max(-limitY, Math.min(limitY, newY));

      setPanOffset({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed && swipeStartX.current !== null && !isOutOfStock) {
      const endX = e.changedTouches[0].clientX;
      const delta = endX - swipeStartX.current;
      if (Math.abs(delta) > 45 && thumbnails.length > 1) {
        goToCard(delta < 0 ? 1 : -1);
      }
    }
    swipeStartX.current = null;
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (isZoomed) {
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setIsZoomed(true);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const getCursorClass = () => {
    if (isOutOfStock) return 'cursor-default';
    if (!isZoomed) return 'cursor-zoom-in';
    return isDragging ? 'cursor-grabbing' : 'cursor-grab';
  };

  // Card-stack transform for each card based on its distance from the active one
  const getCardStyle = (idx: number): React.CSSProperties => {
    const total = thumbnails.length;
    const relative = (idx - activeThumbIdx + total) % total;
    if (relative === 0) {
      return { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', zIndex: 40, opacity: 1 };
    }
    if (relative === 1) {
      return { transform: 'translate(16px, 14px) rotate(4deg) scale(0.965)', zIndex: 30, opacity: 0.95 };
    }
    if (relative === 2) {
      return { transform: 'translate(30px, 26px) rotate(8deg) scale(0.93)', zIndex: 20, opacity: 0.85 };
    }
    return { transform: 'translate(42px, 36px) rotate(11deg) scale(0.9)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-2 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 relative">
      {/* faint halftone dot texture, very subtle */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Hero: sized to fit the initial viewport so the gallery, key info, and CTAs are visible without scrolling */}
        <div className="lg:min-h-[calc(100vh-6rem)] flex flex-col justify-center mb-16 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

            {/* Left: Card-slide Image Gallery */}
            <div className="lg:col-span-6 flex flex-col items-center gap-5 px-2 md:px-8">
              <div className="relative w-full max-w-[420px] aspect-3/4 max-h-[520px]">
                {thumbnails.map((thumb, idx) => {
                  const isFront = idx === activeThumbIdx;
                  return (
                    <div
                      key={idx}
                      className="absolute inset-0 bg-white border-[3px] border-black shadow-[8px_8px_0_0_#111111] overflow-hidden transition-transform duration-400 ease-out"
                      style={getCardStyle(idx)}
                    >
                      {isFront ? (
                        <div
                          className={`relative w-full h-full select-none touch-none ${getCursorClass()}`}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          onDoubleClick={handleDoubleClick}
                        >
                          {displayDiscount > 0 && !isOutOfStock && (
                            <div className="absolute top-3 left-3 z-20 rotate-[-6deg] bg-[#E63B2E] text-white border-2 border-black shadow-[3px_3px_0_0_#111111] px-3 py-1.5 attiz-display text-xs tracking-wider uppercase">
                              {displayDiscount}% Off
                            </div>
                          )}
                          {isImageLoading && (
                            <div className="absolute top-4 right-4 z-20 flex items-center justify-center bg-white rounded-full p-2 border-2 border-black shadow-[2px_2px_0_0_#111111] animate-fade-in">
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-[#E63B2E] animate-spin" />
                            </div>
                          )}
                          <img
                            src={thumb.url || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                            alt={product.title}
                            className={`w-full h-full object-cover object-center pointer-events-none select-none transition-all duration-250 ease-out ${isDragging ? '' : 'transition-transform'}`}
                            style={{
                              transform: isZoomed
                                ? `translate(${panOffset.x}px, ${panOffset.y}px) scale(${ZOOM_SCALE})`
                                : 'translate(0px, 0px) scale(1)',
                            }}
                            onLoad={() => setIsImageLoading(false)}
                            draggable="false"
                          />
                          {isOutOfStock ? (
                            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                              <span className="px-6 py-2.5 border-4 border-[#E63B2E] text-[#E63B2E] bg-white/90 attiz-display text-sm tracking-[0.2em] uppercase rotate-[-8deg]">
                                Out of Stock
                              </span>
                            </div>
                          ) : (
                            <div className="absolute bottom-3 right-3 bg-black text-white px-2.5 py-1.5 attiz-mono text-[9px] font-bold tracking-wider uppercase select-none opacity-80 pointer-events-none border border-black hidden sm:block">
                              {isZoomed
                                ? (isTouchDevice ? 'Drag to Pan · Double Tap to Zoom Out' : 'Drag to Pan · Double Click to Zoom Out')
                                : (isTouchDevice ? 'Double Tap to Zoom · Swipe for More' : 'Double Click to Zoom')}
                            </div>
                          )}
                          {thumbnails.length > 1 && (
                            <div className="absolute bottom-3 left-3 z-20 bg-black text-[#FFCB05] attiz-mono text-[10px] font-bold px-2 py-1 -skew-x-6 border-2 border-black select-none">
                              <span className="inline-block skew-x-6">{String(activeThumbIdx + 1).padStart(2, '0')} / {String(thumbnails.length).padStart(2, '0')}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <img
                          src={thumb.url || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                          alt=""
                          className="w-full h-full object-cover object-center"
                          draggable="false"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Nav arrows */}
                {thumbnails.length > 1 && (
                  <>
                    <div className="absolute z-50 left-[-14px] top-1/2 -translate-y-1/2">
                      <button
                        onClick={() => goToCard(-1)}
                        aria-label="Previous image"
                        className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:bg-[#FFCB05] hover:shadow-[1px_1px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 text-black" />
                      </button>
                    </div>
                    <div className="absolute z-50 right-[-14px] top-1/2 -translate-y-1/2">
                      <button
                        onClick={() => goToCard(1)}
                        aria-label="Next image"
                        className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:bg-[#FFCB05] hover:shadow-[1px_1px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Dot / tab indicators */}
              {thumbnails.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap justify-center pt-5">
                  {thumbnails.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleThumbnailClick(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`h-2.5 border-2 border-black transition-all cursor-pointer ${activeThumbIdx === idx ? 'w-7 bg-[#E63B2E]' : 'w-2.5 bg-white hover:bg-[#FFCB05]'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-2 py-0.5 -skew-x-6 border-2 border-black">
                  <span className="skew-x-6">Attiz</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-7 h-7 flex items-center justify-center border-2 border-black text-black hover:bg-[#FFCB05] transition-colors cursor-pointer"
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#E63B2E] stroke-[#E63B2E]' : 'stroke-black'}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-7 h-7 flex items-center justify-center border-2 border-black text-black hover:bg-[#FFCB05] transition-colors cursor-pointer"
                    title="Share Product"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h1 className="attiz-display text-2xl md:text-[1.85rem] leading-[0.99] tracking-[0.01rem] uppercase mb-2 block text-black">{product.title}</h1>
              <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase mb-3 block">SKU: {activeVariant?.sku || `ATZTS-${product.id.slice(0, 5).toUpperCase()}`}</span>

              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                {displayDiscount > 0 ? (
                  <>
                    <span className="text-white attiz-mono font-bold text-[10px] flex items-center gap-1 bg-[#E63B2E] border-2 border-black px-1.5 py-0.5 shrink-0 rotate-[-2deg]">
                      ↓{displayDiscount}%
                    </span>
                    <span className="attiz-body text-xs text-black/35 line-through shrink-0">
                      ₹{parseFloat(String(displayPrice)).toLocaleString('en-IN')}
                    </span>
                    <span className="relative inline-block">
                      <span className="absolute inset-x-0 bottom-0.5 h-[45%] bg-[#FFCB05] -rotate-1 -z-0" />
                      <span className="relative z-10 attiz-display text-xl text-black px-0.5">
                        ₹{Math.round(displayPrice * (1 - displayDiscount / 100)).toLocaleString('en-IN')}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="relative inline-block">
                    <span className="absolute inset-x-0 bottom-0.5 h-[45%] bg-[#FFCB05] -rotate-1 -z-0" />
                    <span className="relative z-10 attiz-display text-xl text-black px-0.5">
                      ₹{parseFloat(String(displayPrice)).toLocaleString('en-IN')}
                    </span>
                  </span>
                )}
              </div>

              {isOutOfStock && (
                <span className="inline-flex items-center space-x-1.5 attiz-mono text-[9px] font-bold text-white tracking-wider uppercase mb-4 bg-[#E63B2E] border-2 border-black px-2.5 py-1 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Out of Stock</span>
                </span>
              )}

              {/* Sizes */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="attiz-mono text-[9px] font-bold tracking-widest text-black/50 uppercase">Size Options</span>
                  <button onClick={() => setIsSizeChartOpen(true)} className="attiz-mono text-[9px] font-bold text-[#E63B2E] hover:text-black tracking-wider underline uppercase cursor-pointer">Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesArray.map((sz) => {
                    const isDisabled = isSizeDisabled(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        disabled={isDisabled}
                        className={`w-10 h-9 border-2 attiz-mono text-[10px] font-bold tracking-wider transition-all ${isDisabled
                          ? 'border-black/15 text-black/25 bg-black/[0.02] cursor-not-allowed line-through'
                          : selectedSize === sz
                            ? 'border-black bg-black text-[#FFCB05] shadow-[3px_3px_0_0_#E63B2E] -translate-x-[1px] -translate-y-[1px]'
                            : 'border-black/70 text-black hover:border-black bg-white cursor-pointer'
                          }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              {colorsArray.length > 0 && (
                <div className="mb-4">
                  <span className="block attiz-mono text-[9px] font-bold tracking-widest text-black/50 uppercase mb-1.5">Color Options</span>
                  <div className="flex flex-wrap gap-2">
                    {colorsArray.map((col) => {
                      const isDisabled = isColorDisabled(col);
                      return (
                        <button
                          key={col}
                          onClick={() => {
                            selectColorAndScroll(col);
                            const colVariants = product.product_variants?.filter(
                              (v) => v.color.toLowerCase() === col.toLowerCase() && v.stock > 0
                            ) || [];
                            const sortedColSizes = sortSizes(colVariants.map(v => v.size));
                            if (sortedColSizes.length > 0) setSelectedSize(sortedColSizes[0]);
                          }}
                          disabled={isDisabled}
                          className={`px-3 py-1.5 border-2 attiz-mono text-[10px] font-bold tracking-wider transition-all cursor-pointer ${isDisabled
                            ? 'border-black/15 text-black/25 bg-black/[0.02] cursor-not-allowed line-through'
                            : selectedColor === col
                              ? 'border-black bg-black text-[#FFCB05] shadow-[3px_3px_0_0_#E63B2E] -translate-x-[1px] -translate-y-[1px]'
                              : 'border-black/70 text-black hover:border-black bg-white'
                            }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-4">
                <span className="block attiz-mono text-[9px] font-bold tracking-widest text-black/50 uppercase mb-1.5">Quantity Selector</span>
                <div className={`flex items-center border-2 bg-white w-24 ${isOutOfStock ? 'border-black/15 opacity-50' : 'border-black'}`}>
                  <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className={`p-1.5 px-2 text-black hover:bg-[#FFCB05] transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Minus className="w-3 h-3" /></button>
                  <span className="attiz-mono text-[11px] font-bold px-2 text-black select-none grow text-center">{isOutOfStock ? 0 : quantity}</span>
                  <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => prev < (activeVariant?.stock || 0) ? prev + 1 : prev)} className={`p-1.5 px-2 text-black hover:bg-[#FFCB05] transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Plus className="w-3 h-3" /></button>
                </div>
                {!isOutOfStock && quantity >= (activeVariant?.stock || 0) && (
                  <span className="attiz-mono text-[9px] text-[#E63B2E] font-bold tracking-wider mt-1 block">Maximum available stock reached.</span>
                )}
              </div>

              {/* Action buttons — sticky on desktop so they stay in view; fixed bar on mobile */}
              <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t-[3px] border-black p-4 z-40 flex gap-3 lg:sticky lg:bottom-6 lg:left-auto lg:right-auto lg:bg-transparent lg:border-t-0 lg:backdrop-blur-none lg:p-0 lg:flex-col lg:gap-0 lg:space-y-2.5">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 lg:w-full py-2.5 lg:py-3 border-[3px] attiz-display text-[11px] lg:text-xs tracking-[0.15em] uppercase transition-all ${isOutOfStock
                    ? 'border-black/15 text-black/30 bg-black/[0.02] cursor-not-allowed'
                    : 'border-black text-black bg-white shadow-[2px_2px_0_0_#111111] lg:shadow-[3px_3px_0_0_#111111] hover:bg-black hover:text-[#FFCB05] hover:shadow-[1.5px_1.5px_0_0_#111111] hover:translate-x-[1.5px] hover:translate-y-[1.5px] cursor-pointer'
                    }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`flex-1 lg:w-full py-2.5 lg:py-3 border-[3px] border-black attiz-display text-[11px] lg:text-xs tracking-[0.15em] uppercase transition-all ${isOutOfStock
                    ? 'bg-black/[0.04] text-black/30 cursor-not-allowed'
                    : 'bg-[#E63B2E] text-white shadow-[2px_2px_0_0_#111111] lg:shadow-[3px_3px_0_0_#111111] hover:bg-black hover:shadow-[1.5px_1.5px_0_0_#111111] hover:translate-x-[1.5px] hover:translate-y-[1.5px] cursor-pointer'
                    }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Buy It Now'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Product Details Info Section (Static 3-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t-[3px] border-b-[3px] border-black my-16">
          <div className="space-y-3">
            <h3 className="attiz-display text-sm tracking-wider text-black uppercase relative inline-block">
              Style Description
              <span className="absolute -bottom-1.5 left-0 h-1 w-8 bg-[#E63B2E]" />
            </h3>
            <p className="attiz-body text-[13px] text-black/65 tracking-wide leading-relaxed text-justify pt-1">
              {product.description || 'Exquisitely tailored garment featuring premium organic fibers.'}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="attiz-display text-sm tracking-wider text-black uppercase relative inline-block">
              Specifications
              <span className="absolute -bottom-1.5 left-0 h-1 w-8 bg-[#FFCB05]" />
            </h3>
            <p className="attiz-body text-[13px] text-black/65 tracking-wide leading-relaxed text-justify whitespace-pre-line pt-1">
              {product.specifications || 'Premium tailored garment with reinforced stitching.'}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="attiz-display text-sm tracking-wider text-black uppercase relative inline-block">
              Wash Care Instructions
              <span className="absolute -bottom-1.5 left-0 h-1 w-8 bg-black" />
            </h3>
            <p className="attiz-body text-[13px] text-black/65 tracking-wide leading-relaxed text-justify pt-1">
              {product.wash_care || 'Machine wash cold gentle cycle. Do not bleach.'}
            </p>
          </div>
        </div>

        {/* Reviews */}
        <section className="py-16 border-t-[3px] border-black">
          <h3 className="attiz-display text-2xl text-black text-center uppercase mb-10 tracking-wide">Customer Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border-[3px] border-black shadow-[8px_8px_0_0_#111111] p-8 sm:p-12 mb-14">
            <div className="md:col-span-4 text-center border-r-0 md:border-r-2 md:border-black/10 py-4 flex flex-col justify-center">
              <div className="flex items-center justify-center space-x-1 mb-2 text-[#FFCB05]">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current stroke-black" />)}</div>
              <span className="block attiz-display text-2xl text-black">5.00 out of 5</span>
              <span className="block attiz-mono text-[10px] text-black/45 font-bold tracking-widest uppercase mt-1.5">Based on 3 reviews</span>
            </div>
            <div className="md:col-span-5 px-0 md:px-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center attiz-mono text-xs text-black/65 font-bold">
                  <span className="w-3 select-none">{stars}</span>
                  <Star className="w-3.5 h-3.5 text-[#FFCB05] fill-current stroke-black ml-0.5 mr-2 shrink-0" />
                  <div className="grow h-2.5 bg-black/[0.06] border border-black/10 overflow-hidden">
                    <div className="h-full bg-[#E63B2E] transition-all duration-500" style={{ width: `${stars === 5 ? 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-[10px] text-black/45 font-bold ml-3">{stars === 5 ? 3 : 0}</span>
                </div>
              ))}
            </div>
            <div className="md:col-span-3 flex justify-center py-4">
              <button className="px-8 py-3.5 bg-black hover:bg-[#E63B2E] text-white attiz-display text-xs tracking-widest uppercase border-2 border-black shadow-[3px_3px_0_0_#FFCB05] hover:shadow-[1px_1px_0_0_#FFCB05] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                Write a Review
              </button>
            </div>
          </div>
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#111111] p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-1 text-[#FFCB05] mb-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current stroke-black" />)}</div>
                <span className="block attiz-body text-xs font-bold text-black">Musthafa p. p</span>
                <span className="inline-flex items-center space-x-1 attiz-mono text-[9px] font-bold text-black uppercase tracking-wider mt-1 bg-[#FFCB05] px-1.5 py-0.5 border border-black">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Buyer</span>
                </span>
              </div>
              <span className="attiz-mono text-[10px] text-black/45 font-bold">05/20/2026</span>
            </div>
            <h4 className="attiz-display text-sm text-black mb-1.5 tracking-wide">Super</h4>
            <p className="attiz-body text-[13px] text-black/70 tracking-wide leading-relaxed">Super product. Worth for money. The fit is absolute elegance, and the fabric is incredibly soft.</p>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-black/10">
            <h3 className="attiz-display text-2xl text-black/90 text-center uppercase mb-12 tracking-widest font-semibold">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {relatedProducts.map((prod) => {
                const isLiked = wishlist[prod.id] || false;
                const images = getProductImages(prod);
                const nextImage = images[1];
                const finalPrice = prod.discount && prod.discount > 0
                  ? Math.round((prod.price || 0) * (1 - (prod.discount || 0) / 100))
                  : (prod.price || 0);

                const handleQuickAdd = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({
                    ...prod,
                    price: finalPrice,
                    quantity: 1,
                    selectedSize: prod.sizes ? prod.sizes.split(',')[0].trim() : 'M',
                  } as any);
                };

                return (
                  <div key={prod.id} className="group relative flex flex-col justify-between">
                    <Link href={`/product/${prod.id}`} className="flex flex-col h-full relative">
                      
                      {/* Media container */}
                      <div className="relative aspect-[3/4] bg-[#F0EDE6] overflow-hidden transition-all duration-500 ease-out group-hover:shadow-xl group-hover:shadow-black/5">
                        
                        {/* Product Base Image */}
                        <Image
                          src={prod.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                          alt={prod.title}
                          fill
                          className={`object-cover object-center transition-all duration-700 ease-out scale-100 group-hover:scale-105 ${nextImage ? 'group-hover:opacity-0' : ''}`}
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />

                        {/* Product Alternative Hover Image */}
                        {nextImage && (
                          <Image
                            src={nextImage}
                            alt={`${prod.title} Alternate`}
                            fill
                            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-102 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 25vw"
                          />
                        )}

                        {/* Floating Discount Badge */}
                        {prod.discount && prod.discount > 0 && (
                          <div className="absolute top-4 left-4 z-20 bg-black text-white px-2.5 py-1 attiz-mono text-[9px] font-bold tracking-widest uppercase">
                            Save {prod.discount}%
                          </div>
                        )}

                        {/* Wishlist Button Core */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod.id); }}
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
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="attiz-mono text-[9px] text-black/40 uppercase tracking-widest font-semibold">
                              {prod.sizes ? `Sizes: ${prod.sizes}` : 'Standard Fit'}
                            </span>
                            <span className="w-1 h-1 bg-black/20 rounded-full group-hover:bg-[#E63B2E] transition-colors" />
                          </div>
                          <h4 className="attiz-body text-[14px] font-medium text-black/90 group-hover:text-black transition-colors line-clamp-2 leading-snug">
                            {prod.title}
                          </h4>
                        </div>

                        <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-black/5">
                          <div className="flex items-baseline gap-2">
                            {prod.discount && prod.discount > 0 ? (
                              <>
                                <span className="attiz-mono text-[15px] font-bold text-[#E63B2E]">
                                  ₹{finalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="attiz-body text-xs text-black/35 line-through font-light">
                                  ₹{parseFloat(String(prod.price || 0)).toLocaleString('en-IN')}
                                </span>
                              </>
                            ) : (
                              <span className="attiz-mono text-[15px] font-bold text-black">
                                ₹{parseFloat(String(prod.price || 0)).toLocaleString('en-IN')}
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
          </section>
        )}

        {/* Size chart lightbox */}
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white rounded-2xl border border-black/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] max-w-xl w-full p-6 sm:p-8 animate-scale-in">
              <button 
                onClick={() => setIsSizeChartOpen(false)} 
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-black/60 hover:text-black flex items-center justify-center transition-all duration-200 cursor-pointer font-semibold text-sm"
                title="Close"
              >
                ✕
              </button>
              <div className="mb-5">
                <span className="block attiz-mono text-[9px] font-bold text-black/45 tracking-widest uppercase mb-0.5">Sizing Reference</span>
                <h3 className="attiz-display text-xl text-black/90 uppercase tracking-wider">Size Chart & Measurements</h3>
              </div>
              <div className="relative aspect-4/3 bg-[#FAF8F5] overflow-hidden rounded-xl border border-black/5">
                <Image
                  src={product.size_chart || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}
                  alt="Size Chart"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}