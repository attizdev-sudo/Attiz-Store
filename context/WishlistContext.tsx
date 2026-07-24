'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '@/lib/types';

interface WishlistContextValue {
  wishlistItems: WishlistItem[];
  loading: boolean;
  togglingIds: Set<string>;
  isWishlisted: (productIdOrVariantId: string) => boolean;
  toggleWishlist: (product: Partial<Product> & { id: string }, variantId?: string) => Promise<{ success: boolean; isWishlisted: boolean; requiresAuth?: boolean }>;
  removeFromWishlist: (target: { wishlistId?: string; variantId?: string; productId?: string }) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/wishlist', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(Array.isArray(data) ? data : []);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((id: string) => {
    if (!id) return false;
    return wishlistItems.some(
      (item) => item.product_id === id || item.variant_id === id || item.id === id
    );
  }, [wishlistItems]);

  const toggleWishlist = async (
    product: Partial<Product> & { id: string },
    variantId?: string
  ): Promise<{ success: boolean; isWishlisted: boolean; requiresAuth?: boolean }> => {
    if (!user) {
      router.push('/login?redirect=/wishlist');
      return { success: false, isWishlisted: false, requiresAuth: true };
    }

    const targetKey = product.id;
    const currentlyLiked = isWishlisted(product.id) || (variantId ? isWishlisted(variantId) : false);

    // Mark as toggling in UI for micro-animations
    setTogglingIds((prev) => new Set(prev).add(targetKey));

    if (currentlyLiked) {
      // ── OPTIMISTIC REMOVE ──
      const previousItems = [...wishlistItems];
      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            item.product_id !== product.id &&
            item.variant_id !== variantId &&
            item.id !== product.id
        )
      );

      try {
        const params = new URLSearchParams();
        if (variantId) params.set('variant_id', variantId);
        else params.set('product_id', product.id);

        const res = await fetch(`/api/wishlist?${params.toString()}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          // Revert on error
          setWishlistItems(previousItems);
          return { success: false, isWishlisted: true };
        }
        return { success: true, isWishlisted: false };
      } catch (err) {
        console.error('Error removing from wishlist:', err);
        setWishlistItems(previousItems);
        return { success: false, isWishlisted: true };
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetKey);
          return next;
        });
      }
    } else {
      // ── OPTIMISTIC ADD ──
      const previousItems = [...wishlistItems];

      const resolvedVariantId = variantId || product.product_variants?.[0]?.id || `var-${product.id}`;
      const tempItem: WishlistItem = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        variant_id: resolvedVariantId,
        product_id: product.id,
        title: product.title || 'Garment',
        description: product.description || '',
        color: product.colors?.split(',')[0]?.trim() || '',
        size: product.sizes?.split(',')[0]?.trim() || 'M',
        stock: product.stock ?? 10,
        price: product.price || 0,
        discount: product.discount || 0,
        image: product.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
        created_at: new Date().toISOString(),
      };

      setWishlistItems((prev) => [tempItem, ...prev]);

      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            product_id: product.id,
            variant_id: variantId,
          }),
        });

        if (!res.ok) {
          // Revert on error
          setWishlistItems(previousItems);
          return { success: false, isWishlisted: false };
        }

        // Refresh official background state
        fetchWishlist();
        return { success: true, isWishlisted: true };
      } catch (err) {
        console.error('Error adding to wishlist:', err);
        setWishlistItems(previousItems);
        return { success: false, isWishlisted: false };
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetKey);
          return next;
        });
      }
    }
  };

  const removeFromWishlist = async (target: {
    wishlistId?: string;
    variantId?: string;
    productId?: string;
  }): Promise<boolean> => {
    if (!user) return false;

    // Optimistically filter item out
    const previousItems = [...wishlistItems];
    setWishlistItems((prev) =>
      prev.filter(
        (item) =>
          !(target.wishlistId && item.id === target.wishlistId) &&
          !(target.variantId && item.variant_id === target.variantId) &&
          !(target.productId && item.product_id === target.productId)
      )
    );

    try {
      const params = new URLSearchParams();
      if (target.wishlistId) params.set('id', target.wishlistId);
      if (target.variantId) params.set('variant_id', target.variantId);
      if (target.productId) params.set('product_id', target.productId);

      const res = await fetch(`/api/wishlist?${params.toString()}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        setWishlistItems(previousItems);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setWishlistItems(previousItems);
      return false;
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!user || wishlistItems.length === 0) return false;
    const previousItems = [...wishlistItems];
    setWishlistItems([]);

    try {
      // Remove each item or bulk delete
      await Promise.all(
        previousItems.map((item) =>
          fetch(`/api/wishlist?id=${item.id}`, { method: 'DELETE', credentials: 'include' })
        )
      );
      return true;
    } catch {
      setWishlistItems(previousItems);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        togglingIds,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
