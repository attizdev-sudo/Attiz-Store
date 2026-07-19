import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] py-20 relative overflow-hidden text-black">
      {/* Halftone texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-16">
          <div className="space-y-6 text-center md:text-left">
            <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-2">
              <span className="skew-x-6">Privacy Policy</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">PRIVACY POLICY</h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />

            <div className="space-y-4 attiz-body text-base leading-8 text-black/75 max-w-3xl font-light">
              <p>
                At <strong>ATTIZ</strong>, your privacy is one of our highest priorities. We are committed to protecting your personal information and
                ensuring that your data is collected, used, and stored responsibly. Whether you're browsing our website, creating an account, or placing an order, we
                strive to provide a secure and transparent shopping experience.
              </p>

              <p>
                We collect only the information necessary to process your orders, improve our services, communicate with you, and personalize your
                shopping experience. Your payment information is handled securely through trusted payment partners, and we do not store your complete payment card
                details on our servers.
              </p>

              <p>
                <strong>ATTIZ never sells or rents your personal information to third parties.</strong> We may share limited information only with trusted service
                providers, such as payment processors, shipping partners, and technology providers, to fulfill your orders and operate our website efficiently.
              </p>

              <p>
                We implement industry-standard security measures to safeguard your data against unauthorized access, misuse, or disclosure. While no online platform
                can guarantee absolute security, we continuously work to maintain a safe and reliable environment for our customers.
              </p>

              <p>
                By using our website, you agree to the collection and use of your information as outlined in this Privacy Policy. If we make any updates to this policy,
                the revised version will be published on this page with an updated effective date.
              </p>

              <p>
                If you have any questions or concerns regarding our Privacy Policy or the way your personal information is handled, please contact us at
                <a href="mailto:support@attiz.com" className="text-[#E63B2E] font-bold"> support@attiz.com</a>. Our team is always happy to assist you.
              </p>

              <p className="font-bold">ATTIZ</p>
              <p className="attiz-body text-sm text-black/75 font-medium">Premium Streetwear • Secure Shopping • Trusted Brand</p>
              <p className="attiz-body text-sm text-black/75 font-medium">Wear Your Attitude.</p>
            </div>

            <div className="pt-6">
              <Link href="/" className="attiz-mono text-sm font-bold text-black/70 hover:text-black">Back to Home</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
