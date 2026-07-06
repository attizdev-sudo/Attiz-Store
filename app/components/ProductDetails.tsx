'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Plus, Minus, ChevronDown, Share2, Star, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import type { CartItem } from '@/lib/types';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { products, dbLoading } = useStore();

  const product = products.find((p) => p.id === id);
  const relatedProducts = products.filter((p) => p.category_id === product?.category_id && p.id !== product?.id).slice(0, 4);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeThumbIdx, setActiveThumbIdx] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({ description: true, specifications: false, washCare: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveThumbIdx(0);
    setQuantity(1);
    if (product?.sizes) {
      const sizes = product.sizes.split(',');
      if (sizes.length > 0) setSelectedSize(sizes[0].trim());
    }
    if (product?.colors) {
      const cols = product.colors.split(',');
      if (cols.length > 0) setSelectedColor(cols[0].trim());
    }
  }, [id, product]);

  const toggleAccordion = (section: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddToCart = () => {
    if (product) {
      const finalPrice = product.discount && product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;
      addToCart({ ...product, price: finalPrice, selectedSize, selectedColor, quantity } as CartItem);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const finalPrice = product.discount && product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;
      addToCart({ ...product, price: finalPrice, selectedSize, selectedColor, quantity } as CartItem);
      setTimeout(() => setIsCartOpen(true), 200);
    }
  };

  if (dbLoading && !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 text-brand-dark/45">
        <div className="w-8 h-8 rounded-full border-2 border-brand-brown border-t-transparent animate-spin" />
        <span className="font-sans text-xs font-bold tracking-widest uppercase">Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 text-brand-dark/45">
        <span className="font-sans text-xs font-bold tracking-widest uppercase">Product not found</span>
        <Link href="/" className="px-6 py-2.5 bg-brand-brown text-white text-[10px] font-bold tracking-widest uppercase rounded">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = !product.stock || product.stock <= 0;
  const sizesArray = product.sizes ? product.sizes.split(',').map((s) => s.trim()).filter(Boolean) : ['S', 'M', 'L', 'XL', 'XXL'];
  const colorsArray = product.colors ? product.colors.split(',').map((c) => c.trim()).filter(Boolean) : [];

  const thumbnails: string[] = [];
  if (product.image) thumbnails.push(product.image);
  if (product.images) {
    product.images.split(',').map((img) => img.trim()).filter(Boolean).forEach((img) => {
      if (!thumbnails.includes(img)) thumbnails.push(img);
    });
  } else if (product.image?.includes('unsplash.com')) {
    thumbnails.push(
      product.image + '&auto=format&fit=crop&w=600&q=70',
      product.image + '&auto=format&fit=crop&w=600&q=60',
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20">

          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col flex-row gap-3 md:w-24 w-full shrink-0">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveThumbIdx(idx)}
                  className={`relative w-20 aspect-3/4 border rounded-md overflow-hidden bg-brand-cream hover:opacity-100 transition-all cursor-pointer ${activeThumbIdx === idx ? 'border-brand-brown opacity-100 shadow-sm' : 'border-brand-cream-dark opacity-60'}`}
                >
                  <Image src={thumb} alt={`thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>

            <div
              className="flex-1 aspect-3/4 bg-brand-cream rounded-xl overflow-hidden border border-brand-cream-dark shadow-sm relative group cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => { setIsZoomed(false); setZoomPos({ x: 50, y: 50 }); }}
            >
              <img
                src={thumbnails[activeThumbIdx]}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-200 ease-out"
                style={{ transform: isZoomed ? 'scale(2.2)' : 'scale(1)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
              />
              {isOutOfStock ? (
                <div className="absolute inset-0 bg-brand-dark/45 backdrop-blur-xs flex items-center justify-center z-10">
                  <span className="px-6 py-3 bg-red-600 text-white font-sans text-[10px] font-bold tracking-[0.2em] rounded shadow-md uppercase">Out of Stock</span>
                </div>
              ) : (
                !isZoomed && (
                  <div className="absolute bottom-4 right-4 bg-white/90 px-2.5 py-1.5 rounded-md text-[9px] font-bold text-brand-dark tracking-wider border border-brand-cream-dark shadow-sm uppercase select-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Hover to Zoom
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <span className="font-sans text-[10px] font-bold tracking-[0.25em] text-brand-dark/45 uppercase mb-2">ATTIZ</span>
            <h1 className="font-sans text-[15px] font-bold tracking-widest uppercase mb-4 block">{product.title}</h1>
            <span className="font-sans text-[9px] font-bold text-brand-dark/40 tracking-widest uppercase mb-4 block">SKU: ATZTS-{product.id.slice(0, 5).toUpperCase()}</span>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-green-700 font-extrabold text-xs flex items-center gap-0.5 bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm shrink-0">
                    <span className="text-[10px]">↓</span>{product.discount}%
                  </span>
                  <span className="font-sans text-sm text-brand-dark/40 line-through shrink-0">
                    ₹{parseFloat(String(product.price)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xl font-extrabold text-brand-dark whitespace-nowrap">
                    ₹{Math.round(product.price * (1 - product.discount / 100)).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <div className="text-xl font-extrabold text-brand-brown">
                  ₹{parseFloat(String(product.price)).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {isOutOfStock && (
              <span className="inline-flex items-center space-x-1.5 text-[9px] font-bold text-red-600 tracking-wider uppercase mb-6 bg-red-50 border border-red-200 px-3 py-1 rounded w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span>Out of Stock</span>
              </span>
            )}

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Size Options</span>
                <button onClick={() => setIsSizeChartOpen(true)} className="text-[10px] font-bold text-brand-brown hover:text-brand-brown-dark tracking-wider underline uppercase cursor-pointer">SIZE CHART</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizesArray.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => !isOutOfStock && setSelectedSize(sz)}
                    disabled={isOutOfStock}
                    className={`w-12 h-10 border rounded text-[11px] font-bold tracking-wider transition-all ${isOutOfStock ? 'border-gray-200 text-gray-300 bg-gray-50/50 cursor-not-allowed' : selectedSize === sz ? 'border-brand-brown bg-brand-brown text-white shadow-sm' : 'border-brand-cream-dark text-brand-dark hover:border-brand-brown bg-white cursor-pointer'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {colorsArray.length > 0 && (
              <div className="mb-6">
                <span className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase mb-2">Color Options</span>
                <div className="flex flex-wrap gap-2">
                  {colorsArray.map((col) => (
                    <button
                      key={col}
                      onClick={() => !isOutOfStock && setSelectedColor(col)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2.5 border rounded text-[11px] font-bold tracking-wider transition-all cursor-pointer ${isOutOfStock ? 'border-gray-200 text-gray-300 bg-gray-50/50 cursor-not-allowed' : selectedColor === col ? 'border-brand-brown bg-brand-brown text-white shadow-sm' : 'border-brand-cream-dark text-brand-dark hover:border-brand-brown bg-white'}`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <span className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase mb-2">Quantity Selector</span>
              <div className={`flex items-center border rounded-md bg-white w-28 ${isOutOfStock ? 'border-gray-200 opacity-50' : 'border-brand-cream-dark'}`}>
                <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className={`p-2 px-3 text-brand-dark hover:text-brand-brown transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Minus className="w-3.5 h-3.5" /></button>
                <span className="font-sans text-xs font-bold px-3 text-brand-dark select-none grow text-center">{isOutOfStock ? 0 : quantity}</span>
                <button disabled={isOutOfStock} onClick={() => setQuantity((prev) => prev < (product.stock || 0) ? prev + 1 : prev)} className={`p-2 px-3 text-brand-dark hover:text-brand-brown transition-colors ${isOutOfStock ? 'cursor-not-allowed' : 'cursor-pointer'}`}><Plus className="w-3.5 h-3.5" /></button>
              </div>
              {!isOutOfStock && quantity >= (product.stock || 0) && (
                <span className="text-[9px] text-orange-600 font-bold tracking-wider mt-1 block">Maximum available stock reached.</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 mb-8">
              <button disabled={isOutOfStock} onClick={handleAddToCart} className={`w-full py-4 border rounded text-[11px] font-bold tracking-[0.25em] transition-all shadow-sm ${isOutOfStock ? 'border-gray-200 text-gray-400 bg-gray-50/50 cursor-not-allowed' : 'border-brand-dark hover:bg-brand-dark hover:text-white text-brand-dark bg-white hover:shadow cursor-pointer'}`}>
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
              <button disabled={isOutOfStock} onClick={handleBuyNow} className={`w-full py-4 rounded text-[11px] font-bold tracking-[0.25em] transition-all shadow-sm ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-brown hover:bg-brand-brown-dark text-white hover:shadow cursor-pointer'}`}>
                {isOutOfStock ? 'OUT OF STOCK' : 'BUY IT NOW'}
              </button>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="w-full py-3.5 bg-brand-dark hover:bg-black rounded text-[10px] font-bold tracking-[0.2em] text-white flex items-center justify-center space-x-2 transition-all cursor-pointer">
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 stroke-red-500' : ''}`} />
                <span>{isWishlisted ? 'ADDED TO WISHLIST' : 'ADD TO WISHLIST'}</span>
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-brand-cream-dark divide-y divide-brand-cream-dark">
              {([
                { key: 'description' as const, label: 'Style Description', content: product.description || 'Exquisitely tailored garment featuring premium organic fibers.' },
                { key: 'specifications' as const, label: 'Specifications', content: product.specifications },
                { key: 'washCare' as const, label: 'Wash Care Instructions', content: product.wash_care || 'Machine wash cold gentle cycle. Do not bleach.' },
              ] as const).map(({ key, label, content }) => (
                <div key={key} className="py-4">
                  <button onClick={() => toggleAccordion(key)} className="w-full flex justify-between items-center text-left text-xs font-bold tracking-widest text-brand-dark uppercase cursor-pointer">
                    <span>{label}</span>
                    <ChevronDown className={`w-4 h-4 text-brand-dark/45 transition-transform duration-300 ${accordionOpen[key] ? 'rotate-180' : ''}`} />
                  </button>
                  {accordionOpen[key] && (
                    <p className="mt-3 font-sans text-xs text-brand-dark/70 tracking-wider leading-relaxed text-justify">{content || 'Premium tailored garment with reinforced stitching.'}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-start space-x-2 text-brand-dark/45 hover:text-brand-brown cursor-pointer transition-colors w-max">
              <Share2 className="w-4 h-4" />
              <span className="font-sans text-[10px] font-bold tracking-widest uppercase">Share Product</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="py-16 border-t border-brand-cream-dark">
          <h3 className="font-serif text-xl font-light text-brand-dark text-center uppercase mb-10">CUSTOMER REVIEWS</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-brand-cream/5 border border-brand-cream-dark p-8 sm:p-12 rounded-xl mb-12">
            <div className="md:col-span-4 text-center border-r-0 md:border-r border-brand-cream-dark py-4 flex flex-col justify-center">
              <div className="flex items-center justify-center space-x-1 mb-2 text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}</div>
              <span className="block font-sans text-2xl font-bold text-brand-dark">5.00 out of 5</span>
              <span className="block font-sans text-[10px] text-brand-dark/45 font-semibold tracking-widest uppercase mt-1">Based on 3 reviews</span>
            </div>
            <div className="md:col-span-5 px-0 md:px-8 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center text-xs text-brand-dark/65 font-medium">
                  <span className="w-3 select-none">{stars}</span>
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current ml-0.5 mr-2 shrink-0" />
                  <div className="grow h-2 bg-brand-cream rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F6F74] transition-all duration-500" style={{ width: `${stars === 5 ? 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-[10px] text-brand-dark/45 font-bold ml-3">{stars === 5 ? 3 : 0}</span>
                </div>
              ))}
            </div>
            <div className="md:col-span-3 flex justify-center py-4">
              <button className="px-8 py-3.5 bg-[#1F6F74] hover:bg-[#154E52] text-white text-[10px] font-bold tracking-widest uppercase rounded shadow-sm cursor-pointer">Write a review</button>
            </div>
          </div>
          <div className="bg-white border border-brand-cream-dark/40 p-6 rounded-lg shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-1 text-yellow-500 mb-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</div>
                <span className="block font-sans text-xs font-bold text-brand-dark">Musthafa p. p</span>
                <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-[#1F6F74] uppercase tracking-wider mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Buyer</span>
                </span>
              </div>
              <span className="font-sans text-[10px] text-brand-dark/45 font-semibold">05/20/2026</span>
            </div>
            <h4 className="font-sans text-xs font-bold text-brand-dark mb-1">Super</h4>
            <p className="font-sans text-xs text-brand-dark/70 tracking-wider leading-relaxed">Super product. Worth for money. The fit is absolute elegance, and the fabric is incredibly soft.</p>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t border-brand-cream-dark">
            <h3 className="font-serif text-lg text-brand-dark text-center uppercase mb-8">YOU MAY ALSO LIKE</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="group flex flex-col cursor-pointer bg-white overflow-hidden border border-brand-cream-dark rounded-lg hover:shadow-md transition-shadow duration-300">
                  <Link href={`/product/${prod.id}`} className="flex flex-col h-full">
                    <div className="relative aspect-3/4 bg-brand-cream overflow-hidden">
                      <Image src={prod.image} alt={prod.title} fill className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 640px) 100vw, 25vw" />
                    </div>
                    <div className="pt-4 pb-5 px-3 flex flex-col text-center sm:text-left grow justify-between border-t border-brand-cream-dark/50">
                      <h4 className="font-sans text-[11px] sm:text-xs font-semibold tracking-wider text-brand-dark hover:text-brand-brown transition-colors duration-300 line-clamp-1">{prod.title}</h4>
                      <div className="flex items-center mt-2 flex-wrap gap-1.5">
                        {prod.discount && prod.discount > 0 ? (
                          <>
                            <span className="text-green-700 font-extrabold text-[10px] flex items-center shrink-0">
                              ↓{prod.discount}%
                            </span>
                            <span className="font-sans text-[10px] text-brand-dark/40 line-through shrink-0">
                              {parseFloat(String(prod.price)).toLocaleString('en-IN')}
                            </span>
                            <span className="font-sans text-xs font-bold text-brand-dark whitespace-nowrap">
                              ₹{Math.round(prod.price * (1 - prod.discount / 100)).toLocaleString('en-IN')}
                            </span>
                          </>
                        ) : (
                          <span className="font-sans text-xs font-bold text-brand-brown">₹{parseFloat(String(prod.price)).toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Size chart lightbox */}
        {isSizeChartOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/65 backdrop-blur-xs">
            <div className="relative bg-white border border-brand-cream-dark rounded-xl max-w-xl w-full p-6 shadow-2xl">
              <button onClick={() => setIsSizeChartOpen(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-brand-cream flex items-center justify-center shadow-sm text-brand-dark hover:text-brand-brown cursor-pointer font-bold text-xs">✕</button>
              <h3 className="font-serif text-xs font-bold text-brand-dark uppercase tracking-[0.2em] mb-4">Size Chart & Measurements</h3>
              <div className="relative aspect-4/3 bg-brand-cream rounded-lg overflow-hidden border border-brand-cream-dark">
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
