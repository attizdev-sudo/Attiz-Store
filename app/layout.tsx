import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CartDrawer from '@/app/components/CartDrawer';
import FloatingWidgets from '@/app/components/FloatingWidgets';

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
              <div className="flex flex-col min-h-screen bg-white">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <CartDrawer />
                <FloatingWidgets />
              </div>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
