import type { Metadata } from 'next';
import { Anton, Space_Mono, Work_Sans, Alex_Brush } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import StoreLayoutShell from '@/app/components/StoreLayoutShell';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anton',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-work-sans',
});

const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-alex-brush',
});

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
    <html lang="en" className={`${anton.variable} ${spaceMono.variable} ${workSans.variable} ${alexBrush.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://db.onlinewebfonts.com" />
        <link rel="preconnect" href="https://jqwitqkpsbgnubsrjwah.supabase.co" />
        <link rel="dns-prefetch" href="https://jqwitqkpsbgnubsrjwah.supabase.co" />
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

