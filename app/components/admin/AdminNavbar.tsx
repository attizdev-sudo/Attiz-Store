'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X, ClipboardList, LogOut, Heart, Store, User, Database, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [isNavigatingOrders, setIsNavigatingOrders] = useState(false);
  const [isNavigatingWishlist, setIsNavigatingWishlist] = useState(false);

  const { user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigatingOrders(false);
    setIsNavigatingWishlist(false);
    setIsMobileProfileOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  const handleNavigateOrders = () => {
    setIsNavigatingOrders(true);
    router.push('/orders');
  };

  const handleNavigateWishlist = () => {
    setIsNavigatingWishlist(true);
    router.push('/wishlist');
  };

  if (!user) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-black/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">

            {/* ── MOBILE HEADER (Hamburger & Logo Left, Profile Icon Right) ── */}
            <div className="md:hidden flex items-center justify-between w-full">
              {/* Left Group (Hamburger & Brand Logo) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    setIsMobileProfileOpen(false);
                  }}
                  className="text-black/95 hover:text-black p-1.5 -ml-1 cursor-pointer"
                  aria-label="Toggle admin menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push('/admin')}>
                  <Image
                    src="/ATTIZ.png"
                    alt="ATTIZ Admin"
                    width={90}
                    height={36}
                    style={{ width: 'auto', height: '1.9rem' }}
                    className="object-contain"
                    priority
                  />
                  <span className="bg-[#111111] text-[#FFCB05] text-[8px] attiz-mono font-bold tracking-widest px-1.5 py-0.5 uppercase border border-black shadow-[1px_1px_0_0_#111111]">
                    Admin
                  </span>
                </div>
              </div>

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
                <div className="w-7.5 h-7.5 bg-[#FFCB05] border-2 border-black flex items-center justify-center shadow-[1px_1px_0_0_#111111]">
                  <User className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
              </button>
            </div>

            {/* ── DESKTOP HEADER BAR (Logo Left, Center Status, Right Profile) ── */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Brand Logo & Admin Badge */}
              <div className="shrink-0 flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/admin')}>
                <Image
                  src="/ATTIZ.png"
                  alt="ATTIZ Admin"
                  width={120}
                  height={48}
                  style={{ width: 'auto', height: '2.5rem' }}
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  priority
                />
                <span className="bg-[#111111] text-[#FFCB05] text-[9px] attiz-mono font-bold tracking-widest px-2.5 py-1 uppercase border border-black shadow-[2px_2px_0_0_#111111]">
                  Admin Panel
                </span>
              </div>

              {/* Center Navigation Indicator - Desktop */}
              <div className="flex items-center space-x-2 bg-black/5 border border-black/15 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="attiz-mono text-[11px] font-bold tracking-widest text-black/80 uppercase">
                  Management Console
                </span>
              </div>

              {/* Right Utilities - Desktop */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1 text-[11px] attiz-mono font-bold tracking-wider text-black/90 cursor-pointer">
                  <span>INR (₹) | India</span>
                  <ChevronDown className="w-3 h-3" />
                </div>

                {/* Admin User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1 attiz-mono text-xs font-bold tracking-widest text-[#E63B2E] hover:text-[#E63B2E]/80 transition-colors cursor-pointer uppercase border-b-2 border-dashed border-[#E63B2E]/30"
                  >
                    <span>{user.first_name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 border-2 border-black bg-[#FAF8F5] shadow-[4px_4px_0_0_#111111] z-50">
                      <div className="py-1" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                        <button
                          onClick={() => { setIsProfileDropdownOpen(false); router.push('/'); }}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/95 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer"
                        >
                          <Store className="w-3.5 h-3.5 text-[#E63B2E]" />
                          <span>User Storefront</span>
                        </button>

                        <button
                          onClick={handleNavigateOrders}
                          disabled={isNavigatingOrders}
                          className="w-full text-left flex items-center justify-between px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/75 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer disabled:opacity-80"
                        >
                          <div className="flex items-center space-x-2">
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>My Orders</span>
                          </div>
                          {isNavigatingOrders && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E63B2E]" />
                          )}
                        </button>

                        <button
                          onClick={handleNavigateWishlist}
                          disabled={isNavigatingWishlist}
                          className="w-full text-left flex items-center justify-between px-4 py-2.5 attiz-mono text-[11px] font-bold text-black/75 hover:bg-black/5 hover:text-black tracking-wider transition-colors cursor-pointer disabled:opacity-80"
                        >
                          <div className="flex items-center space-x-2">
                            <Heart className="w-3.5 h-3.5 text-[#E63B2E]" />
                            <span>My Wishlist</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {wishlistItems.length > 0 && (
                              <span className="bg-[#E63B2E] text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                                {wishlistItems.length}
                              </span>
                            )}
                            {isNavigatingWishlist && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E63B2E]" />
                            )}
                          </div>
                        </button>

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
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── LEFT ADMIN NAVIGATION SIDEBAR (Portal Full-Screen Viewport Slide-over) ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex justify-start">
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
                <span className="attiz-mono text-xs font-bold text-white uppercase tracking-wider">
                  Admin Navigation
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-[#E63B2E] text-white transition-colors border border-white/20 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sidebar Links Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="divide-y divide-black/10 border-2 border-black bg-white shadow-[4px_4px_0_0_#111111]">
                  <button
                    onClick={() => { router.push('/'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/95 hover:bg-black/5 transition-colors cursor-pointer uppercase text-left"
                  >
                    <Store className="w-4.5 h-4.5 shrink-0 text-[#E63B2E]" />
                    <span>User Storefront</span>
                  </button>
                  <button
                    onClick={() => { router.push('/admin'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/95 hover:bg-black/5 transition-colors cursor-pointer uppercase text-left"
                  >
                    <Database className="w-4.5 h-4.5 shrink-0 text-black/60" />
                    <span>Admin Console</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t-2 border-black bg-[#111111] text-white flex items-center justify-between shrink-0">
                <span className="attiz-mono text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  INR (₹) | India
                </span>
                <span className="attiz-mono text-[9px] font-bold text-[#FFCB05] uppercase tracking-widest">
                  ATTIZ Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RIGHT ACCOUNT & PREFERENCES SIDEBAR (Portal Full-Screen Viewport Slide-over) ── */}
      {isMobileProfileOpen && (
        <div className="md:hidden fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop Page Blur Overlay */}
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
                  aria-label="Close profile menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sidebar Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div className="space-y-4">
                  {/* Profile User Card */}
                  <div className="p-4 bg-[#111111] border-2 border-black shadow-[4px_4px_0_0_#FFCB05] flex items-center space-x-3.5">
                    <div className="w-10 h-10 bg-[#FFCB05] border-2 border-black flex items-center justify-center shrink-0">
                      <span className="attiz-display text-lg font-bold text-black">
                        {user.first_name?.[0]?.toUpperCase() ?? 'A'}
                      </span>
                    </div>
                    <div className="min-w-0 grow">
                      <p className="attiz-display text-sm tracking-wider text-white truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <span className="attiz-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 inline-block mt-0.5 bg-[#E63B2E] text-white">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Action Items List */}
                  <div className="divide-y divide-black/10 border-2 border-black bg-white shadow-[4px_4px_0_0_#111111]">
                    <button
                      onClick={() => { router.push('/'); setIsMobileProfileOpen(false); }}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/95 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left"
                    >
                      <Store className="w-4.5 h-4.5 shrink-0 text-[#E63B2E]" />
                      <span>User Storefront</span>
                    </button>

                    <button
                      onClick={handleNavigateOrders}
                      disabled={isNavigatingOrders}
                      className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/80 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left disabled:opacity-80"
                    >
                      <div className="flex items-center gap-3.5">
                        <ClipboardList className="w-4.5 h-4.5 shrink-0 text-black/60" />
                        <span>My Orders</span>
                      </div>
                      {isNavigatingOrders ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#E63B2E] stroke-[2.5]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-black/40" />
                      )}
                    </button>

                    <button
                      onClick={handleNavigateWishlist}
                      disabled={isNavigatingWishlist}
                      className="w-full flex items-center justify-between px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-black/80 hover:bg-black/5 hover:text-black transition-colors cursor-pointer uppercase text-left disabled:opacity-80"
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
                        {isNavigatingWishlist ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#E63B2E] stroke-[2.5]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-black/40" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => { setIsMobileProfileOpen(false); logout().then(() => router.push('/')); }}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 attiz-mono text-xs font-bold tracking-wider text-[#E63B2E] hover:bg-red-50 transition-colors cursor-pointer uppercase text-left"
                    >
                      <LogOut className="w-4.5 h-4.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t-2 border-black bg-white flex items-center justify-between shrink-0">
                <span className="attiz-mono text-[10px] font-bold text-black/60 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  INR (₹) | India
                </span>
                <span className="attiz-mono text-[9px] font-bold text-black/35 uppercase tracking-widest">
                  ATTIZ Admin
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
