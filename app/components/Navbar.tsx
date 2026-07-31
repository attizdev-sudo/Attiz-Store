'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, ChevronDown, ChevronRight, Menu, X, ClipboardList, Database, LogOut, Heart, Home, LayoutGrid, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeBottomNavTab, setActiveBottomNavTab] = useState<'home' | 'collections' | 'search' | 'cart' | 'account' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParentIds, setExpandedParentIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('HOME');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<any>(null);

  const toggleParentCategory = (parentId: string) => {
    setExpandedParentIds((prev) =>
      prev.includes(parentId) ? prev.filter((id) => id !== parentId) : [...prev, parentId]
    );
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setIsCollectionsHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsCollectionsHovered(false);
    }, 180);
    setHoverTimeoutId(timeout);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveBottomNavTab('search');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProfileOpen(false);
    setIsCollectionsOpen(false);
    setIsCartOpen(false);
    router.push(`/?q=${encodeURIComponent(searchQuery.trim())}#catalog-grid`);
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-grid');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { categories, products } = useStore();
  const { wishlistItems } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  // Prevent background body scroll when any overlay or mobile drawer is open
  useEffect(() => {
    if (isCollectionsOpen || isCartOpen || isSearchOpen || isMobileProfileOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCollectionsOpen, isCartOpen, isSearchOpen, isMobileProfileOpen, isMobileMenuOpen]);

  const liveSearchResults = searchQuery.trim().length > 0
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase();
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catMatch = p.category?.name?.toLowerCase().includes(q);
        const colorMatch = p.product_variants?.some((v: any) => v.color?.toLowerCase().includes(q));
        return titleMatch || descMatch || catMatch || colorMatch;
      }).slice(0, 5)
    : [];

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const parentCategories = categories.filter(c => !c.parent_id);
  const showScroll = parentCategories.length > 6;

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'COLLECTIONS', href: '/#catalog-grid', hasDropdown: true },
    { name: 'ABOUT US', href: '/about' },
    { name: 'CONTACT US', href: '/contact' },
  ];

  const handleNavClick = (e: React.MouseEvent, item: { name: string; href: string }) => {
    if (item.href === '#') return;
    e.preventDefault();
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setIsCollectionsHovered(false);
    setActiveTab(item.name);
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[9999] bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-14 lg:h-20">

            {/* ── MOBILE HEADER BAR (Centered Brand Logo Only) ── */}
            <div className="lg:hidden flex items-center justify-center w-full">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Image
                  src="/ATTIZ.png"
                  alt="ATTIZ Logo"
                  width={110}
                  height={40}
                  style={{ width: 'auto', height: '2.2rem' }}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* ── DESKTOP HEADER BAR (Logo Left, Center Nav, Right Utilities) ── */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Brand Logo */}
              <div className="shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Image
                  src="/ATTIZ.png"
                  alt="ATTIZ Logo"
                  width={120}
                  height={48}
                  style={{ width: 'auto', height: '2.5rem' }}
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>

              {/* Center Nav - Desktop */}
              <nav className="flex space-x-8">
                {navItems.map((item) => (
                  <div
                    key={item.name}
                    className={`group flex items-center ${item.hasDropdown ? '' : 'relative'}`}
                    onMouseEnter={() => item.hasDropdown && handleMouseEnter()}
                    onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`attiz-mono text-[13px] font-bold tracking-widest transition-colors duration-300 py-2 flex items-center space-x-1 ${activeTab === item.name
                        ? 'text-[#E63B2E] border-b-2 border-[#E63B2E]'
                        : 'text-black/90 hover:text-black'
                        }`}
                    >
                      <span>{item.name}</span>
                      {item.hasDropdown && (
                        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${isCollectionsHovered ? 'rotate-180' : ''}`} />
                      )}
                    </a>

                    {item.hasDropdown && (
                      <div className={`absolute top-full left-4 right-4 mt-1 bg-white border-2 border-black shadow-[6px_6px_0_0_#111111] transition-all duration-300 transform z-50 p-6 ${isCollectionsHovered
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible translate-y-2 pointer-events-none'
                        }`}>
                        <div className={showScroll
                          ? "flex flex-row overflow-x-auto gap-8 pb-2 scrollbar-thin scrollbar-thumb-[#E63B2E]/20 scrollbar-track-transparent"
                          : `grid gap-6 w-full ${parentCategories.length === 1 ? 'grid-cols-1' :
                            parentCategories.length === 2 ? 'grid-cols-2' :
                              parentCategories.length === 3 ? 'grid-cols-3' :
                                parentCategories.length === 4 ? 'grid-cols-4' :
                                  parentCategories.length === 5 ? 'grid-cols-5' :
                                    'grid-cols-6'
                          }`
                        }>
                          {parentCategories.map((parent) => (
                            <div key={parent.id} className={`space-y-4 ${showScroll ? 'shrink-0 min-w-[180px]' : 'w-full'}`}>
                              <button
                                onClick={() => { setActiveTab('COLLECTIONS'); setIsCollectionsHovered(false); router.push(`/?category=${parent.id}`); }}
                                className="attiz-display text-base tracking-wider text-black hover:text-[#E63B2E] uppercase border-b-2 border-black/15 pb-2 w-full text-left transition-colors cursor-pointer"
                              >
                                {parent.name}
                              </button>
                              <div className="space-y-2.5 flex flex-col items-start max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#E63B2E]/25 scrollbar-track-transparent">
                                {categories.filter(c => c.parent_id === parent.id).map((secondary) => (
                                  <button
                                    key={secondary.id}
                                    onClick={() => { setActiveTab('COLLECTIONS'); setIsCollectionsHovered(false); router.push(`/?category=${secondary.id}`); }}
                                    className="attiz-mono text-[11px] font-bold tracking-widest text-black/85 hover:text-black uppercase text-left w-full transition-colors cursor-pointer"
                                  >
                                    {secondary.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Right Utilities - Desktop */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1 text-[11px] attiz-mono font-bold tracking-wider text-black/90 hover:text-black cursor-pointer transition-colors duration-300">
                  <span>INR (₹) | India</span>
                  <ChevronDown className="w-3 h-3" />
                </div>

                <button onClick={() => setIsSearchOpen(true)} className="text-black/75 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer" title="Search Catalog">
                  <Search className="w-4.5 h-4.5" />
                </button>

                {/* User Profile Dropdown - Desktop */}
                <div className="relative">
                  {user ? (
                    <div>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center space-x-1 attiz-mono text-xs font-bold tracking-widest text-[#E63B2E] hover:text-[#E63B2E]/80 transition-colors cursor-pointer uppercase border-b-2 border-dashed border-[#E63B2E]/30"
                      >
                        <span>{user.first_name}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 border-2 border-black bg-[#FAF8F5] shadow-[4px_4px_0_0_#111111] z-50">
                          <div className="py-1" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                            <button
                              onClick={() => { setIsProfileDropdownOpen(false); router.push('/orders'); }}
                              className="w-full text-left flex items-center space-x-2 px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/75 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>My Orders</span>
                            </button>
                            <button
                              onClick={() => { setIsProfileDropdownOpen(false); router.push('/wishlist'); }}
                              className="w-full text-left flex items-center justify-between px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/75 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-2">
                                <Heart className="w-3.5 h-3.5 text-[#E63B2E]" />
                                <span>My Wishlist</span>
                              </div>
                              {wishlistItems.length > 0 && (
                                <span className="bg-[#E63B2E] text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                                  {wishlistItems.length}
                                </span>
                              )}
                            </button>
                            {user.role === 'admin' && (
                              <button
                                onClick={() => { setIsProfileDropdownOpen(false); router.push('/admin'); }}
                                className="w-full text-left flex items-center space-x-2 px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/95 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer"
                              >
                                <Database className="w-3.5 h-3.5" />
                                <span>Admin Panel</span>
                              </button>
                            )}
                            <button
                              onClick={() => { setIsProfileDropdownOpen(false); logout(); router.push('/'); }}
                              className="w-full text-left flex items-center space-x-2 px-4 py-2.5 attiz-mono text-[11px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 tracking-wider transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="text-black/95 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer"
                      title="Sign In"
                    >
                      <User className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Cart */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-black/95 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer"
                  title="Shopping Cart"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-[#E63B2E] border border-black rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── MOBILE ACCOUNT & PREFERENCES PAGE VIEW OVERLAY (Dedicated Mobile Screen) ── */}
      {isMobileProfileOpen && (
        <div className="lg:hidden fixed top-[56px] left-0 right-0 bottom-[56px] z-[9980] bg-[#FAF8F5] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Main Scrollable Account & Preferences Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {user ? (
              <div className="space-y-4 max-w-md mx-auto">
                {/* User Branded Profile Card */}
                <div className="p-4 bg-[#111111] border-2 border-black shadow-[4px_4px_0_0_#FFCB05] flex items-center space-x-3.5">
                  <div className="w-12 h-12 bg-[#FFCB05] border-2 border-black flex items-center justify-center shrink-0">
                    <span className="attiz-display text-xl font-bold text-black">
                      {user.first_name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 grow">
                    <p className="attiz-display text-base tracking-wider text-white truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    {user.email && (
                      <p className="attiz-mono text-xs text-white/70 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Navigation Grid */}
                <div className="divide-y divide-black/10 border-2 border-black bg-white shadow-[4px_4px_0_0_#111111]">
                  <button
                    onClick={() => { router.push('/orders'); setIsMobileProfileOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/85 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <ClipboardList className="w-4.5 h-4.5 shrink-0 text-black/60" />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/40" />
                  </button>

                  <button
                    onClick={() => { router.push('/wishlist'); setIsMobileProfileOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/85 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <Heart className="w-4.5 h-4.5 shrink-0 text-[#E63B2E]" />
                      <span>My Wishlist</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {wishlistItems.length > 0 && (
                        <span className="bg-[#E63B2E] text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          {wishlistItems.length}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-black/40" />
                    </div>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { router.push('/admin'); setIsMobileProfileOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/95 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                    >
                      <div className="flex items-center gap-3.5">
                        <Database className="w-4.5 h-4.5 shrink-0 text-black/60" />
                        <span>Admin Panel</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black/40" />
                    </button>
                  )}

                  <button
                    onClick={() => { setIsMobileProfileOpen(false); logout().then(() => router.push('/')); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-[#E63B2E] hover:bg-red-50 transition-colors cursor-pointer uppercase text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <LogOut className="w-4.5 h-4.5 shrink-0" />
                      <span>Sign Out</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#E63B2E]/50" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto pt-4">
                <p className="attiz-mono text-xs text-black/70 font-semibold tracking-wider text-center">
                  Sign in to manage your orders, wishlist, and profile preferences.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => { router.push('/login'); setIsMobileProfileOpen(false); }}
                    className="w-full py-3.5 border-2 border-black bg-white text-black attiz-mono text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0_0_#111111] hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { router.push('/signup'); setIsMobileProfileOpen(false); }}
                    className="w-full py-3.5 border-2 border-black bg-black text-[#FFCB05] attiz-mono text-xs font-bold tracking-widest uppercase shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAVIGATION BAR (Home, Collections, Orders, Cart, Account) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9990] md:hidden bg-[#FAF8F5] border-t-2 border-black shadow-[0_-4px_16px_rgba(0,0,0,0.12)] px-2 py-1.5 flex items-center justify-around">
        {/* 1. Home */}
        <button
          onClick={() => {
            setActiveBottomNavTab('home');
            setSearchQuery('');
            setIsCartOpen(false);
            setIsCollectionsOpen(false);
            setIsSearchOpen(false);
            setIsMobileProfileOpen(false);
            if (pathname === '/' && typeof window !== 'undefined' && !window.location.search) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              router.push('/');
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all cursor-pointer ${
            activeBottomNavTab === 'home' || (!activeBottomNavTab && pathname === '/' && !isCollectionsOpen && !isSearchOpen && !isMobileProfileOpen && !isCartOpen)
              ? 'text-[#E63B2E] font-black scale-105'
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Home</span>
        </button>

        {/* 2. Collections (Opens Parent Category Cards Page) */}
        <button
          onClick={() => {
            setActiveBottomNavTab('collections');
            setIsCartOpen(false);
            setIsSearchOpen(false);
            setIsMobileProfileOpen(false);
            setIsCollectionsOpen(!isCollectionsOpen);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all cursor-pointer ${
            isCollectionsOpen || (activeBottomNavTab === 'collections' && !isCartOpen && !isSearchOpen && !isMobileProfileOpen)
              ? 'text-[#E63B2E] font-black scale-105'
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <LayoutGrid className="w-5 h-5 stroke-[2]" />
          <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Collections</span>
        </button>

        {/* 3. Search */}
        <button
          onClick={() => {
            if (activeBottomNavTab === 'search' && !isSearchOpen) {
              setIsSearchOpen(true);
            } else {
              setActiveBottomNavTab('search');
              setIsCartOpen(false);
              setIsCollectionsOpen(false);
              setIsMobileProfileOpen(false);
              setIsSearchOpen(!isSearchOpen);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all cursor-pointer ${
            isSearchOpen || (activeBottomNavTab === 'search' && !isCartOpen && !isCollectionsOpen && !isMobileProfileOpen)
              ? 'text-[#E63B2E] font-black scale-105'
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <Search className="w-5 h-5 stroke-[2]" />
          <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Search</span>
        </button>

        {/* 4. Cart */}
        <button
          onClick={() => {
            setActiveBottomNavTab('cart');
            setIsCollectionsOpen(false);
            setIsMobileProfileOpen(false);
            setIsSearchOpen(false);
            setIsCartOpen(!isCartOpen);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all relative cursor-pointer ${
            isCartOpen || activeBottomNavTab === 'cart' || (pathname === '/cart' && !isSearchOpen && !isCollectionsOpen && !isMobileProfileOpen)
              ? 'text-[#E63B2E] font-black scale-105'
              : 'text-black/75 hover:text-black font-bold'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-[#E63B2E] text-white border border-black rounded-full text-[9px] font-black attiz-mono flex items-center justify-center shadow-[1px_1px_0_0_#000]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Cart</span>
        </button>

        {/* 5. Account */}
        {user ? (
          <button
            onClick={() => {
              setActiveBottomNavTab('account');
              setIsCartOpen(false);
              setIsCollectionsOpen(false);
              setIsSearchOpen(false);
              setIsMobileProfileOpen(!isMobileProfileOpen);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all cursor-pointer ${
              isMobileProfileOpen || (activeBottomNavTab === 'account' && !isCartOpen && !isSearchOpen && !isCollectionsOpen)
                ? 'text-[#E63B2E] font-black scale-105'
                : 'text-black/75 hover:text-black font-bold'
            }`}
          >
            <User className="w-5 h-5 stroke-[2]" />
            <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Account</span>
          </button>
        ) : (
          <Link
            href="/login"
            onClick={() => {
              setActiveBottomNavTab('account');
              setIsCartOpen(false);
              setIsCollectionsOpen(false);
              setIsSearchOpen(false);
              setIsMobileProfileOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all cursor-pointer ${
              pathname === '/login' && !isSearchOpen && !isCollectionsOpen && !isCartOpen
                ? 'text-[#E63B2E] font-black scale-105'
                : 'text-black/75 hover:text-black font-bold'
            }`}
          >
            <User className="w-5 h-5 stroke-[2]" />
            <span className="attiz-mono text-[9px] uppercase tracking-wider mt-0.5 font-extrabold">Account</span>
          </Link>
        )}
      </nav>

      {/* ── MOBILE SEARCH PAGE VIEW OVERLAY (Dedicated Mobile Screen) ── */}
      {isSearchOpen && (
        <div className="fixed top-[56px] left-0 right-0 bottom-[56px] lg:top-20 lg:bottom-0 z-[9980] bg-[#FAF8F5] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Form & Input Header */}
          <div className="p-3.5 bg-white border-b-2 border-black shrink-0">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search t-shirts, polos, hoodies, colors..."
                  autoFocus
                  className="w-full bg-[#FAF8F5] border-2 border-black py-3 px-4 pr-24 attiz-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#FFCB05]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 py-1.5 px-3.5 bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold uppercase cursor-pointer border border-black"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Main Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Live Search Results */}
            {searchQuery.trim().length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-widest">
                    Matching Products ({liveSearchResults.length})
                  </span>
                  {liveSearchResults.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="attiz-mono text-[9px] font-bold text-[#E63B2E] uppercase hover:underline cursor-pointer"
                    >
                      View Grid Results →
                    </button>
                  )}
                </div>

                {liveSearchResults.length > 0 ? (
                  <div className="space-y-2">
                    {liveSearchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/product/${prod.id}`);
                        }}
                        className="flex items-center justify-between p-2.5 bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:shadow-[5px_5px_0_0_#E63B2E] hover:border-black transition-all cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-12 h-14 bg-[#FAF8F5] border border-black/20 shrink-0 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prod.image || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'}
                              alt={prod.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="attiz-mono text-xs font-bold text-black uppercase truncate group-hover:text-[#E63B2E] transition-colors">
                              {prod.title}
                            </h4>
                            {prod.category?.name && (
                              <span className="attiz-mono text-[9px] font-bold text-black/50 uppercase block mt-0.5">
                                {prod.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <span className="attiz-mono text-xs font-bold text-[#E63B2E]">
                            ₹{prod.price?.toLocaleString('en-IN')}
                          </span>
                          <div className="w-6 h-6 bg-black text-[#FFCB05] group-hover:bg-[#E63B2E] group-hover:text-white flex items-center justify-center border border-black transition-colors">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] text-center attiz-mono text-xs text-black/60 uppercase">
                    No matching products found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            ) : (
              /* Popular Searches & Quick Category Discovery */
              <div className="space-y-4">
                <div className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_#111111] space-y-2">
                  <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-widest block">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Oversized', 'Polo', 'Black', 'Acid Wash', 'Heavyweight', 'Graphic'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setActiveBottomNavTab('search');
                          setSearchQuery(tag);
                          setIsSearchOpen(false);
                          router.push(`/?q=${encodeURIComponent(tag)}#catalog-grid`);
                          setTimeout(() => {
                            const catalogEl = document.getElementById('catalog-grid');
                            if (catalogEl) {
                              catalogEl.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                        className="py-1 px-2.5 bg-[#FAF8F5] border border-black/20 hover:border-black hover:bg-black hover:text-[#FFCB05] text-black attiz-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Category Jump Grid */}
                <div className="space-y-2">
                  <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-widest block px-1">
                    Quick Category Search
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {parentCategories.slice(0, 4).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveBottomNavTab('search');
                          setIsSearchOpen(false);
                          router.push(`/?category=${cat.id}#catalog-grid`);
                        }}
                        className="p-3 bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:bg-[#FFCB05] text-left attiz-mono text-xs font-bold text-black uppercase transition-all cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE COLLECTIONS PAGE MODAL (Aesthetic 2 Per Row Cards) ── */}
      {isCollectionsOpen && (
        <div className="fixed top-[56px] left-0 right-0 bottom-[56px] lg:top-20 z-[9980] bg-[#FAF8F5] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Scrollable Categories Grid */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* View All Products Action Banner */}
            <button
              onClick={() => {
                setIsCollectionsOpen(false);
                if (pathname === '/') {
                  const catalogEl = document.getElementById('catalog-grid');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  router.push('/#catalog-grid');
                }
              }}
              className="w-full py-3 px-4 bg-[#FFCB05] border-2 border-black text-black attiz-mono text-xs font-black uppercase tracking-widest shadow-[3px_3px_0_0_#111111] hover:bg-black hover:text-[#FFCB05] transition-all flex items-center justify-between cursor-pointer"
            >
              <span>View Full Catalog Grid</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between px-1">
              <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-widest">
                Main Collections ({parentCategories.length})
              </span>
              <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] uppercase">
                Tap to view
              </span>
            </div>

            {/* Aesthetic 2-Per-Row Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {parentCategories.map((parent) => {
                const subCats = categories.filter((c) => c.parent_id === parent.id);
                return (
                  <div
                    key={parent.id}
                    onClick={() => {
                      setIsCollectionsOpen(false);
                      router.push(`/?category=${parent.id}#catalog-grid`);
                    }}
                    className="bg-white border-2 border-black p-3.5 shadow-[3px_3px_0_0_#111111] hover:shadow-[5px_5px_0_0_#E63B2E] hover:border-black transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[110px]"
                  >
                    {/* Top Accent Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-6 h-6 bg-[#FAF8F5] border border-black/20 flex items-center justify-center group-hover:bg-[#FFCB05] transition-colors">
                        <LayoutGrid className="w-3.5 h-3.5 text-black" />
                      </div>
                      <span className="attiz-mono text-[9px] font-black text-[#E63B2E] uppercase">
                        {subCats.length > 0 ? `${subCats.length} Styles` : 'Top Item'}
                      </span>
                    </div>

                    {/* Category Title & Info */}
                    <div>
                      <h3 className="attiz-mono text-sm font-black uppercase text-black group-hover:text-[#E63B2E] transition-colors leading-tight line-clamp-2">
                        {parent.name}
                      </h3>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 mt-2 border-t border-black/10 flex items-center justify-between">
                      <span className="attiz-mono text-[9px] font-bold text-black/60 group-hover:text-black uppercase">
                        Explore
                      </span>
                      <div className="w-5 h-5 bg-black text-[#FFCB05] group-hover:bg-[#E63B2E] group-hover:text-white flex items-center justify-center border border-black transition-colors">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Sub-Categories Section */}
            {categories.some(c => c.parent_id) && (
              <div className="pt-2 space-y-2">
                <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-widest block px-1">
                  Popular Sub-Categories
                </span>
                <div className="flex flex-wrap gap-1.5 bg-white border-2 border-black p-3 shadow-[3px_3px_0_0_#111111]">
                  {categories
                    .filter((c) => c.parent_id)
                    .map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setIsCollectionsOpen(false);
                          router.push(`/?category=${sub.id}#catalog-grid`);
                        }}
                        className="py-1 px-2.5 bg-[#FAF8F5] border border-black/20 hover:border-black hover:bg-black hover:text-[#FFCB05] text-black attiz-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {sub.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
