import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import StoreLayoutShell from '@/app/components/StoreLayoutShell';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-T2TWH6D9MQ';

export const metadata: Metadata = {
  title: 'ATTIZ® | Trending Premium Streetwear & Gen Z Fashion',
  description: 'Exquisitely crafted garments for modern sartorial heritage.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#ffffff" />
        {/* Google Tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <WishlistProvider>
            <StoreProvider>
              <CartProvider>
                <StoreLayoutShell>
                  {children}
                </StoreLayoutShell>
              </CartProvider>
            </StoreProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

