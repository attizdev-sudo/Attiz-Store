'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);

  // Prevent background body scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsNavigating(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close cart drawer automatically when route/pathname changes
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

  const handleGoToCheckout = () => {
    setIsNavigating(true);
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  const handleGoToCart = () => {
    setIsCartOpen(false);
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-[9980] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className="absolute top-[56px] bottom-[56px] sm:top-0 sm:bottom-0 right-0 w-full sm:max-w-md flex">
        <div className="w-full bg-white flex flex-col h-full border-l-2 border-black relative transition-all shadow-2xl">

          {/* Header */}
          <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-white text-black shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-black text-[#FFCB05] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="attiz-display text-sm tracking-wider uppercase text-black block">Shopping Cart</span>
                <span className="attiz-mono text-[9px] text-black/85 tracking-widest uppercase block">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsCartOpen(false)} 
              className="hidden sm:block text-black/85 hover:text-black p-1.5 transition-colors cursor-pointer border border-transparent hover:border-black rounded-none"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-2 divide-y divide-black/10 scrollbar-thin">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-black text-center">
                <div className="w-16 h-16 bg-[#FAF8F5] border-2 border-black flex items-center justify-center mb-4 -skew-x-3">
                  <ShoppingBag className="w-8 h-8 text-black/85 skew-x-3" />
                </div>
                <h3 className="attiz-display text-base uppercase tracking-wider mb-1">Your cart is empty</h3>
                <p className="attiz-mono text-[10px] text-black/85 max-w-xs tracking-wider uppercase mb-6">
                  Explore our latest catalog and discover premium streetwear styles.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 px-6 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-all text-xs attiz-mono font-bold tracking-widest uppercase cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${idx}`} className="flex items-start gap-4 py-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 bg-[#F5F1E6] border border-black overflow-hidden shrink-0">
                    <Image 
                      src={item.image || '/placeholder.png'} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                      sizes="80px" 
                    />
                  </div>

                  {/* Info & Action area */}
                  <div className="grow flex flex-col justify-between min-h-[96px]">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="attiz-mono text-xs font-bold text-black tracking-wide line-clamp-1 uppercase">
                          {item.title}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedSize)} 
                          className="text-black/85 hover:text-[#E63B2E] transition-colors p-0.5 cursor-pointer" 
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.selectedSize && (
                          <span className="attiz-mono text-[9px] bg-black/5 border border-black/20 px-1.5 py-0.5 text-black font-bold uppercase tracking-wider">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.color && (
                          <span className="attiz-mono text-[9px] bg-black/5 border border-black/20 px-1.5 py-0.5 text-black/85 uppercase tracking-wider">
                            Color: {item.color}
                          </span>
                        )}
                      </div>

                      <span className="attiz-mono text-xs font-extrabold text-[#E63B2E] mt-1.5 block">
                        ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-black bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                          className="p-1 px-2.5 text-black hover:bg-black/10 transition-colors cursor-pointer border-r border-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="attiz-mono text-xs font-bold px-3 text-black select-none">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                          className="p-1 px-2.5 text-black hover:bg-black/10 transition-colors cursor-pointer border-l border-black"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="attiz-mono text-xs font-bold text-black">
                        ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Area — Compact & Space Efficient */}
          {cartItems.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t-2 border-black bg-[#FAF8F5] space-y-2.5 shrink-0">
              <div className="space-y-1 text-[11px] attiz-mono">
                <div className="flex justify-between items-center text-black/75 uppercase">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-black/75 uppercase">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="pt-1.5 border-t border-black/10 flex justify-between items-center">
                  <span className="attiz-display text-xs sm:text-sm uppercase text-black font-bold">Estimated Total</span>
                  <span className="attiz-mono text-base font-black text-[#E63B2E]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <button
                  onClick={handleGoToCheckout}
                  disabled={isNavigating}
                  className="w-full py-2.5 px-3.5 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-all text-xs attiz-mono font-black tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-[2px_2px_0_0_#000] disabled:opacity-80"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFCB05]" />
                      <span>Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[8.5px] attiz-mono text-black/70 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Encrypted & 100% Secure Checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
