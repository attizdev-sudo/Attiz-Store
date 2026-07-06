import React from 'react';

export default function ContactPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-brown">Contact ATTIZ</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">CONTACT US</h1>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              We'd Love to Hear From You. Whether you have a question about an order, product details, sizing, shipping, returns, collaborations, or anything else, the ATTIZ team is here to help.
            </p>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              Your satisfaction is our priority, and we're committed to providing the best shopping experience possible.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Support</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  For all customer service inquiries, please contact us using the details below:
                </p>
                <p className="mt-4 text-base leading-8 text-brand-dark/80">
                  Email: <a href="mailto:support@attiz.com" className="text-brand-brown hover:text-brand-dark">support@attiz.com</a>
                </p>
                <p className="text-base leading-8 text-brand-dark/80">Customer Care Hours:</p>
                <p className="text-base leading-8 text-brand-dark/80">Monday – Saturday: 9:00 AM – 6:00 PM (IST)</p>
                <p className="text-base leading-8 text-brand-dark/80">Response Time: We aim to respond to all inquiries within 24–48 business hours.</p>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight">Order & Shipping Support</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  Need help with your order? Please include the following information when contacting us:
                </p>
                <ul className="mt-4 space-y-2 text-base leading-8 text-brand-dark/80 list-disc list-inside">
                  <li>Order Number</li>
                  <li>Full Name</li>
                  <li>Email Address Used for Purchase</li>
                  <li>Details of Your Request</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight">Returns & Exchanges</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  If you need assistance with returns, exchanges, or refunds, please contact our support team with your order details. Our team will guide you through the process and ensure a smooth resolution.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold tracking-tight">Business & Collaborations</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  For partnerships, influencer collaborations, wholesale inquiries, media opportunities, or business-related requests:
                </p>
                <p className="mt-4 text-base leading-8 text-brand-dark/80">
                  Email: <a href="mailto:business@attiz.com" className="text-brand-brown hover:text-brand-dark">business@attiz.com</a>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
                <h2 className="text-3xl font-bold tracking-tight">Follow ATTIZ</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  Stay connected and be the first to discover new drops, exclusive collections, and special offers.
                </p>
                <p className="text-base leading-8 text-brand-dark/80">Instagram: <span className="font-semibold text-brand-brown">@attiz.in</span></p>
              </div>

              <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
                <h2 className="text-3xl font-bold tracking-tight">Send Us a Message</h2>
                <p className="text-base leading-8 text-brand-dark/80">
                  Have a question or feedback? Fill out the contact form below, and a member of our team will get back to you as soon as possible.
                </p>
                <form className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/70">Full Name</label>
                    <input type="text" className="w-full rounded-2xl border border-brand-cream-dark/80 bg-white px-4 py-3 text-brand-dark outline-none focus:border-brand-brown focus:ring-2 focus:ring-brand-cream" placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/70">Email Address</label>
                    <input type="email" className="w-full rounded-2xl border border-brand-cream-dark/80 bg-white px-4 py-3 text-brand-dark outline-none focus:border-brand-brown focus:ring-2 focus:ring-brand-cream" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/70">Phone Number (Optional)</label>
                    <input type="tel" className="w-full rounded-2xl border border-brand-cream-dark/80 bg-white px-4 py-3 text-brand-dark outline-none focus:border-brand-brown focus:ring-2 focus:ring-brand-cream" placeholder="+91 12345 67890" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/70">Subject</label>
                    <input type="text" className="w-full rounded-2xl border border-brand-cream-dark/80 bg-white px-4 py-3 text-brand-dark outline-none focus:border-brand-brown focus:ring-2 focus:ring-brand-cream" placeholder="Order inquiry, collaboration, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-brand-dark/70">Message</label>
                    <textarea rows={5} className="w-full rounded-2xl border border-brand-cream-dark/80 bg-white px-4 py-3 text-brand-dark outline-none focus:border-brand-brown focus:ring-2 focus:ring-brand-cream" placeholder="Write your message here..."></textarea>
                  </div>
                  <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-brand-brown px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-brand-dark">
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
              <h2 className="text-3xl font-bold tracking-tight">ATTIZ</h2>
              <p className="mt-4 text-base leading-8 text-brand-dark/80">Premium Streetwear for the Modern Generation</p>
              <p className="text-base leading-8 text-brand-dark/80">Wear Your Attitude.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
