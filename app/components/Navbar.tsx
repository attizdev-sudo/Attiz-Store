'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ClipboardList, Database, LogOut, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
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

  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { categories } = useStore();
  const { wishlistItems } = useWishlist();
  const router = useRouter();

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
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">

            {/* ── MOBILE HEADER BAR (Hamburger & Logo Left, Search, Cart & Profile Right) ── */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Left Utilities (Hamburger & Brand Logo) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    setIsMobileProfileOpen(false);
                  }}
                  className="text-black/95 hover:text-black p-1.5 -ml-1 cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                  <Image
                    src="/ATTIZ.png"
                    alt="ATTIZ Logo"
                    width={100}
                    height={40}
                    style={{ width: 'auto', height: '2.2rem' }}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Right Utilities (Search, Cart, Profile Icon at Far Right) */}
              <div className="flex items-center space-x-2">
                <button className="text-black/95 hover:text-black p-1.5 cursor-pointer" title="Search">
                  <Search className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative text-black/95 hover:text-black p-1.5 cursor-pointer"
                  title="Shopping Bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-[#E63B2E] border border-black rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Profile Icon Button (Far Right) */}
                <button
                  onClick={() => {
                    setIsMobileProfileOpen(!isMobileProfileOpen);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-1.5 text-black/95 hover:text-black transition-colors cursor-pointer relative"
                  aria-label="Account & Preferences"
                  title="Account & Preferences"
                >
                  {user ? (
                    <div className="w-7.5 h-7.5 bg-[#FFCB05] border-2 border-black flex items-center justify-center shadow-[1px_1px_0_0_#111111]">
                      <User className="w-4 h-4 text-black stroke-[2.5]" />
                    </div>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
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

                <button className="text-black/75 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer">
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

      {/* ── LEFT NAVIGATION SIDEBAR (Portal Full-Screen Viewport Slide-over) ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] flex justify-start">
          {/* Backdrop Page Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Full Screen Height Sidebar Drawer Panel */}
          <div className="relative z-[10000] w-[82vw] max-w-[340px] h-[100dvh] h-screen bg-[#FAF8F5] border-r-2 border-black flex flex-col justify-between shadow-[10px_0_30px_rgba(0,0,0,0.4)] animate-slideRight overflow-hidden">

            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b-2 border-black shrink-0">
                <div className="flex items-center space-x-2">
                  <Image
                    src="/ATTIZ.png"
                    alt="ATTIZ Logo"
                    width={85}
                    height={34}
                    style={{ width: 'auto', height: '1.8rem' }}
                  />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-[#E63B2E] text-white transition-colors border border-white/20 cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sidebar Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <span className="attiz-mono text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] block px-1">
                  Site Menu
                </span>
                <div className="divide-y divide-black/10 border-2 border-black bg-white shadow-[4px_4px_0_0_#111111]">
                  {navItems.map((item) => (
                    <div key={item.name}>
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer text-left ${isMobileCollectionsOpen ? 'text-[#E63B2E] bg-black/5' : 'text-black/90 hover:bg-black/5'
                              }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{item.name}</span>
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileCollectionsOpen ? 'rotate-180 text-[#E63B2E]' : 'text-black/50'}`} />
                          </button>

                          {/* Collections Accordion */}
                          {isMobileCollectionsOpen && (
                            <div className="bg-[#FAF8F5] px-4 py-3 border-t border-black/10 space-y-3 max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-black/20">
                              {parentCategories.map((parent) => {
                                const isExpanded = expandedParentIds.includes(parent.id);
                                const subCats = categories.filter((c) => c.parent_id === parent.id);
                                const hasSubCats = subCats.length > 0;

                                return (
                                  <div key={parent.id} className="border-b border-black/5 pb-2.5 last:border-b-0 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <button
                                        onClick={() => {
                                          if (hasSubCats) {
                                            toggleParentCategory(parent.id);
                                          } else {
                                            router.push(`/?category=${parent.id}`);
                                            setIsMobileMenuOpen(false);
                                          }
                                        }}
                                        className="flex items-center gap-2 attiz-mono text-[11px] font-bold tracking-wider text-black hover:text-[#E63B2E] uppercase text-left py-1 cursor-pointer grow"
                                      >
                                        <span>{parent.name}</span>
                                        {hasSubCats && (
                                          <ChevronDown
                                            className={`w-3.5 h-3.5 text-black/50 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#E63B2E]' : ''
                                              }`}
                                          />
                                        )}
                                      </button>

                                      <button
                                        onClick={() => {
                                          router.push(`/?category=${parent.id}`);
                                          setIsMobileMenuOpen(false);
                                        }}
                                        className="attiz-mono text-[9px] font-bold text-[#E63B2E] uppercase tracking-wider px-2 py-0.5 border border-[#E63B2E]/30 hover:bg-[#E63B2E] hover:text-white transition-colors cursor-pointer shrink-0"
                                      >
                                        View All
                                      </button>
                                    </div>

                                    {hasSubCats && isExpanded && (
                                      <div className="pl-3 border-l-2 border-[#E63B2E]/40 space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-black/20">
                                        {subCats.map((secondary) => (
                                          <button
                                            key={secondary.id}
                                            onClick={() => {
                                              router.push(`/?category=${secondary.id}`);
                                              setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left py-1 attiz-mono text-[11px] font-medium tracking-wider text-black/75 hover:text-black uppercase cursor-pointer block transition-colors"
                                          >
                                            {secondary.name}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <a
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item)}
                          className={`block px-4 py-3.5 attiz-mono text-xs font-bold tracking-widest uppercase transition-colors hover:bg-black/5 ${activeTab === item.name ? 'text-[#E63B2E] bg-black/5' : 'text-black/90'
                            }`}
                        >
                          {item.name}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t-2 border-black bg-white flex items-center justify-between shrink-0">
                <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  INR (₹) | India
                </span>
                <span className="attiz-mono text-[9px] font-bold text-black/35 uppercase tracking-widest">
                  ATTIZ® Store
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── RIGHT ACCOUNT & PREFERENCES SIDEBAR (Portal Full-Screen Viewport Slide-over) ── */}
      {isMobileProfileOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] flex justify-end">
          {/* Page Blur & Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn cursor-pointer"
            onClick={() => setIsMobileProfileOpen(false)}
          />

          {/* Full Screen Height Sidebar Drawer Panel */}
          <div className="relative z-[10000] w-[82vw] max-w-[340px] h-[100dvh] h-screen bg-[#FAF8F5] border-l-2 border-black flex flex-col justify-between shadow-[-10px_0_30px_rgba(0,0,0,0.4)] animate-slideLeft overflow-hidden">

            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b-2 border-black shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFCB05]" />
                  <span className="attiz-mono text-xs font-bold tracking-wider uppercase text-white">
                    Account & Preferences
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-[#E63B2E] text-white transition-colors border border-white/20 cursor-pointer"
                  aria-label="Close profile sidebar"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sidebar Main Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {user ? (
                  <div className="space-y-4">
                    {/* User Profile Card */}
                    <div className="p-4 bg-[#111111] border-2 border-black shadow-[4px_4px_0_0_#FFCB05] flex items-center space-x-3.5">
                      <div className="w-10 h-10 bg-[#FFCB05] border-2 border-black flex items-center justify-center shrink-0">
                        <span className="attiz-display text-lg font-bold text-black">
                          {user.first_name?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                      <div className="min-w-0 grow">
                        <p className="attiz-display text-sm tracking-wider text-white truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        {user.email && (
                          <p className="attiz-mono text-[10px] text-white/60 truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Navigation Items */}
                    <div className="divide-y divide-black/10 border-2 border-black bg-white shadow-[4px_4px_0_0_#111111]">
                      <button
                        onClick={() => { router.push('/orders'); setIsMobileProfileOpen(false); }}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/85 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                      >
                        <ClipboardList className="w-4.5 h-4.5 shrink-0 text-black/60" />
                        <span>My Orders</span>
                      </button>

                      <button
                        onClick={() => { router.push('/wishlist'); setIsMobileProfileOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/85 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <Heart className="w-4.5 h-4.5 shrink-0 text-[#E63B2E]" />
                          <span>My Wishlist</span>
                        </div>
                        {wishlistItems.length > 0 && (
                          <span className="bg-[#E63B2E] text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                            {wishlistItems.length}
                          </span>
                        )}
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => { router.push('/admin'); setIsMobileProfileOpen(false); }}
                          className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/95 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                        >
                          <Database className="w-4.5 h-4.5 shrink-0 text-black/60" />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      <button
                        onClick={() => { setIsMobileProfileOpen(false); logout().then(() => router.push('/')); }}
                        className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-[#E63B2E] hover:bg-red-50 transition-colors cursor-pointer uppercase text-left"
                      >
                        <LogOut className="w-4.5 h-4.5 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <p className="attiz-mono text-xs text-black/60 font-semibold tracking-wider">
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

              {/* Sidebar Bottom Footer */}
              <div className="p-4 border-t-2 border-black bg-white flex items-center justify-between shrink-0">
                <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  INR (₹) | India
                </span>
                <span className="attiz-mono text-[9px] font-bold text-black/35 uppercase tracking-widest">
                  ATTIZ® Account
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
