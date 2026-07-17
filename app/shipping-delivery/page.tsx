import React from 'react';

export default function ShippingDeliveryPage() {
  return (
    <main className="text-brand-dark">
      <section className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-brown">Shipping & Delivery</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">SHIPPING & DELIVERY POLICY</h1>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">Last Updated: June 2026</p>
            <p className="text-base leading-8 text-brand-dark/80 max-w-3xl">
              At ATTIZ, we are committed to delivering your orders safely, quickly, and efficiently. This Shipping & Delivery Policy outlines our shipping procedures, delivery timelines, and important information regarding your order.
            </p>
          </div>

          <div className="space-y-8">
            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Order Processing</h2>
              <p className="text-base leading-8 text-brand-dark/80">All orders are processed after successful payment verification.</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Orders are typically processed within 1–3 business days.</li>
                <li>Orders placed on weekends or public holidays will be processed on the next business day.</li>
                <li>During new product launches, promotional events, or peak seasons, processing times may be slightly longer.</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Once your order is shipped, you will receive a confirmation email or SMS with tracking details.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Shipping Coverage</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                ATTIZ currently ships across India. We are continuously working to expand our delivery network and may offer international shipping in the future.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Estimated Delivery Time</h2>
              <p className="text-base leading-8 text-brand-dark/80">Delivery times may vary depending on your location.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Standard Delivery</h3>
                  <ul className="mt-2 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                    <li>Metro Cities: 2–5 Business Days</li>
                    <li>Tier 2 & Tier 3 Cities: 3–7 Business Days</li>
                    <li>Remote Locations: 5–10 Business Days</li>
                  </ul>
                </div>
              </div>
              <p className="text-base leading-8 text-brand-dark/80">Please note that these timelines are estimates and may vary due to courier operations and external factors.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Shipping Charges</h2>
              <p className="text-base leading-8 text-brand-dark/80">Shipping charges, if applicable, will be displayed during checkout before payment.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Free Shipping</h3>
                  <p className="text-base leading-8 text-brand-dark/80">
                    ATTIZ may offer free shipping on eligible orders, promotional campaigns, or minimum purchase amounts as announced on the website.
                  </p>
                </div>
              </div>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Order Tracking</h2>
              <p className="text-base leading-8 text-brand-dark/80">Once your order has been dispatched, you will receive:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Tracking Number</li>
                <li>Courier Partner Information</li>
                <li>Shipment Updates</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">You can use the tracking information provided to monitor your delivery status.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Delivery Attempts</h2>
              <p className="text-base leading-8 text-brand-dark/80">Our courier partners will make delivery attempts at the shipping address provided during checkout.</p>
              <p className="text-base leading-8 text-brand-dark/80">If delivery cannot be completed due to:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Incorrect address</li>
                <li>Unavailability of recipient</li>
                <li>Refusal to accept delivery</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">additional delivery attempts or return procedures may apply. Customers are responsible for providing accurate delivery information.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Delayed Deliveries</h2>
              <p className="text-base leading-8 text-brand-dark/80">While we strive to deliver orders within the estimated timeframe, delays may occur due to:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Weather conditions</li>
                <li>Public holidays</li>
                <li>Natural disasters</li>
                <li>Transportation disruptions</li>
                <li>Courier service delays</li>
                <li>High order volumes</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">ATTIZ shall not be held responsible for delays caused by circumstances beyond our reasonable control.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Damaged Packages</h2>
              <p className="text-base leading-8 text-brand-dark/80">If you receive a package that appears damaged during transit:</p>
              <ol className="mt-4 space-y-3 list-decimal list-inside text-base leading-8 text-brand-dark/80">
                <li>Take clear photos of the package before opening.</li>
                <li>Record an unboxing video if possible.</li>
                <li>Contact our customer support team within 48 hours of delivery.</li>
              </ol>
              <p className="text-base leading-8 text-brand-dark/80">Our team will investigate and assist with the appropriate resolution.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Incorrect Shipping Information</h2>
              <p className="text-base leading-8 text-brand-dark/80">Customers are responsible for ensuring that all shipping details are accurate at the time of purchase.</p>
              <p className="text-base leading-8 text-brand-dark/80">ATTIZ is not responsible for delivery issues arising from:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Incorrect addresses</li>
                <li>Incomplete information</li>
                <li>Invalid contact details</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Additional shipping charges may apply if re-delivery is required.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Lost Shipments</h2>
              <p className="text-base leading-8 text-brand-dark/80">If your order tracking has not been updated for an extended period or your package appears lost:</p>
              <ul className="mt-4 space-y-2 list-disc list-inside text-base leading-8 text-brand-dark/80">
                <li>Contact our customer support team.</li>
                <li>We will coordinate with the courier partner to investigate the shipment.</li>
              </ul>
              <p className="text-base leading-8 text-brand-dark/80">Resolution timelines may vary depending on the courier's investigation process.</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">International Shipping</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                International shipping is currently unavailable unless otherwise stated on the website. Future availability will be announced through official ATTIZ channels.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p className="text-base leading-8 text-brand-dark/80">For shipping, delivery, or tracking-related assistance:</p>
              <p className="text-base leading-8 text-brand-dark/80">ATTIZ Customer Support</p>
              <p className="text-base leading-8 text-brand-dark/80">Email: <a href="mailto:support@attiz.com" className="text-brand-brown hover:text-brand-dark">support@attiz.com</a></p>
              <p className="text-base leading-8 text-brand-dark/80">Customer Service Hours:</p>
              <p className="text-base leading-8 text-brand-dark/80">Monday – Saturday</p>
              <p className="text-base leading-8 text-brand-dark/80">9:00 AM – 6:00 PM (IST)</p>
            </article>

            <article className="space-y-4">
              <h2 className="text-2xl font-bold">Our Commitment</h2>
              <p className="text-base leading-8 text-brand-dark/80">
                At ATTIZ, every order is handled with care to ensure your premium streetwear reaches you in excellent condition and as quickly as possible.
              </p>
              <p className="text-base leading-8 text-brand-dark/80">Thank you for shopping with ATTIZ.</p>
            </article>
          </div>

          <div className="rounded-3xl border border-brand-cream-dark/80 bg-brand-cream/10 p-8">
            <h2 className="text-2xl font-bold">ATTIZ</h2>
            <p className="mt-4 text-base leading-8 text-brand-dark/80">Premium Streetwear • Fast Delivery • Trusted Service</p>
            <p className="text-base leading-8 text-brand-dark/80">Wear Your Attitude.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
