'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ClipboardList, Database, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<any>(null);

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
  const router = useRouter();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const parentCategories = categories.filter(c => !c.parent_id);
  const showScroll = parentCategories.length > 6;

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'COLLECTIONS', href: '#', hasDropdown: true },
    { name: 'ABOUT US', href: '/about' },
    { name: 'CONTACT US', href: '/contact' },
    ...(user ? [{ name: 'TRACK ORDERS', href: '/orders' }] : []),
  ];

  const handleNavClick = (e: React.MouseEvent, item: { name: string; href: string }) => {
    if (item.href.startsWith('#')) return;
    e.preventDefault();
    setActiveTab(item.name);
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">

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
          <nav className="hidden lg:flex space-x-8">
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
                  className={`attiz-mono text-[13px] font-bold tracking-widest transition-colors duration-300 py-2 flex items-center space-x-1 ${
                    activeTab === item.name
                      ? 'text-[#E63B2E] border-b-2 border-[#E63B2E]'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && (
                    <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${isCollectionsHovered ? 'rotate-180' : ''}`} />
                  )}
                </a>

                {item.hasDropdown && (
                  <div className={`absolute top-full left-4 right-4 mt-1 bg-white border-2 border-black shadow-[6px_6px_0_0_#111111] transition-all duration-300 transform z-50 p-6 ${
                    isCollectionsHovered 
                      ? 'opacity-100 visible translate-y-0' 
                      : 'opacity-0 invisible translate-y-2 pointer-events-none'
                  }`}>
                    <div className={showScroll
                      ? "flex flex-row overflow-x-auto gap-8 pb-2 scrollbar-thin scrollbar-thumb-[#E63B2E]/20 scrollbar-track-transparent"
                      : `grid gap-6 w-full ${
                          parentCategories.length === 1 ? 'grid-cols-1' :
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
                                className="attiz-mono text-[11px] font-bold tracking-widest text-black/55 hover:text-black uppercase text-left w-full transition-colors cursor-pointer"
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

          {/* Right Utilities */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-1 text-[11px] attiz-mono font-bold tracking-wider text-black/70 hover:text-black cursor-pointer transition-colors duration-300">
              <span>INR (₹) | India</span>
              <ChevronDown className="w-3 h-3" />
            </div>

            <button className="text-black/75 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer">
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* User Profile */}
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
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setIsProfileDropdownOpen(false); router.push('/admin'); }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/75 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer"
                          >
                            <Database className="w-3.5 h-3.5" />
                            <span>Admin Console</span>
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
                  className="text-black/75 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer"
                  title="Sign In"
                >
                  <User className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-black/75 hover:text-black hover:bg-black/5 transition-all duration-200 p-1.5 cursor-pointer"
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

          {/* Hamburger - Mobile */}
          <div className="lg:hidden flex items-center space-x-4">
            <button className="text-black/75 hover:text-black p-1.5">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative text-black/75 hover:text-black p-1.5">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#E63B2E] border border-black rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black/75 hover:text-black p-1.5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-black bg-[#FAF8F5]">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navItems.map((item) => (
              <div key={item.name} className="space-y-1">
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}
                      className="w-full flex items-center justify-between py-2.5 attiz-display text-base tracking-wider text-black cursor-pointer uppercase"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMobileCollectionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileCollectionsOpen && (
                      <div className="pl-4 border-l-2 border-black/15 space-y-3 mt-1 pb-2">
                        {parentCategories.map((parent) => (
                          <div key={parent.id} className="space-y-1.5">
                            <button
                              onClick={() => { router.push(`/?category=${parent.id}`); setIsMobileMenuOpen(false); }}
                              className="text-[12px] font-bold tracking-widest text-[#E63B2E] uppercase text-left block w-full py-1 cursor-pointer"
                            >
                              {parent.name}
                            </button>
                            <div className="pl-3 flex flex-col space-y-1.5 border-l border-black/10">
                              {categories.filter(c => c.parent_id === parent.id).map((secondary) => (
                                <button
                                  key={secondary.id}
                                  onClick={() => { router.push(`/?category=${secondary.id}`); setIsMobileMenuOpen(false); }}
                                  className="text-[11px] font-bold tracking-widest text-black/60 hover:text-black uppercase text-left block w-full py-0.5 cursor-pointer"
                                >
                                  {secondary.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`block py-2.5 attiz-mono text-[12px] font-bold tracking-widest uppercase transition-colors ${activeTab === item.name ? 'text-[#E63B2E]' : 'text-black/80 hover:text-black'}`}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            {/* ── Mobile User Section ── */}
            <div className="pt-4 border-t-2 border-black/10 space-y-2">
              <span className="attiz-mono text-[9px] font-bold text-black/35 uppercase tracking-widest block">INR (₹) | India</span>

              {user ? (
                <div className="border-2 border-black bg-white shadow-[3px_3px_0_0_#111111] overflow-hidden">
                  {/* Profile header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#111111]">
                    <div className="w-9 h-9 bg-[#FFCB05] border-2 border-[#FFCB05] flex items-center justify-center shrink-0">
                      <span className="attiz-display text-base font-bold text-black">
                        {user.first_name?.[0]?.toUpperCase() ?? 'U'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="attiz-display text-[13px] tracking-wider text-white truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <span className={`attiz-mono text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 inline-block mt-0.5 ${user.role === 'admin' ? 'bg-[#E63B2E] text-white' : 'bg-[#FFCB05] text-black'}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Action links */}
                  <div className="divide-y divide-black/10">
                    <button
                      onClick={() => { router.push('/orders'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 attiz-mono text-[11px] font-bold tracking-wider text-black/80 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                    >
                      <ClipboardList className="w-4 h-4 shrink-0 text-black/40" />
                      <span>My Orders</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => { router.push('/admin'); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 attiz-mono text-[11px] font-bold tracking-wider text-black/80 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                      >
                        <Database className="w-4 h-4 shrink-0 text-black/40" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <button
                      onClick={() => { setIsMobileMenuOpen(false); logout().then(() => router.push('/')); }}
                      className="w-full flex items-center gap-3 px-4 py-3 attiz-mono text-[11px] font-bold tracking-wider text-[#E63B2E] hover:bg-red-50 transition-colors cursor-pointer uppercase text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}
                    className="py-3 border-[3px] border-black bg-white text-black attiz-mono text-[10px] font-bold tracking-widest uppercase shadow-[3px_3px_0_0_#111111] hover:bg-black hover:text-white transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { router.push('/signup'); setIsMobileMenuOpen(false); }}
                    className="py-3 border-[3px] border-black bg-black text-[#FFCB05] attiz-mono text-[10px] font-bold tracking-widest uppercase shadow-[3px_3px_0_0_#E63B2E] hover:bg-white hover:text-black transition-all cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

