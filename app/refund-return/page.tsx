import React from 'react';

export default function RefundReturnPage() {
  return (
    <main className="bg-white text-brand-dark">
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-brown">Refund & Return</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">REFUND & RETURN POLICY</h1>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">Last Updated: June 2026</p>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              At ATTIZ, customer satisfaction is our priority. If you are not completely satisfied with your purchase, we are here to help. Please read our Refund & Return Policy carefully to understand the conditions for returns, exchanges, and refunds.
            </p>
          </div>

          <div className="space-y-8">
            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Return Eligibility</h2>
              <p className="text-base leading-8 text-brand-dark/80">You may request a return if:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>The item was delivered damaged, defective, or incorrect.</li>
                <li>The product is unused, unworn, unwashed, and in its original condition.</li>
                <li>All original tags, labels, and packaging are intact.</li>
                <li>The return request is submitted within 7 days of delivery.</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Items that do not meet these conditions may not be eligible for return or refund.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Non-Returnable Items</h2>
              <p className="text-base leading-8 text-brand-dark/80">The following items cannot be returned or exchanged:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Products purchased during clearance or final sale promotions.</li>
                <li>Gift cards and promotional vouchers.</li>
                <li>Customized or personalized products.</li>
                <li>Items that have been worn, washed, altered, or damaged after delivery.</li>
                <li>Products without original tags or packaging.</li>
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">How to Request a Return</h2>
              <p className="text-base leading-8 text-brand-dark/80">To initiate a return:</p>
              <ol className="mt-4 space-y-3 list-decimal list-inside text-base leading-8 text-brand-dark/80">
                <li>Contact our customer support team.</li>
                <li>
                  Provide your:
                  <ul className="mt-2 ml-6 space-y-1 list-disc list-inside">
                    <li>Order Number</li>
                    <li>Full Name</li>
                    <li>Registered Email Address</li>
                    <li>Reason for Return</li>
                    <li>Photos (if the item is damaged, defective, or incorrect)</li>
                  </ul>
                </li>
                <li>Our team will review your request and provide return instructions.</li>
              </ol>
              <p className="text-base leading-8 text-brand-dark/80 mt-4">Email: <a href="mailto:support@attiz.com" className="text-brand-brown hover:text-brand-dark">support@attiz.com</a></p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Exchange Policy</h2>
              <p className="text-base leading-8 text-brand-dark/80">We offer exchanges for:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Size-related issues (subject to stock availability).</li>
                <li>Defective or damaged products.</li>
                <li>Incorrect items received.</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">If the requested size or product is unavailable, a refund or store credit may be offered.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Refund Policy</h2>
              <p className="text-base leading-8 text-brand-dark/80">Once the returned item is received and inspected:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Approved refunds will be processed to the original payment method.</li>
                <li>Refund processing times may vary depending on your payment provider or bank.</li>
                <li>Shipping charges (if applicable) are generally non-refundable unless the return is due to our error.</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">You will receive an email confirmation once your refund has been initiated.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Damaged, Defective, or Wrong Items</h2>
              <p className="text-base leading-8 text-brand-dark/80">If you receive:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>A damaged product</li>
                <li>A manufacturing defect</li>
                <li>An incorrect item</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Please contact us within 48 hours of delivery and provide clear photos of the issue. After verification, we will arrange a replacement, exchange, or refund at no additional cost.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Cancellation Policy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Before Shipment</h3>
                  <p className="text-base leading-8 text-brand-dark/80">Orders may be canceled before dispatch for a full refund.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">After Shipment</h3>
                  <p className="text-base leading-8 text-brand-dark/80">Orders that have already been shipped cannot be canceled and must follow the return process after delivery.</p>
                </div>
              </div>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Return Shipping</h2>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Customers may be responsible for return shipping costs unless the return is due to a damaged, defective, or incorrect item.</li>
                <li>ATTIZ reserves the right to determine the most suitable return method.</li>
              </ul>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Refund Processing Time</h2>
              <p className="text-base leading-8 text-brand-dark/80">After approval:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Refund initiation: 2–5 business days</li>
                <li>Bank or payment provider processing: 5–10 business days (may vary)</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Total processing time may vary depending on the payment method used.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">ATTIZ Quality Guarantee</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                Every ATTIZ product is carefully inspected before shipping. We are committed to providing premium-quality streetwear and ensuring a smooth shopping experience for our customers.
              </p>
              <p className="text-base leading-8 text-brand-dark/80">
                If you experience any issues with your order, our support team will work to resolve them as quickly as possible.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p className="text-base leading-8 text-brand-dark/80">For any return, exchange, refund, or order-related questions:</p>
              <p className="text-base leading-8 text-brand-dark/80">ATTIZ Customer Support</p>
              <p className="text-base leading-8 text-brand-dark/80">Email: <a href="mailto:support@attiz.com" className="text-brand-brown hover:text-brand-dark">support@attiz.com</a></p>
              <p className="text-base leading-8 text-brand-dark/80">Customer Service Hours:</p>
              <p className="text-base leading-8 text-brand-dark/80">Monday – Saturday</p>
              <p className="text-base leading-8 text-brand-dark/80">9:00 AM – 6:00 PM (IST)</p>
            </article>
          </div>

          <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
            <h2 className="text-2xl font-bold">ATTIZ</h2>
            <p className="mt-4 text-base leading-8 text-brand-dark/80">Premium Streetwear • Quality You Can Trust</p>
            <p className="text-base leading-8 text-brand-dark/80">Wear Your Attitude.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
