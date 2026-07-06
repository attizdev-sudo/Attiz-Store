import React from 'react';
import Link from 'next/link';

const shopLinks = [
  { name: 'POLOS', href: '#' },
  { name: 'CREWS', href: '#' },
  { name: 'JOGGERS', href: '#' },
  { name: 'SWEATSHIRTS', href: '#' },
];

const policyLinks = [
  { name: 'ABOUT US', href: '/about' },
  { name: 'CONTACT US', href: '/contact' },
  { name: 'TERMS & CONDITIONS', href: '/terms' },
  { name: 'PRIVACY POLICY', href: '#' },
  { name: 'REFUND & RETURN POLICY', href: '/refund-return' },
  { name: 'SHIPPING & DELIVERY POLICY', href: '/shipping-delivery' },
  { name: 'CANCELLATION & RETURN POLICY', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-cream/15 border-t border-brand-cream-dark pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">

          {/* Shop */}
          <div>
            <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-brand-dark mb-5 uppercase">SHOP</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="font-sans text-[10px] font-semibold text-brand-dark/65 hover:text-brand-brown tracking-widest transition-colors duration-300 uppercase">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-brand-dark mb-5 uppercase">CONNECT WITH US</h3>
            <ul className="space-y-4">
              <li>
                <span className="block font-sans text-[10px] text-brand-dark/45 tracking-widest font-semibold uppercase mb-1">Hotline</span>
                <a href="tel:+918270320393" className="font-sans text-[11px] font-bold text-brand-dark hover:text-brand-brown transition-colors duration-300">+91 82703 20393</a>
              </li>
              <li>
                <span className="block font-sans text-[10px] text-brand-dark/45 tracking-widest font-semibold uppercase mb-1">Mail</span>
                <a href="mailto:admin@attizclothing.com" className="font-sans text-[10px] font-bold text-brand-dark hover:text-brand-brown tracking-wider transition-colors duration-300 break-all">admin@attizclothing.com</a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-brand-dark mb-5 uppercase">POLICIES & INFORMATION</h3>
            <ul className="space-y-3">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/') ? (
                    <Link href={link.href} className="font-sans text-[10px] font-semibold text-brand-dark/65 hover:text-brand-brown tracking-widest transition-colors duration-300 uppercase">
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.href} className="font-sans text-[10px] font-semibold text-brand-dark/65 hover:text-brand-brown tracking-widest transition-colors duration-300 uppercase">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-sans text-[11px] font-bold tracking-[0.2em] text-brand-dark mb-5 uppercase">FOLLOW US FOR LATEST UPDATES</h3>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-dark/70 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-dark/70 hover:text-white hover:bg-[#E1306C] hover:border-[#E1306C] transition-all duration-300" aria-label="Instagram">
                <svg className="w-4 h-4 stroke-[1.5] fill-none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-dark/70 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all duration-300" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center text-brand-dark/70 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] transition-all duration-300" aria-label="Linkedin">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream-dark pt-8 text-center">
          <p className="font-sans text-[9px] font-bold tracking-[0.2em] text-brand-dark/45 uppercase">
            © 2026, ATTIZ. POWERED BY Kryvos Technologies
          </p>
        </div>
      </div>
    </footer>
  );
}
