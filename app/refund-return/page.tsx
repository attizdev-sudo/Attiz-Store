import React from 'react';
import Link from 'next/link';
import { XCircle, CheckSquare, Ban, AlertTriangle, ArrowLeftRight, CreditCard, Truck, ClipboardList, ShieldOff, Mail } from 'lucide-react';

export const metadata = { title: 'Cancellation & Return Policy — ATTIZ' };

const Diamond = () => <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0 inline-block" />;

const BulletList = ({ items }: { items: React.ReactNode[] }) => (
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

const policyStats = [
  { label: 'Return Window', value: '7 Days' },
  { label: 'Refund Timeline', value: '2–5 Business Days' },
  { label: 'Bank Processing', value: '+5–10 Days' },
  { label: 'Damaged Claim', value: 'Within 48 Hrs' },
];

const sections = [
  {
    num: '01', icon: <XCircle className="w-4 h-4" />, title: 'Order Cancellation', color: '#E63B2E',
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="border-2 border-black p-4">
            <span className="block attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase mb-2">Before Shipment</span>
            <p className="attiz-body text-sm text-black/70 font-light">You may cancel your order <strong className="text-black">before it has been shipped</strong> by contacting our customer support. If approved, a full refund will be processed to your original payment method within <strong className="text-black">2–5 business days</strong>.</p>
          </div>
          <div className="border-2 border-black p-4 bg-[#FAF8F5]">
            <span className="block attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase mb-2">After Shipment</span>
            <p className="attiz-body text-sm text-black/70 font-light">Once dispatched, the order <strong className="text-black">cannot be canceled</strong>. If you no longer wish to keep the product, you may request a return after delivery, subject to our Return Policy.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    num: '02', icon: <CheckSquare className="w-4 h-4" />, title: 'Return Eligibility', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">A return will be accepted if all of the following conditions are met:</p>
        <BulletList items={[
          <>The return request is made within <strong className="text-black">7 days</strong> of receiving your order.</>,
          <>The product is <strong className="text-black">unused, unwashed, unworn</strong>, and in its original condition.</>,
          'All original tags, labels, accessories, and packaging are intact.',
          'The item is not damaged due to misuse or improper handling after delivery.',
        ]} />
      </>
    ),
  },
  {
    num: '03', icon: <Ban className="w-4 h-4" />, title: 'Non-Returnable Items', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">The following items are <strong className="text-black">not eligible for return</strong>:</p>
        <BulletList items={[
          'Customized or personalized products.',
          'Gift cards or promotional vouchers.',
          <>Products marked as <strong className="text-black">Final Sale</strong> or <strong className="text-black">Clearance Sale</strong>.</>,
          'Items that have been used, washed, altered, or damaged by the customer.',
          'Products without original tags or packaging.',
        ]} />
      </>
    ),
  },
  {
    num: '04', icon: <AlertTriangle className="w-4 h-4" />, title: 'Damaged, Defective or Incorrect', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">If you receive a product that is damaged, defective, or different from what you ordered, contact us within <strong className="text-black">48 hours of delivery</strong> with:</p>
        <BulletList items={[
          'Your Order Number',
          'Clear photos of the product',
          'Photos of the packaging',
          'An unboxing video (strongly recommended)',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-4">After verification, we will arrange a <strong className="text-black">replacement, exchange, or refund</strong> at no additional cost.</p>
      </>
    ),
  },
  {
    num: '05', icon: <ArrowLeftRight className="w-4 h-4" />, title: 'Exchange Policy', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">We offer exchanges for:</p>
        <BulletList items={[
          'Incorrect size (subject to stock availability)',
          'Defective products',
          'Incorrect items received',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-4">If the requested product or size is unavailable, we may offer a <strong className="text-black">refund or store credit</strong>.</p>
      </>
    ),
  },
  {
    num: '06', icon: <CreditCard className="w-4 h-4" />, title: 'Refund Policy', color: '#111111',
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Refund Initiated', value: '2–5 Business Days' },
            { label: 'Bank Reflection', value: '5–10 Business Days' },
            { label: 'Shipping Charges', value: 'Non-Refundable*' },
          ].map((card) => (
            <div key={card.label} className="border-2 border-black p-3 bg-[#FAF8F5]">
              <span className="block attiz-mono text-[8px] font-bold text-black/40 tracking-widest uppercase mb-1">{card.label}</span>
              <span className="attiz-display text-sm text-black">{card.value}</span>
            </div>
          ))}
        </div>
        <BulletList items={[
          'Approved refunds will be processed to your original payment method after we receive and inspect the returned product.',
          'Shipping charges are non-refundable unless the return is due to an error on our part.',
        ]} />
      </>
    ),
  },
  {
    num: '07', icon: <Truck className="w-4 h-4" />, title: 'Return Shipping', color: '#E63B2E',
    content: (
      <BulletList items={[
        'If the return is due to a damaged, defective, or incorrect product, ATTIZ will bear the return shipping cost.',
        'For all other eligible returns, return shipping charges may be the customer\'s responsibility unless otherwise stated.',
      ]} />
    ),
  },
  {
    num: '08', icon: <ClipboardList className="w-4 h-4" />, title: 'How to Request a Return', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">To request a cancellation or return, contact Customer Support with:</p>
        <StepList items={[
          'Order Number',
          'Full Name & Registered Email Address',
          'Contact Number',
          'Reason for Cancellation or Return',
          'Supporting photos (if applicable)',
        ]} />
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-black/10">
          <Diamond />
          <a href="mailto:support@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">support@attiz.com</a>
        </div>
      </>
    ),
  },
  {
    num: '09', icon: <ShieldOff className="w-4 h-4" />, title: 'Right to Refuse Requests', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">ATTIZ reserves the right to reject cancellation, return, or refund requests if:</p>
        <BulletList items={[
          'The request does not comply with this policy.',
          'The returned product is not in its original condition.',
          'Evidence of misuse, damage, or fraudulent activity is found.',
        ]} />
      </>
    ),
  },
  {
    num: '10', icon: <Mail className="w-4 h-4" />, title: 'Contact & Support', color: '#E63B2E',
    content: (
      <div className="space-y-2">
        <p className="attiz-body text-sm text-black/70 font-light">If you have any questions about our Cancellation &amp; Return Policy, we&apos;re here to help.</p>
        <div className="flex items-center gap-3 pt-1">
          <Diamond />
          <a href="mailto:support@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">support@attiz.com</a>
        </div>
        <div className="flex items-center gap-3">
          <Diamond />
          <span className="attiz-mono text-[10px] font-bold text-black/50 tracking-widest uppercase">Mon – Sat &nbsp;·&nbsp; 9:00 AM – 6:00 PM IST</span>
        </div>
      </div>
    ),
  },
];

