'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
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
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-brand-cream-dark">

          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-cream-dark flex items-center justify-between bg-brand-cream/15">
            <div className="flex items-center space-x-2 text-brand-dark">
              <ShoppingBag className="w-5 h-5 text-brand-brown" />
              <span className="font-sans text-xs font-bold tracking-[0.2em] uppercase">YOUR CART ({cartItems.length})</span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="text-brand-dark hover:text-brand-brown p-1.5 rounded-full hover:bg-brand-cream/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold tracking-wider text-center">{errorMsg}</div>}
            {successMsg && <div className="p-3 bg-green-50 text-brand-brown rounded text-xs font-semibold tracking-wider text-center">{successMsg}</div>}

            {cartItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4 text-brand-dark/45 text-center">
                <ShoppingBag className="w-12 h-12 stroke-[1.2]" />
                <p className="font-sans text-xs font-bold tracking-widest uppercase">Your cart is empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="px-6 py-2.5 rounded border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white text-[10px] font-bold tracking-wider uppercase transition-colors">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-brand-cream-dark">
                {cartItems.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}`} className={`flex items-start gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                    <div className="relative w-20 h-24 bg-brand-cream rounded-md overflow-hidden shrink-0 border border-brand-cream-dark">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="grow flex flex-col justify-between h-24">
                      <div>
                        <h4 className="font-sans text-[11px] font-bold text-brand-dark line-clamp-1">{item.title}</h4>
                        {item.selectedSize && <span className="font-sans text-[10px] text-brand-dark/50 tracking-wider">Size: {item.selectedSize}</span>}
                        <span className="font-sans text-xs font-semibold text-brand-brown mt-1 block">₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-brand-cream-dark rounded-md bg-brand-cream/15">
                          <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} className="p-1 px-2 text-brand-dark hover:text-brand-brown transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="font-sans text-xs font-bold px-2 text-brand-dark select-none">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} className="p-1 px-2 text-brand-dark hover:text-brand-brown transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.selectedSize)} className="text-brand-dark/45 hover:text-red-500 p-1.5 transition-colors" title="Remove item"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Panel */}
          {cartItems.length > 0 && (
            <div className="border-t border-brand-cream-dark p-6 bg-brand-cream/15">
              <div className="flex justify-between items-center mb-6">
                <span className="font-sans text-xs font-bold tracking-[0.2em] text-brand-dark uppercase">TOTAL AMOUNT</span>
                <span className="font-sans text-sm font-extrabold text-brand-brown">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {!user ? (
                <div className="space-y-3">
                  <p className="font-sans text-[10px] text-brand-dark/65 tracking-wide text-center leading-relaxed">You must be signed in to complete your checkout order.</p>
                  <button
                    onClick={() => { setIsCartOpen(false); router.push('/auth'); }}
                    className="w-full py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors shadow-sm cursor-pointer"
                  >
                    Sign In to Checkout
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-3 border-t border-brand-cream-dark/60 pt-4 max-h-64 overflow-y-auto pr-1">
                  <span className="block font-sans text-[10px] font-extrabold tracking-widest text-brand-dark/50 uppercase mb-2">SHIPPING DETAILS</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="firstName" placeholder="First Name" required value={shippingDetails.firstName} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                    <input type="text" name="lastName" placeholder="Last Name" required value={shippingDetails.lastName} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  </div>
                  <input type="tel" name="phone" placeholder="Contact Phone Number" required value={shippingDetails.phone} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  <input type="text" name="address" placeholder="Delivery Street Address" required value={shippingDetails.address} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="city" placeholder="City" required value={shippingDetails.city} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                    <input type="text" name="zipCode" placeholder="Zip Code" required value={shippingDetails.zipCode} onChange={handleInputChange} className="w-full px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors shadow-sm cursor-pointer">
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
