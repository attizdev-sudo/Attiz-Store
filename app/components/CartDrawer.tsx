'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag, Check, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, checkout } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingDetails, setShippingDetails] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zipCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isCartOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    const res = await checkout(shippingDetails);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setIsCartOpen(false);
        setSuccessMsg('');
        router.push('/orders');
      }, 2500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white flex flex-col h-full border-l-2 border-black relative transition-all">

          {/* Header */}
          <div className="px-6 py-5 border-b-2 border-black flex items-center justify-between bg-white text-black">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-4 h-4 text-black/70" />
              <span className="attiz-display text-sm tracking-wider uppercase text-black">Your Cart ({cartItems.length})</span>
            </div>
            
            <button 
              onClick={() => setIsCartOpen(false)} 
              className="text-black/50 hover:text-black p-1 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-2 divide-y border-b border-black/10 divide-black/10 scrollbar-thin">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-[#E63B2E] border border-[#E63B2E] text-xs font-bold tracking-wider text-center uppercase my-4">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-50 text-black border border-black text-xs font-bold tracking-wider text-center uppercase flex items-center justify-center space-x-2 my-4">
                <Check className="w-4 h-4 text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4 text-black text-center">
                <ShoppingBag className="w-10 h-10 stroke-[1.2] text-black/30" />
                <p className="attiz-mono text-[10px] font-bold tracking-widest uppercase text-black/55">Your cart is empty.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="py-2 px-5 border border-black bg-white text-black hover:bg-black hover:text-[#FFCB05] transition-all text-[9px] attiz-mono font-bold tracking-wider uppercase cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex items-start gap-4 py-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 bg-[#F5F1E6] border border-black/10 overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                  </div>

                  {/* Info & Action area */}
                  <div className="grow flex flex-col justify-between h-24">
                    <div>
                      <h4 className="attiz-mono text-xs font-bold text-black tracking-wide line-clamp-1 uppercase">{item.title}</h4>
                      {item.selectedSize && (
                        <span className="attiz-mono text-[9px] text-black/50 uppercase tracking-widest block mt-0.5">
                          Size: {item.selectedSize}
                        </span>
                      )}
                      <span className="attiz-mono text-xs font-bold text-[#E63B2E] mt-1 block">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity control */}
                      <div className="flex items-center border border-black bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} 
                          className="p-1 px-2.5 text-black hover:bg-black/5 transition-colors cursor-pointer border-r border-black"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="attiz-mono text-xs font-bold px-3 text-black select-none">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} 
                          className="p-1 px-2.5 text-black hover:bg-black/5 transition-colors cursor-pointer border-l border-black"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove button */}
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize)} 
                        className="text-black/40 hover:text-[#E63B2E] p-1.5 transition-colors cursor-pointer" 
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Panel */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white space-y-4">
              
              <div className="flex justify-between items-center">
                <span className="attiz-mono text-[10px] font-bold tracking-widest text-black/50 uppercase">Total Amount</span>
                <span className="attiz-mono text-sm font-bold text-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {!user ? (
                <div className="space-y-3 pt-2">
                  <p className="attiz-body text-[10px] text-black/60 tracking-wide text-center leading-relaxed font-light">
                    You must be signed in to complete your checkout order.
                  </p>
                  <button
                    onClick={() => { setIsCartOpen(false); router.push('/auth'); }}
                    className="w-full py-3 border-2 border-black bg-black text-[#FFCB05] hover:bg-white hover:text-black shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs attiz-display tracking-[0.15em] uppercase cursor-pointer"
                  >
                    Sign In to Checkout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  <div className="flex items-center gap-1 border-b border-black/10 pb-1.5 mb-2">
                    <Truck className="w-3.5 h-3.5 text-black/60" />
                    <span className="block attiz-mono text-[9px] font-bold tracking-widest text-black/50 uppercase">Shipping Details</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="firstName" placeholder="FIRST NAME" required value={shippingDetails.firstName} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                    <input type="text" name="lastName" placeholder="LAST NAME" required value={shippingDetails.lastName} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                  </div>
                  <input type="tel" name="phone" placeholder="CONTACT PHONE NUMBER" required value={shippingDetails.phone} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                  <input type="text" name="address" placeholder="DELIVERY STREET ADDRESS" required value={shippingDetails.address} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="city" placeholder="CITY" required value={shippingDetails.city} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                    <input type="text" name="zipCode" placeholder="ZIP CODE" required value={shippingDetails.zipCode} onChange={handleInputChange} className="w-full bg-[#FAF8F5] border border-black/20 px-3 py-2 text-xs outline-none attiz-body text-black placeholder-black/30 font-medium focus:border-black focus:bg-white transition-all uppercase" />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full mt-2 py-3 border-2 border-black bg-black text-[#FFCB05] hover:bg-white hover:text-black shadow-[4px_4px_0_0_#111111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs attiz-display tracking-[0.15em] uppercase cursor-pointer"
                  >
                    {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
