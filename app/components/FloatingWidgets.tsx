'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, MessageSquare, PhoneCall } from 'lucide-react';

export default function FloatingWidgets() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const openWhatsApp = () => window.open('https://wa.me/7845351604', '_blank');

  return (
    <>
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-brand-brown hover:bg-brand-brown-dark text-white shadow-lg flex items-center justify-center transition-all duration-500 ease-out cursor-pointer ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
        title="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 animate-pulse" />
      </button>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        {/* <button
          className="w-12 h-12 rounded-full bg-brand-dark hover:bg-brand-brown text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group"
          title="Customer support chat"
        > */}
          {/* <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" /> */}
        {/* </button> */}
        <button
          onClick={openWhatsApp}
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer group"
          title="WhatsApp Support"
        >
          <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
    </>
  );
}
