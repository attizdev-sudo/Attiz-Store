'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CartDrawer from '@/app/components/CartDrawer';
import FloatingWidgets from '@/app/components/FloatingWidgets';

export default function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      {!isAdminPath && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <CartDrawer />}
      {!isAdminPath && <FloatingWidgets />}
    </div>
  );
}
