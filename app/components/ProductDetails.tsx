'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Plus, Minus, ChevronDown, ChevronLeft, ChevronRight, Share2, ShoppingBag, ArrowRight, X, Ruler, Loader2, Truck, AlertTriangle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
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

function ProductDetailsInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialColorParam = searchParams.get('color');
  const { addToCart, startBuyNow, setIsCartOpen } = useCart();
  const { products, dbLoading } = useStore();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const product = products.find((p) => p.id === id);

  // Smart, contextual "You May Also Like" recommendation engine
  const relatedProducts = React.useMemo(() => {
    if (!product || !products || products.length <= 1) return [];

    const otherProducts = products.filter((p) => p.id !== product.id);
    const currentTitleWords = product.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const productCatIds = product.category_ids || (product.category_id ? [product.category_id] : []);

    const scoredProducts = otherProducts.map((p) => {
      let score = 0;
      const pCatIds = p.category_ids || (p.category_id ? [p.category_id] : []);
      const catMatches = pCatIds.filter((c) => productCatIds.includes(c)).length;
      score += catMatches * 5;

      const pTitle = p.title.toLowerCase();
      currentTitleWords.forEach((word) => {
        if (pTitle.includes(word)) score += 3;
      });

      // Deterministic seed based on product.id & p.id so each product page receives a unique, varied selection
      let seed = 0;
      const seedStr = (product.id || '') + (p.id || '');
      for (let i = 0; i < seedStr.length; i++) {
        seed = (seed << 5) - seed + seedStr.charCodeAt(i);
        seed |= 0;
      }
      score += Math.abs(seed) % 10;

      return { product: p, score };
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts.slice(0, 4).map((sp) => sp.product);
  }, [product, products]);

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [isNavigatingBuyNow, setIsNavigatingBuyNow] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeThumbIdx, setActiveThumbIdx] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastClickTime = useRef(0);
  const swipeStartX = useRef<number | null>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === 'left' ? -120 : 120;
      thumbnailScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
    goToCard(direction === 'left' ? -1 : 1);
  };
  const [accordionOpen, setAccordionOpen] = useState({ description: true, specifications: false, washCare: false });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic Delivery Date Range Calculation (Current Date + 4 days to Current Date + 8 days)
  const deliveryRange = React.useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 4);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 8);

    const formatDate = (d: Date) => `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  }, []);

  useEffect(() => {
    setIsTouchDevice(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsNavigatingBuyNow(false);
    setSelectionError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveThumbIdx(0);
    setQuantity(1);
    const variants = product?.product_variants || [];
    if (variants.length > 0) {
      const colors = Array.from(new Set(variants.map(v => v.color))).filter(Boolean);

      const matchedColor = initialColorParam && colors.some(c => c.toLowerCase() === initialColorParam.toLowerCase())
        ? colors.find(c => c.toLowerCase() === initialColorParam.toLowerCase()) || ''
        : '';

      setSelectedColor(matchedColor || colors[0] || '');
      setSelectedSize('');
    } else {
      if (product?.colors) {
        const cols = product.colors.split(',').map(c => c.trim());
        const matchedColor = initialColorParam && cols.some(c => c.toLowerCase() === initialColorParam.toLowerCase())
          ? cols.find(c => c.toLowerCase() === initialColorParam.toLowerCase()) || ''
          : '';
        setSelectedColor(matchedColor || cols[0] || '');
      } else {
        setSelectedColor('');
      }
      setSelectedSize('');
    }
  }, [id, product, initialColorParam]);

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

  const validateSelection = (): boolean => {
    const hasSizes = sizesArray.length > 0;

    if (hasSizes && !selectedSize) {
      setSelectionError('Please select a size to proceed');
      return false;
    }

    setSelectionError(null);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    const targetVariant = exactVariant || activeVariant;
    if (product && targetVariant) {
      const activeGst = targetVariant.gst_rate || (product as any).gst_rate || 0;
      const taxablePrice = Math.max(0, displayPrice * (1 - displayDiscount / 100));
      const finalPrice = Math.round(taxablePrice * (1 + activeGst / 100));

      const variantImage = targetVariant.product_variant_images?.[0]?.image_url
        || thumbnails.find((t) => t.color && selectedColor && t.color.toLowerCase() === selectedColor.toLowerCase())?.url
        || thumbnails[activeThumbIdx]?.url
        || product.image
        || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

      addToCart({
        ...product,
        product_id: product.id,
        variant_id: targetVariant.id,
        sku: targetVariant.sku,
        image: variantImage,
        price: finalPrice,
        discount: displayDiscount,
        original_mrp: displayPrice,
        gst_rate: activeGst,
        selectedSize,
        selectedColor,
        color: selectedColor,
        quantity,
      } as any, !isMobile);

      setIsAddedToast(true);
      setTimeout(() => setIsAddedToast(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    const targetVariant = exactVariant || activeVariant;
    if (product && targetVariant) {
      setIsNavigatingBuyNow(true);
      const activeGst = targetVariant.gst_rate || (product as any).gst_rate || 0;
      const taxablePrice = Math.max(0, displayPrice * (1 - displayDiscount / 100));
      const finalPrice = Math.round(taxablePrice * (1 + activeGst / 100));

      const variantImage = targetVariant.product_variant_images?.[0]?.image_url
        || thumbnails.find((t) => t.color && selectedColor && t.color.toLowerCase() === selectedColor.toLowerCase())?.url
        || thumbnails[activeThumbIdx]?.url
        || product.image
        || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

      startBuyNow({
        ...product,
        product_id: product.id,
        variant_id: targetVariant.id,
        sku: targetVariant.sku,
        image: variantImage,
        price: finalPrice,
        discount: displayDiscount,
        original_mrp: displayPrice,
        gst_rate: activeGst,
        selectedSize,
        selectedColor,
        color: selectedColor,
        quantity,
      } as any);
      setIsCartOpen(false);
      if (!user) {
        router.push('/login?redirect=/checkout');
      } else {
        router.push('/checkout');
      }
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
      // If the image is cached, DOM complete status changes immediately.
      // A small timeout allows the browser to update status before checking.
      const timer = setTimeout(() => {
        if (mainImageRef.current && mainImageRef.current.complete) {
          setIsImageLoading(false);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentImageUrl]);

  // Synchronize active thumbnail index when selectedColor changes
  useEffect(() => {
    if (selectedColor && thumbnails && thumbnails.length > 0) {
      const currentThumb = thumbnails[activeThumbIdx];
      if (!currentThumb || !currentThumb.color || currentThumb.color.toLowerCase() !== selectedColor.toLowerCase()) {
        const targetIdx = thumbnails.findIndex((t) => t.color && t.color.toLowerCase() === selectedColor.toLowerCase());
        if (targetIdx !== -1) {
          setActiveThumbIdx(targetIdx);
        }
      }
    }
  }, [selectedColor, thumbnails, activeThumbIdx]);

  // Auto-scroll active thumbnail into view when activeThumbIdx changes
  useEffect(() => {
    if (thumbnailScrollRef.current) {
      const activeThumbElem = thumbnailScrollRef.current.children[activeThumbIdx] as HTMLElement;
      if (activeThumbElem) {
        activeThumbElem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeThumbIdx]);


  if (dbLoading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-9 h-9 rounded-full border-[3px] border-black border-t-[#E63B2E] animate-spin" />
        <span className="font-['Space_Mono'] text-[10px] font-bold tracking-[0.35em] uppercase text-black/85">Loading product details…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-5">
        <span className="font-['Space_Mono'] text-[10px] font-bold tracking-[0.35em] uppercase text-black/85">Product not found</span>
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

  // Identify the exact variant matching BOTH selectedColor and selectedSize (if selected)
  const exactVariant = product.product_variants?.find(
    (v) =>
      (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()) &&
      (!selectedSize || v.size.toLowerCase() === selectedSize.toLowerCase())
  );

  const activeVariant = exactVariant || product.product_variants?.[0];

  const isSelectionComplete =
    (colorsArray.length === 0 || Boolean(selectedColor)) &&
    (sizesArray.length === 0 || Boolean(selectedSize));

  const isOutOfStock = isSelectionComplete
    ? (!exactVariant || exactVariant.stock <= 0)
    : (product.product_variants ? product.product_variants.every((v) => v.stock <= 0) : false);

  const displayPrice = (exactVariant ? exactVariant.price : undefined) ?? product.price ?? product.product_variants?.[0]?.price ?? 0;
  const displayDiscount = (exactVariant ? exactVariant.discount : undefined) ?? product.discount ?? product.product_variants?.[0]?.discount ?? 0;

  const handleThumbnailClick = (idx: number) => {
    setActiveThumbIdx(idx);
    setIsZoomed(false);
    setPanOffset({ x: 0, y: 0 });
    const thumbColor = thumbnails[idx]?.color;
    if (thumbColor && thumbColor.toLowerCase() !== selectedColor.toLowerCase()) {
      setSelectedColor(thumbColor);
      setSelectionError(null);
    }
  };

  const selectColorAndScroll = (col: string) => {
    setSelectedColor(col);
    setSelectionError(null);
    const targetIdx = thumbnails.findIndex((t) => t.color.toLowerCase() === col.toLowerCase());
    if (targetIdx !== -1) {
      setActiveThumbIdx(targetIdx);
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const goToCard = (delta: number) => {
    if (thumbnails.length === 0) return;
    const next = (activeThumbIdx + delta + thumbnails.length) % thumbnails.length;
    handleThumbnailClick(next);
  };

  // Helper selectors
  const isSizeDisabled = (sz: string) => {
    const matchingVariants = product.product_variants?.filter(
      (v) =>
        (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()) &&
        v.size.toLowerCase() === sz.toLowerCase()
    ) || [];
    return matchingVariants.length === 0 || matchingVariants.every((v) => v.stock <= 0);
  };

  const getColorImage = (col: string) => {
    const thumb = thumbnails.find((t) => t.color.toLowerCase() === col.toLowerCase());
    return thumb ? thumb.url : null;
  };

  const isColorDisabled = (col: string) => {
    const matchingVariants = product.product_variants?.filter(
      (v) =>
        v.color.toLowerCase() === col.toLowerCase() &&
        (!selectedSize || v.size.toLowerCase() === selectedSize.toLowerCase())
    ) || [];
    return matchingVariants.length === 0 || matchingVariants.every((v) => v.stock <= 0);
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
    if (timeDiff < 100) {
      e.preventDefault(); // Prevents synthetic mouse/dblclick events
      if (isZoomed) {
        setIsZoomed(false);
        setPanOffset({ x: 0, y: 0 });
      } else {
        const touch = e.touches[0];
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const touchX = touch.clientX - rect.left - rect.width / 2;
        const touchY = touch.clientY - rect.top - rect.height / 2;

        const limitX = rect.width * LIMIT_FACTOR;
        const limitY = rect.height * LIMIT_FACTOR;
        const targetX = Math.max(-limitX, Math.min(limitX, -touchX * (ZOOM_SCALE - 1)));
        const targetY = Math.max(-limitY, Math.min(limitY, -touchY * (ZOOM_SCALE - 1)));

        setIsZoomed(true);
        setPanOffset({ x: targetX, y: targetY });
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

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (isZoomed) {
      setIsZoomed(false);
      setPanOffset({ x: 0, y: 0 });
    } else {
      const container = e.currentTarget;
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;

      const limitX = rect.width * LIMIT_FACTOR;
      const limitY = rect.height * LIMIT_FACTOR;
      const targetX = Math.max(-limitX, Math.min(limitX, -clickX * (ZOOM_SCALE - 1)));
      const targetY = Math.max(-limitY, Math.min(limitY, -clickY * (ZOOM_SCALE - 1)));

      setIsZoomed(true);
      setPanOffset({ x: targetX, y: targetY });
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

    if (isMobile) {
      if (relative === 0) {
        return { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', zIndex: 40, opacity: 1 };
      }
      if (relative === 1) {
        return { transform: 'translate(0px, 8px) rotate(1.5deg) scale(0.97)', zIndex: 30, opacity: 0.95 };
      }
      if (relative === 2) {
        return { transform: 'translate(0px, 16px) rotate(3deg) scale(0.94)', zIndex: 20, opacity: 0.85 };
      }
      return { transform: 'translate(0px, 24px) rotate(4deg) scale(0.91)', zIndex: 10, opacity: 0, pointerEvents: 'none' };
    }

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
    <div className="min-h-screen bg-[#FAF8F5] pt-2 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
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
                            ref={mainImageRef}
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
                    <div className="absolute z-50 left-1 sm:left-[-14px] top-1/2 -translate-y-1/2">
                      <button
                        onClick={() => goToCard(-1)}
                        aria-label="Previous image"
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:bg-[#FFCB05] hover:shadow-[1px_1px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 text-black" />
                      </button>
                    </div>
                    <div className="absolute z-50 right-1 sm:right-[-14px] top-1/2 -translate-y-1/2">
                      <button
                        onClick={() => goToCard(1)}
                        aria-label="Next image"
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:bg-[#FFCB05] hover:shadow-[1px_1px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Small-sized product image thumbnails list per color */}
              {thumbnails.length > 1 && (
                <div className="w-full max-w-[420px] pt-4 pb-1">
                  <div
                    ref={thumbnailScrollRef}
                    className="flex items-center gap-3 overflow-x-auto py-2.5 px-1 scrollbar-thin justify-start"
                  >
                    {thumbnails.map((thumb, idx) => {
                      const isActive = activeThumbIdx === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            handleThumbnailClick(idx);
                            if (thumb.color && thumb.color !== selectedColor) {
                              setSelectedColor(thumb.color);
                            }
                          }}
                          aria-label={`View ${thumb.color ? `${thumb.color} image` : `image ${idx + 1}`}`}
                          className={`relative w-14 h-16 sm:w-16 sm:h-20 bg-white shrink-0 transition-all cursor-pointer overflow-hidden ${isActive
                              ? 'border-2 border-black opacity-100'
                              : 'border border-black/25 opacity-60 hover:opacity-100 hover:border-black'
                            }`}
                        >
                          {/* Small Image Thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb.url}
                            alt={thumb.color || `Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover object-center"
                          />

                          {/* Sleek Active Indicator: Red Bottom Accent Bar */}
                          {isActive && (
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-[#E63B2E]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
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
                    onClick={() => product && toggleWishlist(product)}
                    className="w-7 h-7 flex items-center justify-center border-2 border-black text-black hover:bg-[#FFCB05] transition-colors cursor-pointer"
                    title={product && checkIsWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${product && checkIsWishlisted(product.id) ? 'fill-[#E63B2E] stroke-[#E63B2E]' : 'stroke-black'}`} />
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
              <span className="attiz-mono text-[9px] font-bold text-black/85 tracking-widest uppercase mb-3 block">SKU: {activeVariant?.sku || `ATZTS-${product.id.slice(0, 5).toUpperCase()}`}</span>

              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                {(() => {
                  const activeGst = activeVariant?.gst_rate || 0;
                  const taxableDisplay = Math.max(0, displayPrice * (1 - displayDiscount / 100));
                  const finalDisplayPrice = Math.round(taxableDisplay * (1 + activeGst / 100));
                  const mrpInclusiveGst = Math.round(displayPrice * (1 + activeGst / 100));

                  if (displayDiscount > 0) {
                    return (
                      <>
                        <span className="text-white attiz-mono font-bold text-[10px] flex items-center gap-1 bg-[#E63B2E] border-2 border-black px-1.5 py-0.5 shrink-0 rotate-[-2deg]">
                          ↓{displayDiscount}%
                        </span>
                        <span className="attiz-body text-xs text-black/85 line-through shrink-0">
                          ₹{mrpInclusiveGst.toLocaleString('en-IN')}
                        </span>
                        <span className="relative inline-block">
                          <span className="absolute inset-x-0 bottom-0.5 h-[45%] bg-[#FFCB05] -rotate-1 -z-0" />
                          <span className="relative z-10 attiz-display text-xl text-black px-0.5">
                            ₹{finalDisplayPrice.toLocaleString('en-IN')}
                          </span>
                        </span>
                      </>
                    );
                  }

                  return (
                    <span className="relative inline-block">
                      <span className="absolute inset-x-0 bottom-0.5 h-[45%] bg-[#FFCB05] -rotate-1 -z-0" />
                      <span className="relative z-10 attiz-display text-xl text-black px-0.5">
                        ₹{finalDisplayPrice.toLocaleString('en-IN')}
                      </span>
                    </span>
                  );
                })()}
              </div>

              {isOutOfStock && (
                <span className="inline-flex items-center space-x-1.5 attiz-mono text-[9px] font-bold text-white tracking-wider uppercase mb-4 bg-[#E63B2E] border-2 border-black px-2.5 py-1 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Out of Stock</span>
                </span>
              )}

              {/* Selection Notification Banner */}
              {selectionError && (
                <div className="mb-4 p-3 bg-[#E63B2E] text-white border-2 border-black shadow-[3px_3px_0_0_#111111] attiz-mono text-xs font-bold tracking-wider uppercase flex items-center justify-between animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#FFCB05] shrink-0" />
                    <span>{selectionError}</span>
                  </div>
                  <button onClick={() => setSelectionError(null)} className="text-white hover:text-[#FFCB05] cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sizes */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`attiz-mono text-[9px] font-bold tracking-widest uppercase ${selectionError && !selectedSize ? 'text-[#E63B2E] font-black' : 'text-black/85'}`}>
                    Size Options {selectionError && !selectedSize && '(REQUIRED)'}
                  </span>
                  <button onClick={() => setIsSizeChartOpen(true)} className="attiz-mono text-[9px] font-bold text-[#E63B2E] hover:text-black tracking-wider underline uppercase cursor-pointer">Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesArray.map((sz) => {
                    const isDisabled = isSizeDisabled(sz);
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          setSelectedSize(sz);
                          setSelectionError(null);
                        }}
                        disabled={isDisabled}
                        className={`w-10 h-9 border-2 attiz-mono text-[10px] font-bold tracking-wider transition-all ${isDisabled
                          ? 'border-black/15 text-black/25 bg-black/[0.02] cursor-not-allowed line-through'
                          : isSelected
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
                  <span className="block attiz-mono text-[9px] font-bold tracking-widest uppercase mb-1.5 text-black/85">
                    Color: <span className="text-black font-extrabold">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-4">
                    {colorsArray.map((col) => {
                      const isDisabled = isColorDisabled(col);
                      const colorImageUrl = getColorImage(col);
                      const isSelected = selectedColor.toLowerCase() === col.toLowerCase();
                      return (
                        <button
                          key={col}
                          onClick={() => {
                            selectColorAndScroll(col);
                          }}
                          disabled={isDisabled}
                          title={col}
                          className={`group/color relative w-20 h-25 border-2 overflow-hidden transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer ${isDisabled
                            ? 'border-black/15 opacity-40 cursor-not-allowed'
                            : isSelected
                              ? 'border-black bg-white shadow-[3px_3px_0_0_#E63B2E]'
                              : 'border-black/70 hover:border-black bg-white'
                            }`}
                        >
                          {colorImageUrl ? (
                            <Image
                              src={colorImageUrl}
                              alt={col}
                              fill
                              className="object-cover object-center"
                              sizes="128px"
                            />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center text-[9px] font-bold uppercase p-0.5 text-center leading-none text-black">
                              {col}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector & CTAs */}
              <div className="space-y-4 mb-6">
                <div>
                  <span className="block attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase mb-1.5">Quantity Selector</span>
                  <div className={`flex items-center border-2 bg-white w-28 ${isOutOfStock ? 'border-black/15 opacity-50' : 'border-black'}`}>
                    <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className={`p-2 text-black hover:bg-[#FFCB05] transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Minus className="w-3.5 h-3.5" /></button>
                    <span className="attiz-mono text-xs font-bold px-2 text-black select-none grow text-center">{isOutOfStock ? 0 : quantity}</span>
                    <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => prev < (activeVariant?.stock || 0) ? prev + 1 : prev)} className={`p-2 text-black hover:bg-[#FFCB05] transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  {!isOutOfStock && quantity >= (activeVariant?.stock || 0) && (
                    <span className="attiz-mono text-[9px] text-[#E63B2E] font-bold tracking-wider mt-1 block">Maximum available stock reached.</span>
                  )}
                </div>

                {/* Action buttons (Add to Cart & Buy Now) — rendered inline on Mobile & Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`w-full py-3 border-[3px] attiz-display text-xs tracking-[0.15em] uppercase transition-all ${isOutOfStock
                      ? 'border-black/15 text-black/30 bg-black/[0.02] cursor-not-allowed'
                      : 'border-black text-black bg-white shadow-[3px_3px_0_0_#111111] hover:bg-black hover:text-[#FFCB05] hover:shadow-[1.5px_1.5px_0_0_#111111] hover:translate-x-[1.5px] hover:translate-y-[1.5px] cursor-pointer'
                      }`}
                  >
                    {isAddedToast ? 'Added to Cart ✓' : (isOutOfStock ? 'Out of Stock' : 'Add to Cart')}
                  </button>
                  <button
                    disabled={isOutOfStock || isNavigatingBuyNow}
                    onClick={handleBuyNow}
                    className={`w-full py-3 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase transition-all flex items-center justify-center space-x-2 ${isOutOfStock || isNavigatingBuyNow
                      ? 'bg-black/[0.04] text-black/30 cursor-not-allowed'
                      : 'bg-[#E63B2E] text-white shadow-[3px_3px_0_0_#111111] hover:bg-black hover:shadow-[1.5px_1.5px_0_0_#111111] hover:translate-x-[1.5px] hover:translate-y-[1.5px] cursor-pointer'
                      }`}
                  >
                    {isNavigatingBuyNow ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Redirecting to Checkout...</span>
                      </>
                    ) : (
                      <span>{isOutOfStock ? 'Out of Stock' : 'Buy It Now'}</span>
                    )}
                  </button>
                </div>

                {/* Estimated Delivery Expectation Card */}
                <div className="bg-[#FAF8F5] border-2 border-black p-3 sm:p-3.5 mt-4 flex items-center space-x-2.5 sm:space-x-3 shadow-[3px_3px_0_0_#111111]">
                  <Truck className="w-5 h-5 text-[#E63B2E] shrink-0" />
                  <div className="space-y-0.5 sm:space-y-1 attiz-mono min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="bg-[#FFCB05] text-black border border-black px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold tracking-widest uppercase shrink-0">
                        FREE SHIPPING
                      </span>
                      <span className="text-[8.5px] sm:text-[9px] font-bold text-black/60 uppercase shrink-0">
                        All Over India
                      </span>
                    </div>
                    <p className="text-[10.5px] sm:text-xs font-bold text-black uppercase pt-0.5 leading-tight">
                      Delivery expected:{' '}
                      <span className="whitespace-nowrap">
                        <span className="text-[#E63B2E] font-extrabold">{deliveryRange.start}</span> to <span className="text-[#E63B2E] font-extrabold">{deliveryRange.end}</span>
                      </span>
                    </p>
                  </div>
                </div>
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
            <p className="attiz-body text-[13px] text-black/90 tracking-wide leading-relaxed text-justify whitespace-pre-line pt-1">
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



        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="py-8 sm:py-16 border-t border-black/10">
            <h3 className="attiz-display text-xl sm:text-2xl text-black/90 text-center uppercase mb-6 sm:mb-12 tracking-widest font-semibold">You May Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-16">
              {relatedProducts.map((prod) => {
                const isLiked = checkIsWishlisted(prod.id);
                const images = getProductImages(prod);
                const nextImage = images[1];
                const prodGst = (prod as any).gst_rate || prod.product_variants?.[0]?.gst_rate || 0;
                const taxableProd = Math.max(0, (prod.price || 0) * (1 - (prod.discount || 0) / 100));
                const finalPrice = Math.round(taxableProd * (1 + prodGst / 100));
                const mrpInclusiveGst = Math.round((prod.price || 0) * (1 + prodGst / 100));

                const handleQuickAdd = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({
                    ...prod,
                    price: finalPrice,
                    discount: 0,
                    original_mrp: prod.price,
                    quantity: 1,
                    selectedSize: prod.sizes ? prod.sizes.split(',')[0].trim() : 'M',
                  } as any, !isMobile);
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
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        />

                        {/* Product Alternative Hover Image */}
                        {nextImage && (
                          <Image
                            src={nextImage}
                            alt={`${prod.title} Alternate`}
                            fill
                            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-102 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        )}

                        {/* Floating Discount Badge */}
                        {prod.discount && prod.discount > 0 && (
                          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 bg-black text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 attiz-mono text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-widest uppercase">
                            <span className="inline sm:hidden">-{prod.discount}%</span>
                            <span className="hidden sm:inline">Save {prod.discount}%</span>
                          </div>
                        )}

                        {/* Wishlist Button Core */}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(prod); }}
                          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white active:scale-90 transition-transform duration-100 cursor-pointer"
                          aria-label="Wishlist item"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-100 ${isLiked ? 'fill-[#E63B2E] stroke-[#E63B2E]' : 'stroke-black fill-none'}`} />
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
                      <div className="pt-2.5 sm:pt-5 flex flex-col justify-between grow">
                        <div>
                          <h4 className="attiz-body text-[13px] sm:text-[14px] font-medium text-black/90 group-hover:text-black transition-colors line-clamp-2 leading-snug">
                            {prod.title}
                          </h4>
                        </div>

                        <div className="flex items-baseline justify-between mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-black/5">
                          <div className="flex items-baseline gap-1.5 sm:gap-2">
                            {prod.discount && prod.discount > 0 ? (
                              <>
                                <span className="attiz-mono text-xs sm:text-[15px] font-bold text-[#E63B2E]">
                                  ₹{finalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="attiz-body text-[10px] sm:text-xs text-black/85 line-through font-light">
                                  ₹{mrpInclusiveGst.toLocaleString('en-IN')}
                                </span>
                              </>
                            ) : (
                              <span className="attiz-mono text-xs sm:text-[15px] font-bold text-black">
                                ₹{finalPrice.toLocaleString('en-IN')}
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
                            className="lg:hidden w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-black text-white rounded-none cursor-pointer shrink-0"
                            aria-label="Add to cart context"
                          >
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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

        {/* Size chart modal */}
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn">
            {/* Modal Box */}
            <div className="relative bg-[#FAF8F5] border-[3px] border-black shadow-[8px_8px_0_0_#111111] max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-scale-in">

              {/* Header */}
              <div className="p-3.5 sm:p-4 bg-[#111111] text-white flex items-center justify-between border-b-[3px] border-black shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[#FFCB05] border-2 border-black flex items-center justify-center shadow-[1px_1px_0_0_#111111] shrink-0">
                    <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="attiz-mono text-[8px] sm:text-[9px] font-bold text-[#FFCB05] tracking-[0.2em] uppercase block leading-none mb-0.5">
                      Attiz Specifications
                    </span>
                    <h3 className="attiz-display text-base sm:text-lg text-white uppercase tracking-wider leading-none">
                      Size Chart
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsSizeChartOpen(false)}
                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-black hover:bg-[#E63B2E] hover:text-white border-2 border-black shadow-[2px_2px_0_0_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                  aria-label="Close size guide"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Image Container - Scrollable/contained inside modal body */}
              <div className="flex-1 overflow-auto p-3 sm:p-5 flex items-center justify-center bg-white">
                <div className="relative w-full h-full min-h-[250px] max-h-[58vh] flex items-center justify-center">
                  <img
                    src={product?.size_chart || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800'}
                    alt="Size Chart"
                    className="max-w-full max-h-[55vh] object-contain border-2 border-black shadow-[4px_4px_0_0_#111111]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 sm:p-3.5 bg-[#FAF8F5] border-t-2 border-black flex items-center justify-between shrink-0">
                <span className="attiz-mono text-[9px] sm:text-[10px] font-bold text-black/60 uppercase tracking-wider truncate mr-2">
                  Official Attiz Fit Guide
                </span>
                <button
                  onClick={() => setIsSizeChartOpen(false)}
                  className="px-4 py-1.5 bg-black text-[#FFCB05] attiz-mono text-[10px] sm:text-xs font-black tracking-widest uppercase border-2 border-black shadow-[2px_2px_0_0_#E63B2E] hover:bg-[#E63B2E] hover:text-white hover:border-black transition-all cursor-pointer shrink-0"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProductDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductDetailsInner />
    </Suspense>
  );
}