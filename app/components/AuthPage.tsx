'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const { signin, signup, user } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [signUpDetails, setSignUpDetails] = useState({ firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
  const [signInDetails, setSignInDetails] = useState({ phone: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, router]);

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignUpDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (signUpDetails.password !== signUpDetails.confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (signUpDetails.password.length < 6) { setErrorMsg('Password should be at least 6 characters.'); return; }
    setIsLoading(true);
    const res = await signup(signUpDetails.firstName, signUpDetails.lastName, signUpDetails.phone, signUpDetails.password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Account registered successfully! Logging you in...');
      setTimeout(() => { setSuccessMsg(''); router.push('/'); }, 2000);
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    const res = await signin(signInDetails.phone, signInDetails.password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => { setSuccessMsg(''); router.push(res.user?.role === 'admin' ? '/admin' : '/'); }, 1500);
    } else {
      setErrorMsg(res.message || 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream/25 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white border border-brand-cream-dark rounded-xl shadow-lg overflow-hidden relative">

        <div className="bg-brand-cream/45 p-8 border-b border-brand-cream-dark text-center">
          <div className="flex justify-center mb-3">
            <Image src="/ATTIZ.png" alt="ATTIZ Logo" width={120} height={48} className="h-12 w-auto object-contain" />
          </div>
          <p className="font-sans text-[10px] text-brand-dark/45 font-bold tracking-widest uppercase mt-1">
            {isLogin ? 'Welcome back' : 'Create an Account'}
          </p>
        </div>

        <div className="p-8">
          {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold tracking-wider text-center mb-5">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-50 text-brand-brown rounded text-xs font-semibold tracking-wider text-center mb-5">{successMsg}</div>}

          {isLogin ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-brand-dark/40 absolute left-3" />
                  <input type="tel" name="phone" required placeholder="9999999999" value={signInDetails.phone} onChange={handleSignInChange} className="w-full pl-10 pr-4 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-brand-dark/40 absolute left-3" />
                  <input type="password" name="password" required placeholder="••••••••" value={signInDetails.password} onChange={handleSignInChange} className="w-full pl-10 pr-4 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-6 py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors shadow-sm cursor-pointer">
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">First Name</label>
                  <input type="text" name="firstName" required placeholder="John" value={signUpDetails.firstName} onChange={handleSignUpChange} className="w-full px-4 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                </div>
                <div className="space-y-1">
                  <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Last Name</label>
                  <input type="text" name="lastName" required placeholder="Doe" value={signUpDetails.lastName} onChange={handleSignUpChange} className="w-full px-4 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-brand-dark/40 absolute left-3" />
                  <input type="tel" name="phone" required placeholder="9999999999" value={signUpDetails.phone} onChange={handleSignUpChange} className="w-full pl-10 pr-4 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-brand-dark/40 absolute left-3" />
                    <input type="password" name="password" required placeholder="••••••••" value={signUpDetails.password} onChange={handleSignUpChange} className="w-full pl-10 pr-3 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-sans text-[10px] font-bold tracking-widest text-brand-dark/50 uppercase">Confirm</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-brand-dark/40 absolute left-3" />
                    <input type="password" name="confirmPassword" required placeholder="••••••••" value={signUpDetails.confirmPassword} onChange={handleSignUpChange} className="w-full pl-10 pr-3 py-3 text-xs border border-brand-cream-dark rounded bg-white font-sans outline-none focus:border-brand-brown" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full mt-6 py-3.5 rounded bg-brand-brown hover:bg-brand-brown-dark disabled:bg-brand-brown/40 text-white text-[11px] font-bold tracking-[0.2em] uppercase transition-colors shadow-sm cursor-pointer">
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-brand-cream-dark flex items-center justify-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-[10px] font-bold tracking-[0.15em] text-brand-brown hover:text-brand-brown-dark transition-colors uppercase flex items-center space-x-1 cursor-pointer"
            >
              <span>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
