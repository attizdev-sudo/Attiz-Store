import React from 'react';
import Link from 'next/link';
import { Clock, Globe, Tag, MapPin, Search, AlertCircle, CloudRain, PackageX, MapPinOff, Ship, Mail } from 'lucide-react';

export const metadata = { title: 'Shipping & Delivery — ATTIZ' };

const Diamond = () => <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0 inline-block" />;

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <Diamond />
        <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
      </li>
    ))}
  </ul>
);

const StepList = ({ items }: { items: string[] }) => (
  <ol className="space-y-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <span className="w-6 h-6 border-2 border-black bg-[#E63B2E] text-white attiz-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
          {i + 1}
        </span>
        <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
      </li>
    ))}
  </ol>
);

const sections = [
  {
    num: '01', icon: <Clock className="w-4 h-4" />, title: 'Order Processing', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-4">All orders are processed after successful payment verification.</p>
        <BulletList items={[
          'Orders are typically processed within 1–3 business days.',
          'Orders placed on weekends or public holidays will be processed on the next business day.',
          'During launches, promotions, or peak seasons, processing times may be slightly longer.',
        ]} />
        <p className="attiz-body text-sm text-black/90 font-light mt-4">Once your order is shipped, you will receive a confirmation email or SMS with tracking details.</p>
      </>
    ),
  },
  {
    num: '02', icon: <Globe className="w-4 h-4" />, title: 'Shipping Coverage', color: '#FFCB05',
    content: (
      <p className="attiz-body text-sm text-black/90 font-light">ATTIZ currently ships across <strong className="text-black">India</strong>. We are continuously working to expand our delivery network and may offer international shipping in the future. Future availability will be announced through official ATTIZ channels.</p>
    ),
  },
  {
    num: '03', icon: <Clock className="w-4 h-4" />, title: 'Estimated Delivery Time', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-4">Delivery times may vary depending on your location. Standard delivery timelines:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { zone: 'Metro Cities', time: '2–5 Business Days' },
            { zone: 'Tier 2 & Tier 3 Cities', time: '3–7 Business Days' },
            { zone: 'Remote Locations', time: '5–10 Business Days' },
          ].map((row) => (
            <div key={row.zone} className="border-2 border-black p-3 bg-[#FAF8F5]">
              <span className="block attiz-mono text-[8px] font-bold text-black/85 tracking-widest uppercase mb-1">{row.zone}</span>
              <span className="attiz-display text-sm text-black">{row.time}</span>
            </div>
          ))}
        </div>
        <p className="attiz-body text-sm text-black/90 font-light">These timelines are estimates and may vary due to courier operations and external factors.</p>
      </>
    ),
  },
  {
    num: '04', icon: <Tag className="w-4 h-4" />, title: 'Shipping Charges', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-3">Shipping charges, if applicable, will be displayed during checkout before payment.</p>
        <div className="border-2 border-black p-4 bg-black text-white flex items-center gap-3">
          <span className="attiz-mono text-[9px] font-bold text-[#FFCB05] tracking-widest uppercase">Free Shipping</span>
          <span className="w-px h-4 bg-white/20" />
          <span className="attiz-body text-xs text-white/70 font-light">Available on eligible orders, promotional campaigns, or minimum purchase amounts as announced on the website.</span>
        </div>
      </>
    ),
  },
  {
    num: '05', icon: <Search className="w-4 h-4" />, title: 'Order Tracking', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-4">Once your order has been dispatched, you will receive:</p>
        <BulletList items={['Tracking Number', 'Courier Partner Information', 'Shipment Updates via email or SMS']} />
        <p className="attiz-body text-sm text-black/90 font-light mt-4">You can use the tracking information provided to monitor your delivery status in real-time.</p>
      </>
    ),
  },
  {
    num: '06', icon: <MapPin className="w-4 h-4" />, title: 'Delivery Attempts', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-3">Our courier partners will make delivery attempts at the shipping address provided. If delivery cannot be completed due to:</p>
        <BulletList items={['Incorrect address', 'Unavailability of recipient', 'Refusal to accept delivery']} />
        <p className="attiz-body text-sm text-black/90 font-light mt-3">Additional delivery attempts or return procedures may apply. Customers are responsible for providing accurate delivery information.</p>
      </>
    ),
  },
  {
    num: '07', icon: <CloudRain className="w-4 h-4" />, title: 'Delayed Deliveries', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-4">While we strive to deliver within the estimated timeframe, delays may occur due to:</p>
        <BulletList items={['Weather conditions', 'Public holidays', 'Natural disasters', 'Transportation disruptions', 'Courier service delays', 'High order volumes']} />
        <p className="attiz-body text-sm text-black/90 font-light mt-4">ATTIZ shall not be held responsible for delays caused by circumstances beyond our reasonable control.</p>
      </>
    ),
  },
  {
    num: '08', icon: <PackageX className="w-4 h-4" />, title: 'Damaged Packages', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-4">If you receive a package that appears damaged during transit:</p>
        <StepList items={[
          'Take clear photos of the package before opening.',
          'Record an unboxing video if possible.',
          'Contact our customer support team within 48 hours of delivery.',
        ]} />
        <p className="attiz-body text-sm text-black/90 font-light mt-4">Our team will investigate and assist with the appropriate resolution.</p>
      </>
    ),
  },
  {
    num: '09', icon: <MapPinOff className="w-4 h-4" />, title: 'Incorrect Shipping Info', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-3">Customers are responsible for ensuring all shipping details are accurate at the time of purchase. ATTIZ is not responsible for delivery issues arising from:</p>
        <BulletList items={['Incorrect addresses', 'Incomplete information', 'Invalid contact details']} />
        <p className="attiz-body text-sm text-black/90 font-light mt-3">Additional shipping charges may apply if re-delivery is required.</p>
      </>
    ),
  },
  {
    num: '10', icon: <AlertCircle className="w-4 h-4" />, title: 'Lost Shipments', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/90 font-light mb-3">If your order tracking has not been updated for an extended period or your package appears lost:</p>
        <BulletList items={[
          'Contact our customer support team immediately.',
          'We will coordinate with the courier partner to investigate the shipment.',
        ]} />
        <p className="attiz-body text-sm text-black/90 font-light mt-3">Resolution timelines may vary depending on the courier's investigation process.</p>
      </>
    ),
  },
  {
    num: '11', icon: <Ship className="w-4 h-4" />, title: 'International Shipping', color: '#FFCB05',
    content: (
      <p className="attiz-body text-sm text-black/90 font-light">International shipping is currently <strong className="text-black">unavailable</strong> unless otherwise stated on the website. Future availability will be announced through official ATTIZ channels.</p>
    ),
  },
  {
    num: '12', icon: <Mail className="w-4 h-4" />, title: 'Contact Us', color: '#111111',
    content: (
      <div className="space-y-2">
        <p className="attiz-body text-sm text-black/90 font-light">For shipping, delivery, or tracking-related assistance:</p>
        <div className="flex items-center gap-3 pt-1">
          <Diamond />
          <a href="mailto:support@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">support@attiz.com</a>
        </div>
        <div className="flex items-center gap-3">
          <Diamond />
          <span className="attiz-mono text-[10px] font-bold text-black/85 tracking-widest uppercase">Mon – Sat &nbsp;·&nbsp; 9:00 AM – 6:00 PM IST</span>
        </div>
      </div>
    ),
  },
];

