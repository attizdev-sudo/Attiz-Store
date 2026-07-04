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
    <section className="py-16 bg-brand-cream border-t border-b border-brand-cream-dark/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-sans text-xs font-bold tracking-[0.25em] text-brand-dark mb-4 uppercase">SUBSCRIBE TO OUR EMAILS</h2>
        <p className="font-sans text-xs sm:text-sm text-brand-dark/70 tracking-widest mb-8 max-w-md mx-auto leading-relaxed">
          Be the first to know about new collections and exclusive offers.
        </p>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
          {isSubscribed ? (
            <div className="bg-white/80 border border-brand-brown/50 rounded p-4 text-center text-xs font-semibold text-brand-brown tracking-wider flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-brand-brown" />
              <span>THANK YOU FOR SUBSCRIBING! WELCOME TO ATTIZ.</span>
            </div>
          ) : (
            <div className="relative flex items-center border border-brand-cream-dark/40 bg-white rounded overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-brand-brown/40 focus-within:border-brand-brown">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 text-xs text-brand-dark placeholder-brand-dark/40 bg-transparent border-none outline-none tracking-widest font-sans"
              />
              <button type="submit" className="px-4 text-brand-dark hover:text-brand-brown transition-colors duration-300 flex items-center justify-center cursor-pointer h-full">
                <ArrowRight className="w-4 h-4 hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
