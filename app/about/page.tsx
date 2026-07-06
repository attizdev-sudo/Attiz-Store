import React from 'react';

export default function AboutPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-brown">About ATTIZ</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Welcome to ATTIZ</h1>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              At ATTIZ, we believe streetwear is more than fashion—it's a way of expressing who you are. Born from the energy of modern street culture, ATTIZ creates premium apparel designed for individuals who value style, comfort, and authenticity.
            </p>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              Our mission is to deliver high-quality streetwear that combines contemporary trends with timeless design. Every piece is carefully crafted using premium fabrics, attention to detail, and modern silhouettes that fit seamlessly into today's lifestyle.
            </p>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              Whether you're stepping out with confidence, creating your own path, or simply looking for everyday essentials with a premium feel, ATTIZ is designed to move with you.
            </p>
          </div>

          <div className="border-t border-brand-cream-dark pt-10 space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                ATTIZ was founded with a simple vision: to create streetwear that feels premium, looks distinctive, and remains accessible to the next generation of fashion enthusiasts.
              </p>
              <p className="text-base leading-8 text-brand-dark/80">
                Inspired by global street culture, art, music, and urban lifestyles, we design collections that reflect individuality and self-expression. We believe the best fashion doesn't follow trends—it creates them.
              </p>
              <p className="text-base leading-8 text-brand-dark/80">
                Every ATTIZ product is made to help you stand out while staying true to yourself.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">What Makes ATTIZ Different?</h2>
              <div className="space-y-4 text-brand-dark/80">
                <div>
                  <h3 className="text-xl font-semibold">Premium Quality</h3>
                  <p className="leading-7">
                    We use carefully selected materials and quality craftsmanship to ensure every garment delivers exceptional comfort, durability, and style.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Modern Streetwear Design</h3>
                  <p className="leading-7">
                    From oversized essentials to statement graphic pieces, our collections are inspired by contemporary street fashion and evolving culture.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Comfort Meets Style</h3>
                  <p className="leading-7">
                    We create apparel that looks great and feels even better, making it perfect for everyday wear.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Built for Self-Expression</h3>
                  <p className="leading-7">
                    ATTIZ is designed for creators, dreamers, trendsetters, and anyone who isn't afraid to showcase their individuality.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-base leading-8 text-brand-dark/80">
                  To create premium streetwear that empowers people to express themselves confidently through quality, comfort, and innovative design.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Our Vision</h3>
                <p className="text-base leading-8 text-brand-dark/80">
                  To become a leading global streetwear brand recognized for premium craftsmanship, authentic culture, and timeless style.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">Our Values</h2>
              <ul className="space-y-3 text-base leading-8 text-brand-dark/80 list-disc list-inside">
                <li>Quality First – Excellence in every detail.</li>
                <li>Authenticity – Stay true to your identity.</li>
                <li>Creativity – Inspired by culture, art, and innovation.</li>
                <li>Community – Built for the people who wear our brand.</li>
                <li>Progress – Always evolving, always improving.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">More Than Clothing</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                ATTIZ is more than a label—it's a community driven by confidence, ambition, and creativity. We are proud to create apparel that helps people express their unique identity and embrace their personal style.
              </p>
              <p className="text-base leading-8 text-brand-dark/80">
                Thank you for being part of the ATTIZ journey.
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-brown">ATTIZ</p>
              <p className="text-base leading-8 text-brand-dark/80">Premium Streetwear • Modern Culture • Timeless Attitude</p>
              <p className="text-base leading-8 text-brand-dark/80">Wear Your Attitude.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
