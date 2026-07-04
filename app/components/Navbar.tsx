'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ClipboardList, Database, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES_MAP } from '@/lib/categories';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'COLLECTIONS', href: '#', hasDropdown: true },
    { name: 'ABOUT US', href: '#' },
    { name: 'CONTACT US', href: '#' },
    { name: 'TRACK ORDERS', href: '/orders' },
  ];

  const handleNavClick = (e: React.MouseEvent, item: { name: string; href: string }) => {
    if (item.href.startsWith('#')) return;
    e.preventDefault();
    setActiveTab(item.name);
    router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-cream-dark transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => router.push('/')}>
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
              <div key={item.name} className={`group flex items-center ${item.hasDropdown ? '' : 'relative'}`}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`text-xs font-semibold tracking-widest transition-colors duration-300 py-2 flex items-center space-x-1 ${
                    activeTab === item.name
                      ? 'text-brand-brown border-b border-brand-brown'
                      : 'text-brand-dark hover:text-brand-brown'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </a>

                {item.hasDropdown && (
                  <div className="absolute top-full left-4 right-4 mt-1 rounded-xl shadow-xl bg-white border border-brand-cream-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 p-6">
                    <div className="grid grid-cols-5 gap-6">
                      {Object.keys(CATEGORIES_MAP).map((parent) => (
                        <div key={parent} className="space-y-4">
                          <button
                            onClick={() => { setActiveTab('COLLECTIONS'); router.push(`/?parent=${parent}`); }}
                            className="text-xs font-bold tracking-[0.2em] text-brand-brown hover:text-brand-brown-dark uppercase border-b border-brand-cream-dark pb-2 w-full text-left transition-colors cursor-pointer"
                          >
                            {parent}
                          </button>
                          <div className="space-y-2.5 flex flex-col items-start">
                            {CATEGORIES_MAP[parent].map((secondary) => (
                              <button
                                key={secondary}
                                onClick={() => { setActiveTab('COLLECTIONS'); router.push(`/?parent=${parent}&secondary=${secondary}`); }}
                                className="text-[10px] font-bold tracking-widest text-brand-dark/70 hover:text-brand-brown uppercase text-left w-full transition-colors cursor-pointer"
                              >
                                {secondary}
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
            <div className="flex items-center space-x-1 text-[11px] font-semibold tracking-wider text-brand-dark hover:text-brand-brown cursor-pointer transition-colors duration-300">
              <span>INR (₹) | India</span>
              <ChevronDown className="w-3 h-3" />
            </div>

            <button className="text-brand-dark hover:text-brand-brown transition-colors duration-300 p-1.5 rounded-full hover:bg-brand-cream/50 cursor-pointer">
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* User Profile */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1 text-[11px] font-bold tracking-widest text-brand-brown hover:text-brand-brown-dark transition-colors cursor-pointer uppercase border-b border-dashed border-brand-brown/50"
                  >
                    <span>{user.first_name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50">
                      <div className="py-1" onMouseLeave={() => setIsProfileDropdownOpen(false)}>
                        <button
                          onClick={() => { setIsProfileDropdownOpen(false); router.push('/orders'); }}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs text-brand-dark hover:bg-brand-cream hover:text-brand-brown tracking-wider"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>My Orders</span>
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setIsProfileDropdownOpen(false); router.push('/admin'); }}
                            className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs text-brand-dark hover:bg-brand-cream hover:text-brand-brown tracking-wider"
                          >
                            <Database className="w-3.5 h-3.5" />
                            <span>Admin Console</span>
                          </button>
                        )}
                        <button
                          onClick={() => { setIsProfileDropdownOpen(false); logout(); router.push('/'); }}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 tracking-wider"
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
                  onClick={() => router.push('/auth')}
                  className="text-brand-dark hover:text-brand-brown transition-colors duration-300 p-1.5 rounded-full hover:bg-brand-cream/50 cursor-pointer"
                  title="Sign In"
                >
                  <User className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-brand-dark hover:text-brand-brown transition-colors duration-300 p-1.5 rounded-full hover:bg-brand-cream/50 cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-brown rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Hamburger - Mobile */}
          <div className="lg:hidden flex items-center space-x-4">
            <button className="text-brand-dark hover:text-brand-brown p-1.5">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative text-brand-dark hover:text-brand-brown p-1.5">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-brown rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-brand-dark hover:text-brand-brown p-1.5"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-cream-dark bg-white">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navItems.map((item) => (
              <div key={item.name} className="space-y-1">
                {item.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}
                      className="w-full flex items-center justify-between py-2 text-xs font-semibold tracking-widest text-brand-dark cursor-pointer"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isMobileCollectionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isMobileCollectionsOpen && (
                      <div className="pl-4 border-l border-brand-cream-dark/65 space-y-3 mt-1 pb-2">
                        {Object.keys(CATEGORIES_MAP).map((parent) => (
                          <div key={parent} className="space-y-1.5">
                            <button
                              onClick={() => { router.push(`/?parent=${parent}`); setIsMobileMenuOpen(false); }}
                              className="text-[10px] font-bold tracking-widest text-brand-brown uppercase text-left block w-full py-1 cursor-pointer"
                            >
                              {parent}
                            </button>
                            <div className="pl-3 flex flex-col space-y-1.5 border-l border-brand-cream-dark/40">
                              {CATEGORIES_MAP[parent].map((secondary) => (
                                <button
                                  key={secondary}
                                  onClick={() => { router.push(`/?parent=${parent}&secondary=${secondary}`); setIsMobileMenuOpen(false); }}
                                  className="text-[9px] font-bold tracking-widest text-brand-dark/70 hover:text-brand-brown uppercase text-left block w-full py-0.5 cursor-pointer"
                                >
                                  {secondary}
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
                    className={`block py-2 text-xs font-semibold tracking-widest ${activeTab === item.name ? 'text-brand-brown' : 'text-brand-dark'}`}
                  >
                    {item.name}
                  </a>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-between text-xs font-semibold text-brand-dark">
              <span>INR (₹) | India</span>
              <div className="flex space-x-4">
                {user ? (
                  <button onClick={() => router.push('/orders')} className="text-brand-brown tracking-widest text-[10px] uppercase font-bold">
                    ORDERS ({user.first_name})
                  </button>
                ) : (
                  <button onClick={() => router.push('/auth')} className="text-brand-dark tracking-widest text-[10px] uppercase font-bold">
                    SIGN IN
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
