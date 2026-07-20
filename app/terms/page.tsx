import React from 'react';
import Link from 'next/link';
import { FileText, Scale, Package, CreditCard, Truck, RotateCcw, Shield, UserX, AlertTriangle, Globe, Lock, RefreshCw, Gavel, Mail } from 'lucide-react';

export const metadata = { title: 'Terms & Conditions — ATTIZ' };

const sections = [
  {
    num: '01',
    icon: <FileText className="w-4 h-4" />,
    title: 'Acceptance of Terms',
    color: '#E63B2E',
    content: (
      <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">
        By accessing, browsing, or purchasing products from ATTIZ, you acknowledge that you have read, understood, and agreed to be bound by these Terms &amp; Conditions, our Privacy Policy, and any other policies published on our website. If you do not agree with these terms, please do not use our website.
      </p>
    ),
  },
  {
    num: '02',
    icon: <Scale className="w-4 h-4" />,
    title: 'Eligibility',
    color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">To place an order through our website, you must:</p>
        <ul className="space-y-2">
          {[
            'Be at least 18 years of age or have parental/guardian consent.',
            'Provide accurate and complete information during checkout.',
            'Use the website in accordance with applicable laws and regulations.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: '03',
    icon: <Package className="w-4 h-4" />,
    title: 'Products & Pricing',
    color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">We strive to ensure all product descriptions, images, pricing, and availability information are accurate. However:</p>
        <ul className="space-y-2">
          {[
            'Product colors may vary slightly due to screen settings and photography.',
            'Prices are subject to change without prior notice.',
            'We reserve the right to discontinue products at any time.',
            'Limited-edition items may not be restocked.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    num: '04',
    icon: <FileText className="w-4 h-4" />,
    title: 'Orders',
    color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">When you place an order:</p>
        <ul className="space-y-2 mb-3">
          {[
            'You agree that all information provided is accurate.',
            'Orders are subject to acceptance and availability.',
            'We reserve the right to cancel or refuse any order for any reason, including suspected fraud, pricing errors, or stock unavailability.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">If your order is canceled after payment, the applicable refund will be processed according to our refund policy.</p>
      </>
    ),
  },
  {
    num: '05',
    icon: <CreditCard className="w-4 h-4" />,
    title: 'Payment',
    color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-2">We accept approved payment methods displayed at checkout.</p>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-2">By submitting payment information, you authorize us to charge the applicable amount for your purchase, including taxes and shipping fees where applicable.</p>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">ATTIZ does not store complete payment card details on our servers.</p>
      </>
    ),
  },
  {
    num: '06',
    icon: <Truck className="w-4 h-4" />,
    title: 'Shipping & Delivery',
    color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">Shipping times are estimates and may vary. ATTIZ is not responsible for delays caused by:</p>
        <ul className="space-y-2 mb-3">
          {['Shipping carriers', 'Customs processing', 'Incorrect shipping information provided by customers', 'Events beyond our reasonable control'].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Customers are responsible for providing accurate delivery information.</p>
      </>
    ),
  },
  {
    num: '07',
    icon: <RotateCcw className="w-4 h-4" />,
    title: 'Returns, Exchanges & Refunds',
    color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">Returns and exchanges are subject to our Return Policy. Generally:</p>
        <ul className="space-y-2 mb-3">
          {[
            'Items must be unused, unworn, and in original condition.',
            'Return requests must be submitted within the specified return window.',
            'Certain products may be non-returnable for hygiene, clearance, or promotional reasons.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Refunds will be processed according to the original payment method after inspection and approval.</p>
      </>
    ),
  },
  {
    num: '08',
    icon: <Shield className="w-4 h-4" />,
    title: 'Intellectual Property',
    color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">All content on this website — including logos, graphics, product designs, images, text, branding, and website content — is the property of ATTIZ and is protected by applicable intellectual property laws.</p>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Unauthorized reproduction, distribution, modification, or commercial use is strictly prohibited.</p>
      </>
    ),
  },
  {
    num: '09',
    icon: <UserX className="w-4 h-4" />,
    title: 'User Conduct',
    color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">You agree not to:</p>
        <ul className="space-y-2 mb-3">
          {[
            'Use the website for unlawful purposes.',
            'Attempt unauthorized access to website systems.',
            'Upload harmful code, malware, or viruses.',
            'Interfere with website functionality.',
            'Submit false or misleading information.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Violation of these terms may result in account suspension or legal action.</p>
      </>
    ),
  },
  {
    num: '10',
    icon: <AlertTriangle className="w-4 h-4" />,
    title: 'Limitation of Liability',
    color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light mb-3">To the maximum extent permitted by law, ATTIZ shall not be liable for any indirect, incidental, consequential, or special damages arising from:</p>
        <ul className="space-y-2 mb-3">
          {['Use of the website', 'Product purchases', 'Service interruptions', 'Technical issues', 'Third-party actions'].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 mt-1.5 shrink-0" />
              <span className="attiz-body text-sm text-black/70 font-light">{item}</span>
            </li>
          ))}
        </ul>
        <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Our total liability shall not exceed the amount paid for the purchased product.</p>
      </>
    ),
  },
  {
    num: '11',
    icon: <Globe className="w-4 h-4" />,
    title: 'Third-Party Links',
    color: '#111111',
    content: (
      <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Our website may contain links to third-party websites for convenience. ATTIZ is not responsible for the content, policies, or practices of external websites. Users access such websites at their own risk.</p>
    ),
  },
  {
    num: '12',
    icon: <Lock className="w-4 h-4" />,
    title: 'Privacy',
    color: '#FFCB05',
    content: (
      <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">Your use of our website is also governed by our <Link href="/privacy-policy" className="text-[#E63B2E] hover:text-black underline underline-offset-2 transition-colors">Privacy Policy</Link>, which explains how we collect, use, and protect customer information.</p>
    ),
  },
  {
    num: '13',
    icon: <RefreshCw className="w-4 h-4" />,
    title: 'Modifications to Terms',
    color: '#E63B2E',
    content: (
      <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">ATTIZ reserves the right to update, modify, or replace these Terms &amp; Conditions at any time without prior notice. Changes become effective immediately upon publication on this website. Customers are encouraged to review this page periodically.</p>
    ),
  },
  {
    num: '14',
    icon: <Gavel className="w-4 h-4" />,
    title: 'Governing Law',
    color: '#111111',
    content: (
      <p className="attiz-body text-sm text-black/70 leading-relaxed font-light">These Terms &amp; Conditions shall be governed and interpreted in accordance with the laws applicable in the jurisdiction where ATTIZ operates. Any disputes arising from the use of this website shall be subject to the jurisdiction of the appropriate courts.</p>
    ),
  },
  {
    num: '15',
    icon: <Mail className="w-4 h-4" />,
    title: 'Contact Information',
    color: '#FFCB05',
    content: (
      <div className="space-y-2">
        <p className="attiz-body text-sm text-black/70 font-light">For questions regarding these Terms &amp; Conditions, reach out to us:</p>
        <div className="flex items-center gap-3 pt-1">
          <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 shrink-0" />
          <a href="mailto:support@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">support@attiz.com</a>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 border-2 border-black bg-[#FFCB05] rotate-45 shrink-0" />
          <a href="mailto:business@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">business@attiz.com</a>
        </div>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] py-20 relative overflow-hidden text-black">
      {/* Halftone texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">

          {/* ── Hero Header ── */}
          <div className="space-y-5 text-center md:text-left">
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-2">
              <span className="skew-x-6">Legal</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Terms &amp;<br />Conditions
            </h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
              <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase border-2 border-black/10 px-3 py-1">
                Last Updated: June 2026
              </span>
            </div>
            <p className="attiz-body text-base leading-8 text-black/70 max-w-3xl font-light">
              Welcome to ATTIZ. These Terms &amp; Conditions govern your use of our website and the purchase of products from our store. By accessing or using our website, you agree to comply with and be bound by these terms.
            </p>
          </div>

          {/* ── Quick Nav Pills ── */}
          <div className="border-t-[3px] border-b-[3px] border-black py-6">
            <p className="attiz-mono text-[9px] font-bold text-black/35 tracking-widest uppercase mb-4">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 8).map((s) => (
                <a
                  key={s.num}
                  href={`#section-${s.num}`}
                  className="attiz-mono text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 border-2 border-black text-black hover:bg-black hover:text-[#FFCB05] transition-all duration-200"
                >
                  {s.num}. {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* ── Terms Sections Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((s, idx) => (
              <div
                key={s.num}
                id={`section-${s.num}`}
                className={`border-[3px] border-black bg-white shadow-[4px_4px_0_0_#111111] p-7 hover:shadow-[6px_6px_0_0_#111111] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-300 ${
                  idx === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                {/* Section header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0"
                      style={{ backgroundColor: s.color, color: s.color === '#FFCB05' ? '#000' : '#fff' }}
                    >
                      {s.icon}
                    </div>
                    <div>
                      <span className="block attiz-mono text-[8px] font-bold text-black/35 tracking-widest uppercase">Section {s.num}</span>
                      <h2 className="attiz-display text-base uppercase tracking-wide text-black leading-tight">{s.title}</h2>
                    </div>
                  </div>
                  <span className="attiz-mono text-[9px] font-bold text-black/20 tracking-widest">{s.num}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-black/8 mb-5" />

                {/* Content */}
                <div>{s.content}</div>
              </div>
            ))}
          </div>

          {/* ── Bottom Statement Card ── */}
          <div className="relative border-[3px] border-black bg-white shadow-[6px_6px_0_0_#111111] p-8 md:p-12 text-center space-y-6 rotate-[-0.5deg]">
            {/* Yellow accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FFCB05]" />

            <h2 className="attiz-display text-3xl font-bold uppercase text-black">ATTIZ</h2>
            <p className="attiz-body text-sm text-black/65 leading-relaxed font-light max-w-2xl mx-auto">
              We believe in transparency, trust, and a seamless experience for every customer. These terms exist to protect both you and us — ensuring every ATTIZ interaction is fair, clear, and confident.
            </p>
            <div className="h-0.5 w-16 bg-black/10 mx-auto" />
            <div className="space-y-1">
              <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] tracking-[0.3em] uppercase block">Wear Your Attitude</span>
              <span className="attiz-body text-xs text-black/40 font-medium">Premium Streetwear • Quality • Authenticity • Style</span>
            </div>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                href="/#catalog-grid"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                Browse Catalog
              </Link>
              <Link
                href="/contact"
                className="inline-block py-3 px-8 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-white text-black shadow-[4px_4px_0_0_#111111] hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
              >
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
