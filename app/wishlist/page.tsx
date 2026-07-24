'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  ArrowUpDown,
  Layers,
  ShoppingBag as CartIcon,
  Tag,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function WishlistPage() {
  const { wishlistItems, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'discount'>('newest');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (item: any) => {
    const finalPrice = item.discount && item.discount > 0
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price;

    addToCart({
      id: item.product_id || item.variant_id,
      title: item.title,
      price: finalPrice,
      image: item.image,
      quantity: 1,
      selectedSize: item.size || 'M',
      selectedColor: item.color || '',
    });

    setAddedIds((prev) => new Set(prev).add(item.id));
    showToast(`Added "${item.title}" to cart!`);
    setIsCartOpen(true);

    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) => {
      const finalPrice = item.discount && item.discount > 0
        ? Math.round(item.price * (1 - item.discount / 100))
        : item.price;

      addToCart({
        id: item.product_id || item.variant_id,
        title: item.title,
        price: finalPrice,
        image: item.image,
        quantity: 1,
        selectedSize: item.size || 'M',
        selectedColor: item.color || '',
      });
    });
    showToast(`Added all ${wishlistItems.length} items to cart!`);
    setIsCartOpen(true);
  };

  const sortedItems = useMemo(() => {
    const items = [...wishlistItems];
    if (sortBy === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      items.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    return items;
  }, [wishlistItems, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden">
      {/* Background Halftone Texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-[#FFCB05] px-5 py-3.5 border-2 border-black shadow-[4px_4px_0_0_#E63B2E] flex items-center gap-3 animate-bounce">
          <Check className="w-4 h-4 text-[#E63B2E] stroke-[3]" />
          <span className="attiz-mono text-xs font-bold tracking-wider uppercase">{toastMessage}</span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-24">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/80 hover:text-black transition-colors uppercase cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Catalog</span>
        </button>

        {/* Page Header Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between border-b-2 border-black/15 pb-6">
          <div>
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-3">
              <span className="skew-x-6 flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-[#E63B2E] stroke-[#E63B2E]" />
                Sartorial Vault
              </span>
            </span>
            <h1 className="attiz-display text-3xl sm:text-5xl text-black tracking-tight uppercase">
              My Wishlist
            </h1>
            <p className="attiz-body text-xs text-black/60 font-light mt-1">
              Curated collection of your saved pieces ready for order.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-3">
            <span className="attiz-mono text-xs font-bold tracking-widest text-black/70 uppercase">
              Items: <span className="text-[#E63B2E] font-extrabold">{wishlistItems.length}</span>
            </span>
          </div>
        </div>

        {/* Control Toolbar */}
        {wishlistItems.length > 0 && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#111111]">
            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-black/60 shrink-0" />
              <span className="attiz-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF8F5] border-2 border-black px-3 py-1.5 attiz-mono text-xs font-bold tracking-wider text-black outline-none cursor-pointer focus:border-[#E63B2E]"
              >
                <option value="newest">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>

            {/* Batch Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAllToCart}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#FFCB05] hover:bg-black hover:text-white text-black border-2 border-black attiz-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#111111] active:translate-y-0.5"
              >
                <CartIcon className="w-3.5 h-3.5" />
                <span>Move All to Cart</span>
              </button>
              <button
                onClick={() => clearWishlist()}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-red-600 hover:text-white text-red-600 border-2 border-black attiz-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0_0_#111111] active:translate-y-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#E63B2E] mb-4" />
            <p className="attiz-mono text-xs font-bold tracking-widest text-black/70 uppercase">
              Loading your wishlist...
            </p>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="max-w-lg mx-auto my-12 border-2 border-black bg-white p-8 sm:p-14 text-center shadow-[6px_6px_0_0_#111111] transition-all">
            <div className="w-20 h-20 bg-[#FAF8F5] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_0_#E63B2E]">
              <Heart className="w-10 h-10 text-[#E63B2E]" />
            </div>
            <h2 className="attiz-display text-2xl sm:text-3xl uppercase tracking-wider text-black mb-3">
              Your Wishlist is Empty
            </h2>
            <p className="attiz-body text-xs text-black/70 font-light mb-8 leading-relaxed max-w-sm mx-auto">
              Save items you love by clicking the heart icon while browsing our catalog. They will appear here for easy access.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white border-2 border-black attiz-mono text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-[4px_4px_0_0_#111111] cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Catalog</span>
            </button>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {sortedItems.map((item) => {
              const isAdded = addedIds.has(item.id);
              const discountedPrice = item.discount && item.discount > 0
                ? Math.round(item.price * (1 - item.discount / 100))
                : item.price;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between bg-white border-2 border-black shadow-[4px_4px_0_0_#111111] hover:shadow-[6px_6px_0_0_#E63B2E] transition-all duration-300 overflow-hidden"
                >
                  <div>
                    {/* Media Container */}
                    <div className="relative aspect-[3/4] bg-[#F0EDE6] overflow-hidden border-b-2 border-black">
                      <Image
                        src={item.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                        alt={item.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Floating Discount Badge */}
                      {item.discount && item.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-black text-[#FFCB05] px-2.5 py-1 attiz-mono text-[9px] font-bold tracking-widest uppercase border-2 border-black shadow-[2px_2px_0_0_#111111]">
                          Save {item.discount}%
                        </div>
                      )}

                      {/* Stock Indicator */}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-black px-2 py-0.5 attiz-mono text-[8px] font-bold tracking-wider uppercase text-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>In Stock</span>
                      </div>

                      {/* Quick Delete Button */}
                      <button
                        onClick={() => removeFromWishlist({ wishlistId: item.id, variantId: item.variant_id, productId: item.product_id || undefined })}
                        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white border-2 border-black text-black hover:bg-[#E63B2E] hover:text-white transition-all cursor-pointer shadow-[2px_2px_0_0_#111111] active:scale-90"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="attiz-mono text-[9px] font-bold text-black/50 tracking-widest uppercase">
                          ATTIZ ARCHIVE
                        </span>
                      </div>

                      {item.product_id ? (
                        <Link href={`/product/${item.product_id}`}>
                          <h3 className="attiz-display text-lg text-black hover:text-[#E63B2E] transition-colors uppercase leading-snug truncate">
                            {item.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="attiz-display text-lg text-black uppercase leading-snug truncate">
                          {item.title}
                        </h3>
                      )}

                      {/* Variant Specs */}
                      {(item.size || item.color) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {item.size && (
                            <span className="bg-[#FAF8F5] border border-black/30 px-2 py-0.5 attiz-mono text-[9px] font-bold tracking-wider text-black uppercase">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-[#FAF8F5] border border-black/30 px-2 py-0.5 attiz-mono text-[9px] font-bold tracking-wider text-black uppercase">
                              {item.color}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Section */}
                      <div className="flex items-baseline space-x-2 pt-1">
                        <span className="attiz-mono text-lg font-bold text-black">
                          ₹{discountedPrice.toLocaleString()}
                        </span>
                        {item.discount && item.discount > 0 && (
                          <span className="attiz-mono text-xs text-black/40 line-through">
                            ₹{item.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isAdded}
                      className={`w-full py-3 border-2 border-black attiz-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0_0_#111111] active:translate-y-0.5 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#FFCB05] hover:bg-black hover:text-white text-black'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