export default function RefundReturnPage() {
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
              <span className="skew-x-6">Returns &amp; Refunds</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Cancellation<br />&amp; Returns
            </h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase border-2 border-black/10 px-3 py-1 inline-block">Effective: July 2026</span>
              <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase border-2 border-black/10 px-3 py-1 inline-block">Last Updated: July 2026</span>
            </div>
            <p className="attiz-body text-base leading-8 text-black/70 max-w-3xl font-light">
              At ATTIZ, we strive to provide a smooth and satisfying shopping experience. If you need to cancel an order or return a product, please review the policy below.
            </p>
          </div>

          {/* At-a-glance stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-[3px] border-black">
            {policyStats.map((stat, i) => (
              <div key={i} className={`p-5 text-center ${i < policyStats.length - 1 ? 'border-r-2 border-black/20' : ''}`}>
                <span className="block attiz-mono text-[8px] font-bold text-black/35 tracking-widest uppercase mb-2">{stat.label}</span>
                <span className="attiz-display text-sm text-black uppercase">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Nav */}
          <div className="border-t-[3px] border-b-[3px] border-black py-6">
            <p className="attiz-mono text-[9px] font-bold text-black/35 tracking-widest uppercase mb-4">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 7).map((s) => (
                <a key={s.num} href={`#rr-${s.num}`}
                  className="attiz-mono text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 border-2 border-black text-black hover:bg-black hover:text-[#FFCB05] transition-all duration-200">
                  {s.num}. {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((s, idx) => (
              <div key={s.num} id={`rr-${s.num}`}
                className={`border-[3px] border-black bg-white shadow-[4px_4px_0_0_#111111] p-7 hover:shadow-[6px_6px_0_0_#111111] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-300 ${(idx === 0 || idx === 5) ? 'lg:col-span-2' : ''}`}>
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
            <h2 className="attiz-display text-3xl font-bold uppercase text-black">Customer First, Always</h2>
            <p className="attiz-body text-sm text-black/65 leading-relaxed font-light max-w-2xl mx-auto">
              At ATTIZ, we are committed to delivering premium-quality streetwear and providing a fair, transparent, and hassle-free return experience. Your satisfaction is important to us, and our team is always ready to assist you.
            </p>
            <div className="h-0.5 w-16 bg-black/10 mx-auto" />
            <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] tracking-[0.3em] uppercase block">Premium Streetwear • Hassle-Free Returns • Customer First</span>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link href="/#catalog-grid"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                Browse Catalog
              </Link>
              <Link href="/contact"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-white text-black shadow-[4px_4px_0_0_#111111] hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                Contact Support
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
