'use client';

import React, { useState } from 'react';
import { Mail, Clock, ShieldCheck, HelpCircle, Share2, Check } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSent(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] py-20 relative overflow-hidden text-black">
      {/* Halftone texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">

          {/* Hero Header */}
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center bg-[#E63B2E] text-white attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-2">
              <span className="skew-x-6">Contact ATTIZ</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Contact Us
            </h1>
            <div className="h-1 w-24 bg-black my-4 mx-auto md:mx-0" />
            <p className="attiz-body text-base leading-8 text-black/95 max-w-3xl font-light">
              We'd love to hear from you. Whether you have a question about an order, product details, sizing, shipping, returns, collaborations, or anything else, the ATTIZ team is here to help.
            </p>
          </div>

          {/* Split Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6 border-t border-black/10">

            {/* Left: Contact Info Blocks */}
            <div className="lg:col-span-5 space-y-6">

              {/* Customer Support Card */}
              <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-[#E63B2E]" />
                  <h3 className="attiz-mono text-[11px] font-bold text-black uppercase tracking-wider">Customer Support</h3>
                </div>
                <div className="space-y-3 attiz-body text-xs text-black/75 font-light leading-relaxed">
                  <p>For all inquiries, please reach out to our help desk:</p>
                  <p className="font-semibold text-black">
                    Email: <a href="mailto:support@attiz.com" className="attiz-mono text-xs font-bold text-[#E63B2E] hover:underline">support@attiz.com</a>
                  </p>
                  <div className="pt-2 border-t border-black/5 flex gap-2">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-black/85 shrink-0" />
                    <div>
                      <p className="font-medium text-black">Customer Care Hours:</p>
                      <p>Monday – Saturday: 9:00 AM – 6:00 PM (IST)</p>
                      <p className="text-black/85 text-[10px] mt-0.5">Response Time: 24–48 business hours.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order & Shipping Info Card */}
              <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[0.5deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#E63B2E]" />
                  <h3 className="attiz-mono text-[11px] font-bold text-black uppercase tracking-wider">Order Support</h3>
                </div>
                <div className="space-y-3 attiz-body text-xs text-black/75 font-light leading-relaxed">
                  <p>Need help with your order? Please include the following details in your email:</p>
                  <ul className="space-y-1.5 attiz-mono text-[10px] text-black font-bold uppercase pl-4 list-disc">
                    <li>Order Number</li>
                    <li>Full Name</li>
                    <li>Email Address Used for Purchase</li>
                  </ul>
                </div>
              </div>

              {/* Business & Collaborations Card */}
              <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-[#E63B2E]" />
                  <h3 className="attiz-mono text-[11px] font-bold text-black uppercase tracking-wider">Collaborations</h3>
                </div>
                <div className="space-y-2 attiz-body text-xs text-black/75 font-light leading-relaxed">
                  <p>For wholesale, partnerships, influencer drops, and marketing requests:</p>
                  <p className="font-semibold text-black">
                    Email: <a href="mailto:business@attiz.com" className="attiz-mono text-xs font-bold text-[#E63B2E] hover:underline">business@attiz.com</a>
                  </p>
                </div>
              </div>

              {/* Social Connect Card */}
              <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[0.5deg] hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-4 h-4 text-[#E63B2E]" />
                  <h3 className="attiz-mono text-[11px] font-bold text-black uppercase tracking-wider">Follow ATTIZ</h3>
                </div>
                <div className="space-y-2 attiz-body text-xs text-black/75 font-light leading-relaxed">
                  <p>Stay updated and be the first to discover new season drops:</p>
                  <p className="font-semibold text-black">
                    Instagram: <span className="attiz-mono text-xs font-bold text-[#E63B2E]">@attiz.in</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Right: Interactive Contact Form Card */}
            <div className="lg:col-span-7">
              <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 md:p-10 rotate-[0.5deg]">
                <h2 className="attiz-display text-3xl font-bold uppercase text-black mb-6">Send Us a Message</h2>
                
                {isSent ? (
                  <div className="bg-black text-[#FFCB05] border-2 border-black shadow-[4px_4px_0_0_#E63B2E] p-6 text-center flex flex-col items-center justify-center space-y-3">
                    <Check className="w-8 h-8 text-[#FFCB05]" />
                    <span className="attiz-mono text-xs font-bold tracking-widest uppercase">
                      MESSAGE SENT SUCCESSFULLY!
                    </span>
                    <p className="attiz-body text-xs text-white/70 font-light max-w-sm">
                      Our customer care team will review your inquiry and get back to you within 24–48 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name input */}
                    <div className="space-y-1">
                      <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border-2 border-black px-4 py-3 attiz-body text-xs text-black placeholder-black/35 bg-transparent outline-none focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                        placeholder="YOUR FULL NAME"
                      />
                    </div>

                    {/* Email input */}
                    <div className="space-y-1">
                      <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase block">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border-2 border-black px-4 py-3 attiz-body text-xs text-black placeholder-black/35 bg-transparent outline-none focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                        placeholder="you@example.com"
                      />
                    </div>

                    {/* Phone input */}
                    <div className="space-y-1">
                      <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase block">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border-2 border-black px-4 py-3 attiz-body text-xs text-black placeholder-black/35 bg-transparent outline-none focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                        placeholder="+91 12345 67890"
                      />
                    </div>

                    {/* Subject input */}
                    <div className="space-y-1">
                      <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase block">Subject</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full border-2 border-black px-4 py-3 attiz-body text-xs text-black placeholder-black/35 bg-transparent outline-none focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                        placeholder="ORDER INQUIRY, SIZING, COLLABORATION"
                      />
                    </div>

                    {/* Message textarea */}
                    <div className="space-y-1">
                      <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Message *</label>
                      <textarea
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full border-2 border-black px-4 py-3 attiz-body text-xs text-black placeholder-black/35 bg-transparent outline-none focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                        placeholder="Write your message here..."
                      />
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                      >
                        Send Message
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Branding Statement */}
          <div className="border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 text-center max-w-xl mx-auto rotate-[-0.5deg]">
            <h2 className="attiz-display text-2xl font-bold uppercase text-black">ATTIZ</h2>
            <p className="attiz-body text-xs text-black/60 mt-1 font-light leading-relaxed">
              Premium Streetwear for the Next Generation. Wear Your Attitude.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
