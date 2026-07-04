import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import StoreLayoutShell from '@/app/components/StoreLayoutShell';

export const metadata: Metadata = {
  title: 'ATTIZ — Premium Clothing',
  description: 'Exquisitely crafted garments for modern sartorial heritage.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <StoreLayoutShell>
                {children}
              </StoreLayoutShell>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

