import React from 'react';
import Link from 'next/link';
import { Shield, Database, Share2, Lock, Eye, RefreshCw, Mail, UserCheck } from 'lucide-react';

export const metadata = { title: 'Privacy Policy — ATTIZ' };

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

const keyPoints = [
  { label: 'Data Collected', value: 'Minimal & Necessary' },
  { label: 'Data Sold', value: 'Never' },
  { label: 'Payment Storage', value: 'Not on our servers' },
  { label: 'Security Standard', value: 'Industry-grade' },
];

const sections = [
  {
    num: '01', icon: <Database className="w-4 h-4" />, title: 'What We Collect', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">We collect only the information necessary to operate our services, including:</p>
        <BulletList items={[
          'Name, email address, phone number, and shipping address when you create an account or place an order.',
          'Payment information — processed securely through trusted payment partners. We do not store complete card details on our servers.',
          'Browsing behavior and preferences to personalize your shopping experience.',
          'Device and technical data (IP address, browser type) for security and analytics.',
        ]} />
      </>
    ),
  },
  {
    num: '02', icon: <Eye className="w-4 h-4" />, title: 'How We Use Your Data', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">Your information is used solely for:</p>
        <BulletList items={[
          'Processing and fulfilling your orders.',
          'Communicating order confirmations, shipping updates, and support responses.',
          'Improving our website, products, and services.',
          'Sending promotional emails (only with your consent — you can opt out anytime).',
          'Preventing fraud and maintaining account security.',
        ]} />
      </>
    ),
  },
  {
    num: '03', icon: <Share2 className="w-4 h-4" />, title: 'Sharing of Information', color: '#111111',
    content: (
      <>
        <div className="border-2 border-black p-4 bg-black text-white mb-4">
          <span className="attiz-display text-sm text-[#FFCB05] uppercase block mb-1">Our Promise</span>
          <span className="attiz-body text-xs text-white/80 font-light">ATTIZ never sells or rents your personal information to third parties.</span>
        </div>
        <p className="attiz-body text-sm text-black/70 font-light mb-3">We may share limited information only with trusted service providers who help us operate:</p>
        <BulletList items={[
          'Payment processors (to handle your transactions securely)',
          'Shipping and logistics partners (to deliver your orders)',
          'Technology and analytics providers (to run our website)',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-3">All third parties are bound by strict confidentiality and data protection obligations.</p>
      </>
    ),
  },
  {
    num: '04', icon: <Lock className="w-4 h-4" />, title: 'Data Security', color: '#E63B2E',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">We implement industry-standard security measures to safeguard your data, including:</p>
        <BulletList items={[
          'SSL/TLS encryption for all data transmitted through our website.',
          'Secure servers with restricted access controls.',
          'Regular security audits and monitoring.',
          'Trusted payment gateway integration — we never store raw payment card data.',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-3">While no online platform can guarantee absolute security, we continuously work to maintain a safe and reliable environment for our customers.</p>
      </>
    ),
  },
  {
    num: '05', icon: <UserCheck className="w-4 h-4" />, title: 'Your Rights', color: '#FFCB05',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">You have the right to:</p>
        <BulletList items={[
          'Access the personal information we hold about you.',
          'Request corrections to inaccurate or incomplete data.',
          'Request deletion of your personal data, subject to legal obligations.',
          'Opt out of marketing communications at any time.',
          'Withdraw consent where processing is based on consent.',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-3">To exercise any of these rights, contact us at <a href="mailto:support@attiz.com" className="text-[#E63B2E] hover:text-black underline underline-offset-2 transition-colors">support@attiz.com</a>.</p>
      </>
    ),
  },
  {
    num: '06', icon: <Shield className="w-4 h-4" />, title: 'Cookies & Tracking', color: '#111111',
    content: (
      <>
        <p className="attiz-body text-sm text-black/70 font-light mb-4">We use cookies and similar tracking technologies to:</p>
        <BulletList items={[
          'Keep you signed in and maintain your shopping cart.',
          'Understand how visitors use our website (analytics).',
          'Personalize content and product recommendations.',
        ]} />
        <p className="attiz-body text-sm text-black/70 font-light mt-3">You can manage cookie preferences through your browser settings. Disabling cookies may affect certain website features.</p>
      </>
    ),
  },
  {
    num: '07', icon: <RefreshCw className="w-4 h-4" />, title: 'Policy Updates', color: '#E63B2E',
    content: (
      <p className="attiz-body text-sm text-black/70 font-light">By using our website, you agree to the collection and use of your information as outlined in this Privacy Policy. If we make any updates, the revised version will be published on this page with an updated effective date. We encourage you to review this policy periodically.</p>
    ),
  },
  {
    num: '08', icon: <Mail className="w-4 h-4" />, title: 'Contact & Questions', color: '#FFCB05',
    content: (
      <div className="space-y-2">
        <p className="attiz-body text-sm text-black/70 font-light">If you have any questions or concerns regarding our Privacy Policy or the way your personal information is handled, our team is always happy to assist you.</p>
        <div className="flex items-center gap-3 pt-2">
          <Diamond />
          <a href="mailto:support@attiz.com" className="attiz-mono text-[11px] font-bold text-[#E63B2E] hover:text-black tracking-widest uppercase transition-colors">support@attiz.com</a>
        </div>
      </div>
    ),
  },
];

export default function PrivacyPolicyPage() {
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
              <span className="skew-x-6">Your Privacy</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">
              Privacy<br />Policy
            </h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <span className="attiz-mono text-[9px] font-bold text-black/40 tracking-widest uppercase border-2 border-black/10 px-3 py-1 inline-block">
              Effective: June 2026
            </span>
            <p className="attiz-body text-base leading-8 text-black/70 max-w-3xl font-light">
              At ATTIZ, your privacy is one of our highest priorities. We are committed to protecting your personal information and ensuring that your data is collected, used, and stored responsibly.
            </p>
          </div>

          {/* At-a-glance stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-[3px] border-black">
            {keyPoints.map((kp, i) => (
              <div key={i} className={`p-5 text-center ${i < keyPoints.length - 1 ? 'border-r-2 border-black/20' : ''}`}>
                <span className="block attiz-mono text-[8px] font-bold text-black/35 tracking-widest uppercase mb-2">{kp.label}</span>
                <span className="attiz-display text-sm text-black uppercase">{kp.value}</span>
              </div>
            ))}
          </div>

          {/* Quick Nav */}
          <div className="border-t-[3px] border-b-[3px] border-black py-6">
            <p className="attiz-mono text-[9px] font-bold text-black/35 tracking-widest uppercase mb-4">Jump to section</p>
            <div className="flex flex-wrap gap-2">
              {sections.slice(0, 6).map((s) => (
                <a key={s.num} href={`#pp-${s.num}`}
                  className="attiz-mono text-[9px] font-bold tracking-wider uppercase px-3 py-1.5 border-2 border-black text-black hover:bg-black hover:text-[#FFCB05] transition-all duration-200">
                  {s.num}. {s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sections.map((s, idx) => (
              <div key={s.num} id={`pp-${s.num}`}
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
            <h2 className="attiz-display text-3xl font-bold uppercase text-black">Your Trust, Our Priority</h2>
            <p className="attiz-body text-sm text-black/65 leading-relaxed font-light max-w-2xl mx-auto">
              ATTIZ is built on transparency and trust. We handle your data with the utmost care and are committed to keeping your shopping experience secure and private.
            </p>
            <div className="h-0.5 w-16 bg-black/10 mx-auto" />
            <span className="attiz-mono text-[9px] font-bold text-[#E63B2E] tracking-[0.3em] uppercase block">Premium Streetwear • Secure Shopping • Trusted Brand</span>
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