export default function ShippingDeliveryPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] py-20 relative overflow-hidden text-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">

          {/* Hero */}
          <div className="space-y-5 text-center md:text-left">
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-2">
              <span className="skew-x-6">Logistics</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Shipping &amp;<br />Delivery
            </h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase border-2 border-black/10 px-3 py-1 inline-block">
              Last Updated: June 2026
            </span>
            <p className="attiz-body text-base leading-8 text-black/70 max-w-3xl font-light">
              At ATTIZ, we are committed to delivering your orders safely, quickly, and efficiently. This policy outlines our shipping procedures, delivery timelines, and important information regarding your order.
            </p>
          </div>

          {/* Quick Nav */}
          <div className="border-t-[3px] border-b-[3px] border-black py-6">
            <p className="attiz-mono text-[9px] font-bold text-black/35 tracking-widest uppercase mb-4">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 7).map((s) => (
                <a key={s.num} href={`#s-${s.num}`}
                  className="attiz-mono text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 border-2 border-black text-black hover:bg-black hover:text-[#FFCB05] transition-all duration-200">
                  {s.num}. {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((s, idx) => (
              <div key={s.num} id={`s-${s.num}`}
                className={`border-[3px] border-black bg-white shadow-[4px_4px_0_0_#111111] p-7 hover:shadow-[6px_6px_0_0_#111111] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-300 ${idx === 2 ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0"
                      style={{ backgroundColor: s.color, color: s.color === '#FFCB05' ? '#000' : '#fff' }}>
                      {s.icon}
                    </div>
                    <div>
                      <span className="block attiz-mono text-[8px] font-bold text-black/35 tracking-widest uppercase">Section {s.num}</span>
                      <h2 className="attiz-display text-base uppercase tracking-wide text-black leading-tight">{s.title}</h2>
                    </div>
                  </div>
                  <span className="attiz-mono text-[9px] font-bold text-black/20 tracking-widest">{s.num}</span>
                </div>
                <div className="h-px bg-black/8 mb-5" />
                <div>{s.content}</div>
              </div>
            ))}
          </div>

          {/* Bottom Card */}
          <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 md:p-12 text-center space-y-6 rotate-[-0.5deg]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFCB05]" />
            <h2 className="attiz-display text-3xl font-bold uppercase text-black">Our Commitment</h2>
            <p className="attiz-body text-sm text-black/65 leading-relaxed font-light max-w-2xl mx-auto">
              At ATTIZ, every order is handled with care to ensure your premium streetwear reaches you in excellent condition and as quickly as possible. Thank you for shopping with ATTIZ.
            </p>
            <div className="h-0.5 w-16 bg-black/10 mx-auto" />
            <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] tracking-[0.3em] uppercase block">Premium Streetwear • Fast Delivery • Trusted Service</span>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link href="/#catalog-grid"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                Browse Catalog
              </Link>
              <Link href="/contact"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-white text-black shadow-[4px_4px_0_0_#111111] hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
