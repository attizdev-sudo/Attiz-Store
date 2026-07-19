import React from 'react';

export default function RefundReturnPage() {
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
              <span className="skew-x-6">CANCELLATION & RETURN POLICY</span>
            </span>
            <h1 className="attiz-display text-5xl sm:text-7xl uppercase leading-[0.95] tracking-tight text-black">CANCELLATION & RETURN POLICY</h1>
            <div className="h-1 w-24 bg-[#E63B2E] my-4 mx-auto md:mx-0" />
            <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-light"><strong>Effective Date:</strong> July 2026</p>
            <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-light"><strong>Last Updated:</strong> July 2026</p>
            <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-light">
              At <strong>ATTIZ</strong>, we strive to provide a smooth and satisfying shopping experience. If you need to cancel an order or return a product, please review the policy below.
            </p>
          </div>

          <div className="space-y-8">
            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Order Cancellation</h2>
              <h3 className="attiz-mono text-sm font-bold uppercase text-black/70">Before Shipment</h3>
              <p className="attiz-body text-base text-black/75 leading-8 max-w-3xl">You may cancel your order <strong>before it has been shipped</strong> by contacting our customer support team. If your cancellation request is approved, your order will be canceled immediately and a full refund will be processed to your original payment method. Refunds are typically initiated within <strong>2–5 business days</strong>.</p>

              <h3 className="attiz-mono text-sm font-bold uppercase text-black/70">After Shipment</h3>
              <p className="attiz-body text-base text-black/75 leading-8 max-w-3xl">Once your order has been dispatched, it cannot be canceled. If you no longer wish to keep the product, you may request a return after delivery, subject to our Return Policy.</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Return Eligibility</h2>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>The return request is made within <strong>7 days</strong> of receiving your order.</li>
                <li>The product is <strong>unused, unwashed, unworn</strong>, and in its original condition.</li>
                <li>All original tags, labels, accessories, and packaging are intact.</li>
                <li>The item is not damaged due to misuse or improper handling after delivery.</li>
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Non-Returnable Items</h2>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>Customized or personalized products.</li>
                <li>Gift cards or promotional vouchers.</li>
                <li>Products marked as <strong>Final Sale</strong> or <strong>Clearance Sale</strong>.</li>
                <li>Items that have been used, washed, altered, or damaged by the customer.</li>
                <li>Products without original tags or packaging.</li>
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Damaged, Defective, or Incorrect Products</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">If you receive a product that is damaged during shipping, defective due to a manufacturing issue, or different from the item you ordered, please contact us within <strong>48 hours of delivery</strong> and provide:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>Your Order Number</li>
                <li>Clear photos of the product</li>
                <li>Photos of the packaging</li>
                <li>An unboxing video (recommended)</li>
              </ul>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">After verification, we will arrange a replacement, exchange, or refund at no additional cost.</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Exchange Policy</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">We offer exchanges for incorrect size (subject to stock availability), defective products, and incorrect items received. If the requested product or size is unavailable, we may offer a refund or store credit.</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Refund Policy</h2>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>Approved refunds will be processed to your original payment method after we receive and inspect the returned product.</li>
                <li>Refunds are generally initiated within <strong>2–5 business days</strong>.</li>
                <li>Depending on your bank or payment provider, it may take an additional <strong>5–10 business days</strong> for the amount to reflect in your account.</li>
              </ul>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">Shipping charges are non-refundable unless the return is due to an error on our part.</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Return Shipping</h2>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>If the return is due to a damaged, defective, or incorrect product, ATTIZ will bear the return shipping cost.</li>
                <li>For all other eligible returns, return shipping charges may be the customer's responsibility unless otherwise stated.</li>
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">How to Request a Cancellation or Return</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">To request a cancellation or return, please contact our Customer Support with the following details:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside attiz-body text-base leading-8 text-black/75 max-w-3xl">
                <li>Order Number</li>
                <li>Full Name</li>
                <li>Registered Email Address</li>
                <li>Contact Number</li>
                <li>Reason for Cancellation or Return</li>
                <li>Photos (if applicable)</li>
              </ul>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">Email: <a href="mailto:support@attiz.com" className="text-[#E63B2E] font-bold">support@attiz.com</a></p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">ATTIZ's Right to Refuse Requests</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">ATTIZ reserves the right to reject cancellation, return, or refund requests if the request does not comply with this policy, the returned product is not in its original condition, or evidence of misuse, damage, or fraudulent activity is found.</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Contact Us</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">If you have any questions about our Cancellation & Return Policy, we're here to help.</p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">ATTIZ Customer Support</p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl"><strong>Email:</strong> <a href="mailto:support@attiz.com" className="text-[#E63B2E] font-bold">support@attiz.com</a></p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">Customer Support Hours: Monday – Saturday, 9:00 AM – 6:00 PM (IST)</p>
            </article>

            <article className="space-y-4">
              <h2 className="attiz-display text-2xl font-bold uppercase">Our Commitment</h2>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">At <strong>ATTIZ</strong>, we are committed to delivering premium-quality streetwear and providing a fair, transparent, and hassle-free return experience. Your satisfaction is important to us, and our team is always ready to assist you.</p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl font-bold">ATTIZ</p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">Premium Streetwear • Hassle-Free Shopping • Customer First</p>
              <p className="attiz-body text-base leading-8 text-black/75 max-w-3xl">Wear Your Attitude.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
