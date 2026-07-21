'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <section className="py-20 bg-[#FAF8F5] border-t border-b border-black/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E63B2E]" />
          <span className="attiz-mono text-[9px] font-bold tracking-[0.3em] text-[#E63B2E] uppercase">Newsletter</span>
        </div>
        <h2 className="attiz-display text-3xl sm:text-4xl text-black mb-4 uppercase tracking-wide">Subscribe to our emails</h2>
        <p className="attiz-body text-xs sm:text-sm text-black/85 tracking-widest mb-8 max-w-md mx-auto leading-relaxed font-light">
          Be the first to know about new collections, seasonal drops, and exclusive editorial updates.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
          {isSubscribed ? (
            <div className="bg-black text-[#FFCB05] border-2 border-black shadow-[4px_4px_0_0_#E63B2E] p-4 text-center text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-[#FFCB05]" />
              <span>THANK YOU FOR SUBSCRIBING! WELCOME TO ATTIZ.</span>
            </div>
          ) : (
            <div className="relative flex items-center border-2 border-black bg-white shadow-[4px_4px_0_0_#111111] overflow-hidden focus-within:shadow-[5px_5px_0_0_#E63B2E] transition-all">
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-xs text-black placeholder-black/35 bg-transparent border-none outline-none tracking-widest font-mono uppercase"
              />
              <button type="submit" className="px-5 bg-black hover:bg-[#E63B2E] text-[#FFCB05] hover:text-white transition-colors duration-200 flex items-center justify-center cursor-pointer h-12 border-l-2 border-black">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
