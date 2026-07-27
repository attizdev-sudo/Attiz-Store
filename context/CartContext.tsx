'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import type { CartItem, ShippingDetails } from '@/lib/types';

export type { CartItem };

interface CartContextValue {
  cartItems: CartItem[];
  buyNowItem: CartItem | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: CartItem) => void;
  startBuyNow: (product: CartItem) => void;
  clearBuyNow: () => void;
  updateQuantity: (productId: string, selectedSize: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, selectedSize: string | undefined) => void;
  clearCart: () => void;
  checkout: (shippingDetails: ShippingDetails) => Promise<{ success: boolean; message: string }>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      if (saved) setCartItems(JSON.parse(saved));
      const savedBuyNow = sessionStorage.getItem('buy_now_item');
      if (savedBuyNow) setBuyNowItem(JSON.parse(savedBuyNow));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      clearBuyNow();
    }
  }, [user]);

  const addToCart = (product: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    setIsCartOpen(true);
  };

  const startBuyNow = (product: CartItem) => {
    const item: CartItem = { ...product, quantity: product.quantity || 1 };
    setBuyNowItem(item);
    try {
      sessionStorage.setItem('buy_now_item', JSON.stringify(item));
    } catch { /* ignore */ }
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
    try {
      sessionStorage.removeItem('buy_now_item');
    } catch { /* ignore */ }
  };

  const updateQuantity = (productId: string, selectedSize: string | undefined, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId, selectedSize); return; }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, selectedSize: string | undefined) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.selectedSize === selectedSize))
    );
  };

  const clearCart = () => setCartItems([]);

  const checkout = async (shippingDetails: ShippingDetails) => {
    if (!user) return { success: false, message: 'Please sign in to complete checkout.' };
    const itemsToCheckout = buyNowItem ? [buyNowItem] : cartItems;
    if (itemsToCheckout.length === 0) return { success: false, message: 'Your cart is empty.' };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, shippingDetails, cartItems: itemsToCheckout }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.error || 'Checkout failed.' };
      
      if (buyNowItem) {
        clearBuyNow();
      } else {
        clearCart();
      }
      setIsCartOpen(false);
      return { success: true, message: json.message || 'Order placed successfully!' };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems, buyNowItem, isCartOpen, setIsCartOpen,
      addToCart, startBuyNow, clearBuyNow, updateQuantity, removeFromCart, clearCart, checkout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
