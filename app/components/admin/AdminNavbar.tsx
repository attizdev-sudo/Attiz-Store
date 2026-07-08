'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-brand-cream-dark sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
          <Image
            src="/ATTIZ.png"
            alt="ATTIZ Admin"
            width={80}
            height={32}
            style={{ width: 'auto', height: '2rem' }}
            className="object-contain"
          />
          <span className="bg-brand-dark text-white text-[8px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">
            Admin Console
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <span className="font-sans text-[10px] font-bold tracking-widest text-brand-dark/60 uppercase">
            Hello, {user.first_name}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 text-red-600 hover:text-red-800 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
