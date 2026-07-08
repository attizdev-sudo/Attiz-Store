'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const { signin, logout } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const res = await signin(phone, password);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.message || 'Login failed.');
    } else if (res.user?.role !== 'admin') {
      setAuthError('Access denied. Not an administrator.');
      logout();
    }
  };

  const inputCls =
    'px-3 py-2 text-xs border border-brand-cream-dark rounded bg-white outline-none focus:border-brand-brown font-sans w-full transition-all';
  const labelCls =
    'text-[9px] font-bold text-brand-dark/50 uppercase tracking-wider block mb-1';

  return (
    <div className="min-h-screen bg-brand-cream/15 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white border border-brand-cream-dark rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <Database className="w-10 h-10 text-brand-brown mx-auto mb-2" />
          <h1 className="font-serif text-xl font-bold tracking-widest text-brand-dark uppercase">
            Admin Portal
          </h1>
          <p className="font-sans text-[10px] text-brand-dark/45 font-bold tracking-widest uppercase mt-1">
            Enter your administrator credentials.
          </p>
        </div>
        {authError && (
          <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold tracking-wider text-center mb-5">
            {authError}
          </div>
        )}
        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={labelCls}>Admin Phone or Email</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Admin Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={authLoading}
            className="w-full mt-6 py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer"
          >
            {authLoading ? 'VERIFYING...' : 'ENTER ADMIN CONSOLE'}
          </button>
        </form>
        <div className="mt-6 text-center border-t border-brand-cream-dark/60 pt-4">
          <button
            onClick={() => router.push('/')}
            className="text-[10px] font-bold tracking-widest text-brand-dark/50 hover:text-brand-brown uppercase transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    </div>
  );
}
