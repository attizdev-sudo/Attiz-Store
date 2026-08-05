'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Plus,
  User,
  CheckCircle2,
  Lock,
  AlertCircle,
  FileText,
  Edit2
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface SavedAddress {
  id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default?: boolean;
}

export default function CheckoutPage() {
  const { cartItems, buyNowItem, clearCart, clearBuyNow, isHydrated } = useCart();
  const { user, sessionLoading, updateUserPhone } = useAuth();
  const router = useRouter();

  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

  // Timeline Stepper State: 1 = Address & Contact, 2 = Order Summary, 3 = Payment Method
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address & Contact State
  const [phone, setPhone] = useState('');
  const [updateProfilePhone, setUpdateProfilePhone] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [saveAddressToBook, setSaveAddressToBook] = useState(true);
  const [step1Error, setStep1Error] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);

  // Pricing calculations
  const subtotal = checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const shippingCharge = 0;
  const grandTotal = subtotal;

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

  // Protect route & prefill user details
  useEffect(() => {
    if (!sessionLoading) {
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      setPhone(user.phone || '');
      setAddressForm((prev) => ({
        ...prev,
        recipientName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone: user.phone || '',
      }));
      fetchAddresses();
    }
  }, [user, sessionLoading, router]);

  // Scroll to top of viewport when switching checkout steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const json = await res.json();
        const addrs: SavedAddress[] = json.addresses || [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          populateFormWithSavedAddress(defaultAddr);

          // If user has saved phone & valid saved address, jump directly to Step 2: Order Summary
          const userHasPhone = Boolean((user?.phone && user.phone.trim().length >= 7) || (defaultAddr.phone && defaultAddr.phone.trim().length >= 7));
          const userHasAddress = Boolean(defaultAddr.address_line1 && defaultAddr.city && defaultAddr.state && defaultAddr.postal_code);

          if (userHasPhone && userHasAddress) {
            setCurrentStep(2);
          }
        }
      }
    } catch {
      /* ignore */
    }
  };

  const populateFormWithSavedAddress = (addr: SavedAddress) => {
    setAddressForm({
      recipientName: addr.recipient_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
      country: addr.country || 'India',
    });
    if (addr.phone) setPhone(addr.phone);
  };

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddressForm({
        recipientName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        phone: phone || user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
    } else {
      const found = savedAddresses.find((a) => a.id === addrId);
      if (found) populateFormWithSavedAddress(found);
    }
  };

  // Handler for Step 1 (Address & Phone) -> Step 2 (Order Summary)
  const handleProceedFromStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error('');

    const cleanPhone = phone.trim() || addressForm.phone.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      setStep1Error('Please enter a valid mobile phone number (min 7 digits).');
      return;
    }

    if (
      !addressForm.recipientName.trim() ||
      !addressForm.addressLine1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.postalCode.trim()
    ) {
      setStep1Error('Please fill in all required address fields.');
      return;
    }

    // Update phone in profile if requested
    if (updateProfilePhone && user && cleanPhone !== user.phone) {
      await updateUserPhone(cleanPhone);
    }

    setCurrentStep(2);
  };

  // Handler for Step 2 (Order Summary) -> Step 3 (Payment)
  const handleProceedFromStep2 = () => {
    setCurrentStep(3);
  };

  // Final Order Submit Handler
  const handlePlaceOrder = async () => {
    if (!user) return;
    setCheckoutError('');
    setIsSubmitting(true);

    try {
      const payload = {
        userId: user.id,
        phone: phone.trim() || addressForm.phone.trim(),
        updateUserPhone: updateProfilePhone,
        saveAddress: selectedAddressId === 'new' && saveAddressToBook,
        paymentMethod,
        shippingDetails: {
          recipientName: addressForm.recipientName.trim(),
          phone: addressForm.phone.trim() || phone.trim(),
          addressLine1: addressForm.addressLine1.trim(),
          addressLine2: addressForm.addressLine2.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          postalCode: addressForm.postalCode.trim(),
          country: addressForm.country.trim(),
        },
        cartItems: checkoutItems.map((item) => ({
          id: item.id,
          product_id: item.product_id || (item.id.includes('-') ? item.id.split('-')[0] : item.id),
          variant_id: item.variant_id || null,
          title: item.title,
          price: Number(item.price) || 0,
          quantity: item.quantity,
          selectedSize: item.selectedSize || item.size || '',
          color: item.color || item.selectedColor || '',
          image: item.image || (item as any).colorSpecificImage || '',
        })),
        pricing: {
          subtotal,
          shippingCharge,
          tax: 0,
          discount: 0,
          totalPrice: grandTotal,
        },
      };

      console.log('🚀 [CHECKOUT CLIENT] Placing order with payload:', payload);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (!res.ok) {
        setCheckoutError(json.error || 'Failed to place order. Please try again.');
        return;
      }

      // Success
      setOrderSuccess({ orderNumber: json.orderNumber || 'ATZ-ORDER' });
      if (buyNowItem) {
        clearBuyNow();
      } else {
        clearCart();
      }

      setTimeout(() => {
        router.push('/orders');
      }, 2500);

    } catch {
      setIsSubmitting(false);
      setCheckoutError('Network connection error. Please check your connection and try again.');
    }
  };

  if (sessionLoading || !isHydrated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-black border-t-[#E63B2E] rounded-full animate-spin mb-3" />
        <span className="attiz-mono text-xs font-bold uppercase tracking-widest text-black/85">
          Loading checkout...
        </span>
      </div>
    );
  }

  if (checkoutItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-md mx-auto bg-white border border-black/15 p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#E63B2E] mx-auto mb-3" />
          <h2 className="attiz-display text-xl uppercase mb-2">Your Cart is Empty</h2>
          <p className="attiz-mono text-xs text-black/70 uppercase mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/#catalog-grid"
            className="inline-block py-3 px-6 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold tracking-widest uppercase"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-6 sm:py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Minimalist Top Navigation Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/#catalog-grid"
              className="p-1.5 text-black hover:text-[#E63B2E] transition-colors"
              title="Return to Shop Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="attiz-display text-xl sm:text-2xl uppercase text-black leading-none">
                Checkout
              </h1>
              <span className="attiz-mono text-[10px] text-black/70 font-bold uppercase tracking-wider">
                {checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'} · Total: ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] attiz-mono font-bold text-black uppercase bg-white border border-black/15 px-3 py-1">
            <Lock className="w-3 h-3 text-green-600 shrink-0" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {/* ORDER SUCCESS MODAL OVERLAY */}
        {orderSuccess && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-2 border-black p-8 max-w-md w-full text-center shadow-xl">
              <div className="w-14 h-14 bg-green-50 border border-black flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <span className="inline-block bg-black text-[#FFCB05] attiz-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-2">
                Order Confirmed
              </span>
              <h2 className="attiz-display text-2xl uppercase text-black mb-2">
                Thank You for Your Order!
              </h2>
              <p className="attiz-mono text-xs text-black/85 uppercase tracking-wider mb-4">
                Order Number: <strong className="text-black font-extrabold">{orderSuccess.orderNumber}</strong>
              </p>
              <p className="attiz-mono text-[11px] text-black/70 uppercase mb-6">
                Your order is confirmed and is being processed. Redirecting to your orders dashboard...
              </p>
              <div className="w-full bg-black/10 h-1.5 overflow-hidden">
                <div className="bg-black h-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        {/* CLEAN MINIMALIST STEP TABS */}
        <div className="mb-6 bg-white border border-black/10 p-1.5">
          <div className="grid grid-cols-3 gap-1.5">

            {/* Step 1: Address */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`py-2 px-2 sm:px-3 text-xs attiz-mono uppercase font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${currentStep === 1
                ? 'bg-black text-[#FFCB05]'
                : currentStep > 1
                  ? 'bg-black/5 text-black hover:bg-black/10'
                  : 'text-black/40'
                }`}
            >
              <span className="shrink-0">{currentStep > 1 ? <Check className="w-3.5 h-3.5 text-black" /> : '1.'}</span>
              <span className="truncate">Address</span>
            </button>

            {/* Step 2: Order Summary */}
            <button
              onClick={() => { if (currentStep > 1) setCurrentStep(2); }}
              disabled={currentStep < 2}
              className={`py-2 px-2 sm:px-3 text-xs attiz-mono uppercase font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-colors ${currentStep === 2
                ? 'bg-black text-[#FFCB05] cursor-pointer'
                : currentStep > 2
                  ? 'bg-black/5 text-black hover:bg-black/10 cursor-pointer'
                  : 'text-black/30 cursor-not-allowed'
                }`}
            >
              <span className="shrink-0">{currentStep > 2 ? <Check className="w-3.5 h-3.5 text-black" /> : '2.'}</span>
              <span className="truncate">Summary</span>
            </button>

            {/* Step 3: Payment */}
            <button
              onClick={() => { if (currentStep > 2) setCurrentStep(3); }}
              disabled={currentStep < 3}
              className={`py-2 px-2 sm:px-3 text-xs attiz-mono uppercase font-bold tracking-wider flex items-center justify-center space-x-1.5 transition-colors ${currentStep === 3
                ? 'bg-black text-[#FFCB05] cursor-pointer'
                : 'text-black/30 cursor-not-allowed'
                }`}
            >
              <span className="shrink-0">3.</span>
              <span className="truncate">Payment</span>
            </button>

          </div>
        </div>

        {/* MAIN STEP CONTENT CONTAINERS */}
        <div className="space-y-6">

          {/* STEP 1: ADDRESS & CONTACT */}
          {currentStep === 1 && (
            <div className="bg-white border border-black/15 p-5 sm:p-6 shadow-xs">
              <div className="border-b border-black/10 pb-3 mb-5 flex items-center justify-between">
                <h2 className="attiz-display text-base uppercase text-black flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-black/85" />
                  <span>Step 1: Shipping Address & Contact</span>
                </h2>
                <span className="attiz-mono text-[10px] text-black/60 uppercase">Required</span>
              </div>

              <form onSubmit={handleProceedFromStep1} className="space-y-4">

                {/* Contact phone section */}
                <div className="bg-[#FAF8F5] border border-black/10 p-3.5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs attiz-mono text-black ">
                    <User className="w-3.5 h-3.5 text-black/85 shrink-0" />
                    <span className="font-bold uppercase">{user?.first_name} {user?.last_name}</span>
                    <span className="text-black/60 lowercase">({user?.email})</span>
                  </div>

                  <div>
                    <label className="block attiz-mono text-[10px] font-bold text-black uppercase tracking-wider mb-1">
                      Mobile Phone Number <span className="text-[#E63B2E]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setAddressForm((prev) => ({ ...prev, phone: e.target.value }));
                        }}
                        className="w-full border border-black/25 p-2.5 pl-9 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black focus:bg-white"
                      />
                      <Phone className="w-3.5 h-3.5 text-black/60 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="updateProfilePhone"
                      checked={updateProfilePhone}
                      onChange={(e) => setUpdateProfilePhone(e.target.checked)}
                      className="w-3.5 h-3.5 border-black/30 text-black rounded-none cursor-pointer"
                    />
                    <label htmlFor="updateProfilePhone" className="attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider cursor-pointer">
                      Save/Update phone number in my account profile
                    </label>
                  </div>
                </div>

                {/* Saved address selection */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <label className="block attiz-mono text-[10px] font-bold text-black uppercase tracking-wider">
                      Saved Address Book
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr.id)}
                          className={`p-3 border cursor-pointer transition-all ${selectedAddressId === addr.id
                            ? 'border-black bg-[#FFCB05]/15'
                            : 'border-black/15 hover:border-black/50 bg-white'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="attiz-mono text-xs font-bold text-black uppercase">
                              {addr.recipient_name}
                            </span>
                            {addr.is_default && (
                              <span className="attiz-mono text-[8px] bg-black text-white px-1.5 py-0.2 font-bold uppercase">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="attiz-mono text-[9px] text-black/75 uppercase tracking-wide truncate">
                            {addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                        </div>
                      ))}

                      <div
                        onClick={() => handleSelectSavedAddress('new')}
                        className={`p-3 border border-dashed cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${selectedAddressId === 'new'
                          ? 'border-black bg-[#FFCB05]/15'
                          : 'border-black/30 hover:border-black bg-white'
                          }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span className="attiz-mono text-xs font-bold text-black uppercase">
                          Add New Address
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed address form fields */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                        Recipient Name <span className="text-[#E63B2E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.recipientName}
                        onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                        className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                        Delivery Phone <span className="text-[#E63B2E]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                      Street Address Line 1 <span className="text-[#E63B2E]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="House No, Building Name, Street"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, Landmark, Suite"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                        City <span className="text-[#E63B2E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                        State <span className="text-[#E63B2E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider mb-1">
                        PIN Code <span className="text-[#E63B2E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        className="w-full border border-black/25 p-2.5 attiz-mono text-xs uppercase font-bold text-black focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  {selectedAddressId === 'new' && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="saveAddressToBook"
                        checked={saveAddressToBook}
                        onChange={(e) => setSaveAddressToBook(e.target.checked)}
                        className="w-3.5 h-3.5 border-black/30 text-black rounded-none cursor-pointer"
                      />
                      <label htmlFor="saveAddressToBook" className="attiz-mono text-[10px] font-bold text-black/80 uppercase tracking-wider cursor-pointer">
                        Save this address to address book
                      </label>
                    </div>
                  )}
                </div>

                {step1Error && (
                  <div className="p-3 bg-red-50 border border-[#E63B2E] text-[#E63B2E] attiz-mono text-xs font-bold uppercase tracking-wider">
                    {step1Error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  <span>Continue to Order Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY REVIEW */}
          {currentStep === 2 && (
            <div className="bg-white border border-black/15 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                <h2 className="attiz-display text-base uppercase text-black flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-black/85" />
                  <span>Step 2: Review Order Summary</span>
                </h2>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="attiz-mono text-[10px] font-bold text-[#E63B2E] hover:text-black uppercase tracking-wider underline flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Address</span>
                </button>
              </div>

              {/* Delivery Address Summary Bar */}
              <div className="p-3.5 bg-[#FAF8F5] border border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs attiz-mono">
                <div>
                  <span className="font-bold text-black uppercase block">
                    Deliver To: {addressForm.recipientName} ({addressForm.phone || phone})
                  </span>
                  <span className="text-black/70 uppercase block text-[10px]">
                    {addressForm.addressLine1}, {addressForm.city}, {addressForm.state} - {addressForm.postalCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="attiz-mono text-[9px] text-black font-bold uppercase underline cursor-pointer shrink-0"
                >
                  Change Address
                </button>
              </div>

              {/* Minimal Cart Items Table */}
              <div className="divide-y divide-black/10 border-t border-b border-black/10 max-h-72 overflow-y-auto scrollbar-thin">
                {checkoutItems.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}-${idx}`} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-12 h-14 bg-[#F5F1E6] border border-black/10 overflow-hidden shrink-0">
                        <Image
                          src={item.image || '/placeholder.png'}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="attiz-mono text-xs font-bold text-black uppercase truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          {item.selectedSize && (
                            <span className="attiz-mono text-[9px] bg-black text-white px-1.5 py-0.2 font-bold uppercase">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.color && (
                            <span className="attiz-mono text-[9px] bg-black/10 px-1.5 py-0.2 text-black font-bold uppercase">
                              {item.color}
                            </span>
                          )}
                          <span className="attiz-mono text-[10px] font-bold text-black">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="attiz-mono text-xs font-black text-[#E63B2E] shrink-0">
                      ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-[#FAF8F5] border border-black/15 p-4 space-y-2 attiz-mono text-xs uppercase">
                <div className="flex justify-between text-black/70">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-black/70">
                  <span>Shipping Charge</span>
                  <span className="font-bold text-black">
                    {shippingCharge === 0 ? <span className="text-green-700 font-bold">FREE</span> : `₹${shippingCharge}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-black/10 flex justify-between items-center font-bold">
                  <span className="attiz-mono text-sm uppercase text-black">Grand Total</span>
                  <span className="attiz-mono text-lg text-[#E63B2E]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Estimated Delivery Expectation Card */}
              <div className="p-3 sm:p-3.5 bg-[#FAF8F5] border border-black/15 flex items-center space-x-2.5 sm:space-x-3 text-xs attiz-mono">
                <Truck className="w-5 h-5 text-[#E63B2E] shrink-0" />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="bg-[#FFCB05] text-black border border-black px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold tracking-widest uppercase shrink-0">
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

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-5 border border-black/30 bg-white text-black hover:bg-black/5 transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back to Address
                </button>

                <button
                  type="button"
                  onClick={handleProceedFromStep2}
                  className="grow py-3.5 px-6 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD & PLACE ORDER */}
          {currentStep === 3 && (
            <div className="bg-white border border-black/15 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                <h2 className="attiz-display text-base uppercase text-black flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-black/85" />
                  <span>Step 3: Select Payment & Confirm</span>
                </h2>
                <span className="attiz-mono text-[10px] text-black/60 uppercase">Final Step</span>
              </div>

              {/* Order Total Banner */}
              <div className="p-3.5 bg-black text-[#FFCB05] border border-black flex items-center justify-between text-xs attiz-mono uppercase">
                <div>
                  <span className="block font-bold text-white">Total Payable Amount</span>
                  <span className="text-[10px] text-white/70">Taxes and shipping included</span>
                </div>
                <span className="attiz-mono text-xl font-bold text-[#FFCB05]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Estimated Delivery Banner */}
              <div className="p-2.5 sm:p-3 bg-[#FAF8F5] border border-black/15 flex items-center space-x-2.5 sm:space-x-3 text-xs attiz-mono">
                <Truck className="w-4 h-4 text-[#E63B2E] shrink-0" />
                <span className="text-[10.5px] sm:text-xs font-bold text-black uppercase leading-tight">
                  Delivery Expected:{' '}
                  <span className="whitespace-nowrap">
                    <span className="text-[#E63B2E] font-extrabold">{deliveryRange.start}</span> to <span className="text-[#E63B2E] font-extrabold">{deliveryRange.end}</span>
                  </span>
                </span>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-2.5">
                <label className="block attiz-mono text-xs font-bold text-black uppercase tracking-wider">
                  Payment Mode
                </label>

                {/* COD */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start space-x-3 p-3.5 border cursor-pointer transition-colors ${paymentMethod === 'COD'
                    ? 'border-black bg-[#FFCB05]/15'
                    : 'border-black/15 hover:border-black/40 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5 w-4 h-4 border-black text-black cursor-pointer"
                  />
                  <div>
                    <span className="attiz-mono text-xs font-bold text-black uppercase block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="attiz-mono text-[10px] text-black/70 uppercase tracking-wide block mt-0.5">
                      Pay with cash upon doorstep delivery.
                    </span>
                  </div>
                </label>

                {/* Online Payment */}
                <label
                  onClick={() => setPaymentMethod('Online')}
                  className={`flex items-start space-x-3 p-3.5 border cursor-pointer transition-colors ${paymentMethod === 'Online'
                    ? 'border-black bg-[#FFCB05]/15'
                    : 'border-black/15 hover:border-black/40 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'Online'}
                    onChange={() => setPaymentMethod('Online')}
                    className="mt-0.5 w-4 h-4 border-black text-black cursor-pointer"
                  />
                  <div>
                    <span className="attiz-mono text-xs font-bold text-black uppercase block">
                      Online Payment / UPI / Cards
                    </span>
                    <span className="attiz-mono text-[10px] text-black/70 uppercase tracking-wide block mt-0.5">
                      Instant online payment via Google Pay, PhonePe, Cards, or NetBanking.
                    </span>
                  </div>
                </label>
              </div>

              {checkoutError && (
                <div className="p-3 bg-red-50 border border-[#E63B2E] text-[#E63B2E] attiz-mono text-xs font-bold uppercase tracking-wider">
                  {checkoutError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3 px-5 border border-black/30 bg-white text-black hover:bg-black/5 transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Back to Summary
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="grow py-4 px-6 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </span>
                  ) : (
                    <>
                      <span>Place Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Security & Guarantees Footer */}
        <div className="mt-8 pt-4 border-t border-black/10 flex flex-wrap items-center justify-center gap-6 text-[10px] attiz-mono text-black/60 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-black shrink-0" />
            <span>Doorstep Shipping Across India</span>
          </div>
        </div>

      </div>
    </div>
  );
}
