import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-2">
              <span className="skew-x-6">About ATTIZ</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Welcome to ATTIZ
            </h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-light">
              At ATTIZ, we believe streetwear is more than fashion—it's a way of expressing who you are. Born from the energy of modern street culture, ATTIZ creates premium apparel designed for individuals who value style, comfort, and authenticity.
            </p>
            <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-light">
              Our mission is to deliver high-quality streetwear that combines contemporary trends with timeless design. Every piece is carefully crafted using premium fabrics, attention to detail, and modern silhouettes that fit seamlessly into today's lifestyle.
            </p>
          </div>

          {/* Grid Layout: Story & Values */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-6 border-t border-black/10">
            
            {/* Left: Our Story Card */}
            <div className="lg:col-span-7 space-y-8">
              <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 md:p-10 rotate-[-0.5deg] hover:rotate-0 transition-transform duration-300">
                <span className="attiz-mono text-[9px] font-bold text-black/85 tracking-[0.2em] uppercase block mb-2">The Genesis</span>
                <h2 className="attiz-display text-3xl font-bold tracking-wide uppercase text-black mb-6">Our Story</h2>
                <div className="space-y-4 attiz-body text-sm text-black/90 leading-relaxed font-light">
                  <p>
                    ATTIZ was founded with a simple vision: to create streetwear that feels premium, looks distinctive, and remains accessible to the next generation of fashion enthusiasts.
                  </p>
                  <p>
                    Inspired by global street culture, art, music, and urban lifestyles, we design collections that reflect individuality and self-expression. We believe the best fashion doesn't follow trends—it creates them.
                  </p>
                  <p className="font-medium text-black">
                    Every ATTIZ product is made to help you stand out while staying true to yourself.
                  </p>
                </div>
              </div>

              {/* Vision & Mission Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[1deg]">
                  <h3 className="attiz-display text-lg font-bold text-black uppercase mb-3">Our Mission</h3>
                  <p className="attiz-body text-xs text-black/70 leading-relaxed font-light">
                    To create premium streetwear that empowers people to express themselves confidently through quality, comfort, and innovative design.
                  </p>
                </div>
                <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#111111] rotate-[-1deg]">
                  <h3 className="attiz-display text-lg font-bold text-black uppercase mb-3">Our Vision</h3>
                  <p className="attiz-body text-xs text-black/70 leading-relaxed font-light">
                    To become a leading global streetwear brand recognized for premium craftsmanship, authentic culture, and timeless style.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Core Values Card List */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border-[3px] border-black bg-white shadow-[6px_6px_0_0_#E63B2E] p-8 rotate-[0.5deg]">
                <h2 className="attiz-display text-2xl font-bold uppercase text-black mb-6">Our Values</h2>
                <ul className="space-y-4">
                  {[
                    { title: 'Quality First', desc: 'Excellence in every detail, stitch, and fabric selection.' },
                    { title: 'Authenticity', desc: 'Garments crafted to help you stay true to your identity.' },
                    { title: 'Creativity', desc: 'Bold outlines inspired by culture, modern art, and innovation.' },
                    { title: 'Community', desc: 'Built for and inspired by the active people who wear our brand.' },
                    { title: 'Progress', desc: 'Always searching, always evolving, always improving.' },
                  ].map((val, idx) => (
                    <li key={idx} className="flex gap-3 items-start border-b border-black/5 pb-3 last:border-0 last:pb-0">
                      <span className="w-2.5 h-2.5 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
                      <div>
                        <h4 className="attiz-mono text-[11px] font-bold text-black uppercase tracking-wider">{val.title}</h4>
                        <p className="attiz-body text-xs text-black/85 font-light mt-0.5">{val.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Core Differentiators Section */}
          <div className="space-y-8 pt-8">
            <h2 className="attiz-display text-3xl font-bold text-center uppercase tracking-wide">
              What Makes ATTIZ Different?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Premium Quality', desc: 'We use carefully selected heavy-knit materials and quality craftsmanship to ensure every garment delivers exceptional comfort, durability, and style.' },
                { title: 'Modern Streetwear', desc: 'From oversized daily essentials to statement graphic styles, our designs are directly inspired by contemporary street fashion and evolving culture.' },
                { title: 'Comfort Meets Style', desc: 'We engineer apparel that looks great and feels even better, ensuring a perfect ergonomic silhouette for active everyday wear.' },
                { title: 'Built for Expression', desc: 'ATTIZ is built specifically for creators, dreamers, trendsetters, and anyone who isn\'t afraid to showcase their personal attitude.' },
              ].map((item, idx) => (
                <div key={idx} className="border-2 border-black bg-white p-6 shadow-[3px_3px_0_0_#111111] hover:shadow-[5px_5px_0_0_#E63B2E] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="attiz-mono text-[9px] font-bold text-black/85 tracking-widest uppercase">0{idx + 1} / Pillar</span>
                    <h3 className="attiz-mono text-xs font-bold text-black uppercase tracking-wider">{item.title}</h3>
                    <p className="attiz-body text-xs text-black/90 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Statement Card */}
          <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 md:p-10 text-center space-y-6 max-w-4xl mx-auto rotate-[-0.5deg]">
            <h2 className="attiz-display text-3xl font-bold uppercase text-black">More Than Clothing</h2>
            <p className="attiz-body text-sm text-black/75 leading-relaxed font-light max-w-2xl mx-auto">
              ATTIZ is more than a label—it's a community driven by confidence, ambition, and creativity. We are proud to create apparel that helps people express their unique identity and embrace their personal style.
            </p>
            <div className="h-0.5 w-16 bg-black/10 mx-auto" />
            <div className="space-y-1">
              <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] tracking-[0.3em] uppercase block">Wear Your Attitude</span>
              <span className="attiz-body text-xs text-black/45 font-medium">Premium Streetwear • Modern Culture • Timeless Attitude</span>
            </div>
            <div className="pt-4">
              <Link
                href="/#catalog-grid"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                Browse Catalog
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
