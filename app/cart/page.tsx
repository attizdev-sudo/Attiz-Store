'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Tag, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const freeShippingThreshold = 999;
  const shippingCharge = subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal + shippingCharge - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'ATTIZ10' || code === 'WELCOME10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon ${code} applied! 10% discount added.`);
    } else if (code === 'FREESHIP') {
      setDiscountAmount(shippingCharge);
      setAppliedCoupon(code);
      setCouponSuccess('Coupon FREESHIP applied! Free shipping added.');
    } else {
      setCouponError('Invalid promo code. Try WELCOME10 or ATTIZ10.');
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden py-12 pb-24">
      {/* Background Halftone Pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/85 hover:text-black transition-colors uppercase mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Continue Shopping</span>
        </Link>

        {/* Page Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between border-b-2 border-black pb-6 gap-4">
          <div>
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-3">
              <span className="skew-x-6">Bag Summary</span>
            </span>
            <h1 className="attiz-display text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-black">
              Shopping Cart
            </h1>
          </div>

          <div className="attiz-mono text-xs font-bold text-black/85 uppercase tracking-widest">
            Total Items: <span className="text-black font-extrabold">{cartItems.length}</span>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white border-2 border-black p-12 text-center my-8 shadow-[6px_6px_0_0_#000] max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-[#FAF8F5] border-2 border-black flex items-center justify-center mx-auto mb-6 -skew-x-3">
              <ShoppingBag className="w-10 h-10 text-black/85 skew-x-3" />
            </div>
            <h2 className="attiz-display text-2xl uppercase tracking-wider text-black mb-2">
              Your Shopping Cart is Empty
            </h2>
            <p className="attiz-mono text-xs text-black/85 tracking-wider uppercase max-w-md mx-auto mb-8">
              Looks like you haven't added any products to your bag yet. Check out our latest drops!
            </p>
            <Link
              href="/#catalog-grid"
              className="inline-flex items-center space-x-2 py-3.5 px-8 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-all attiz-mono text-xs font-black tracking-widest uppercase shadow-[4px_4px_0_0_#000]"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Grid Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Free Shipping Banner */}
              <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0_0_#000] flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#FFCB05] border border-black flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-black" />
                </div>
                <div className="grow">
                  <p className="attiz-mono text-xs font-bold text-black uppercase tracking-wide">
                    {subtotal >= freeShippingThreshold
                      ? 'Congratulations! You qualify for FREE Delivery!'
                      : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more to unlock FREE Delivery.`}
                  </p>
                  <div className="w-full bg-black/10 h-2 mt-2 border border-black/20 overflow-hidden">
                    <div
                      className="bg-black h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Items List Card */}
              <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_#000] overflow-hidden">
                <div className="px-6 py-4 border-b-2 border-black bg-[#FAF8F5] flex items-center justify-between">
                  <span className="attiz-display text-sm uppercase text-black">Product Details</span>
                  <button
                    onClick={clearCart}
                    className="attiz-mono text-[10px] font-bold text-black/85 hover:text-[#E63B2E] transition-colors uppercase tracking-widest flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y-2 divide-black/10">
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.selectedSize}-${idx}`}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-[#FAF8F5]/50 transition-colors"
                    >
                      {/* Image & Title */}
                      <div className="flex items-start space-x-4">
                        <div className="relative w-24 h-28 bg-[#F5F1E6] border-2 border-black overflow-hidden shrink-0">
                          <Image
                            src={item.image || '/placeholder.png'}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div>
                          <h3 className="attiz-mono text-sm font-black text-black tracking-wide uppercase">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.selectedSize && (
                              <span className="attiz-mono text-[10px] bg-black text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.color && (
                              <span className="attiz-mono text-[10px] bg-black/10 border border-black/30 px-2 py-0.5 font-bold text-black uppercase tracking-wider">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                          <span className="attiz-mono text-sm font-bold text-[#E63B2E] mt-2 block">
                            ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-black/10 pt-4 sm:pt-0">
                        {/* Quantity control */}
                        <div className="flex items-center border-2 border-black bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                            className="p-2 px-3 text-black hover:bg-black/10 transition-colors border-r border-black cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="attiz-mono text-sm font-extrabold px-4 text-black select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                            className="p-2 px-3 text-black hover:bg-black/10 transition-colors border-l border-black cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item total price */}
                        <div className="text-right">
                          <span className="attiz-mono text-base font-extrabold text-black block">
                            ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                            className="attiz-mono text-[10px] text-black/85 hover:text-[#E63B2E] font-bold tracking-wider uppercase mt-1 inline-block cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo / Coupon Code Section */}
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                <h4 className="attiz-display text-sm uppercase text-black mb-3 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-black/85" />
                  <span>Have a Promo Code?</span>
                </h4>
                <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="grow border-2 border-black px-4 py-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:bg-[#FAF8F5]"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-6 border-2 border-black bg-black text-white hover:bg-[#FFCB05] hover:text-black transition-all attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Apply Code
                  </button>
                </form>

                {couponError && (
                  <p className="attiz-mono text-xs text-[#E63B2E] font-bold uppercase mt-2">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="attiz-mono text-xs text-green-700 font-bold uppercase mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>{couponSuccess}</span>
                  </p>
                )}
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              
              <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="attiz-display text-lg uppercase text-black border-b-2 border-black pb-4 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 attiz-mono text-xs uppercase border-b-2 border-black pb-4 mb-4">
                  <div className="flex justify-between text-black/85">
                    <span>Bag Subtotal</span>
                    <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-black/85">
                    <span>Shipping Charges</span>
                    <span className="font-bold text-black">
                      {shippingCharge === 0 ? (
                        <span className="text-green-700 font-extrabold">FREE</span>
                      ) : (
                        `₹${shippingCharge}`
                      )}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="attiz-display text-base uppercase text-black block">Grand Total</span>
                    <span className="attiz-mono text-[10px] text-black/85 uppercase">Taxes included</span>
                  </div>
                  <span className="attiz-mono text-2xl font-black text-[#E63B2E]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 px-6 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-all attiz-mono text-xs font-black tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-[4px_4px_0_0_#000]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Guarantees */}
                <div className="mt-6 pt-4 border-t border-black/10 space-y-2.5 text-[10px] attiz-mono text-black/85 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>100% Encrypted & Safe Payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>7 Days Easy Return & Exchange</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-black shrink-0" />
                    <span>Express Domestic Shipping</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
