import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import StoreLayoutShell from '@/app/components/StoreLayoutShell';

export const metadata: Metadata = {
  title: 'ATTIZ — Premium Clothing',
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

