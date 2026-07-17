'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ChevronRight, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FAF8F5] mt-[-40px] relative overflow-hidden flex items-center justify-center py-20 px-4">
      {/* Halftone texture background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="w-full max-w-md border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.5deg] relative z-10">

        {/* Brand Header */}
        <div className="bg-[#FFCB05] p-8 border-b-[3px] border-black text-center relative">
          <div className="flex justify-center mb-3">
            <Image src="/ATTIZ.png" alt="ATTIZ Logo" width={110} height={44} className="h-11 w-auto object-contain" />
          </div>
          <span className="attiz-mono text-[9px] font-bold text-black tracking-[0.25em] uppercase block mt-2">
            {isLogin ? 'Welcome back' : 'Create an Account'}
          </span>
        </div>

        {/* Forms area */}
        <div className="p-8">
          
          {errorMsg && (
            <div className="p-3.5 bg-white text-[#E63B2E] border-2 border-[#E63B2E] shadow-[3px_3px_0_0_#E63B2E] text-xs font-bold tracking-widest text-center mb-6 uppercase">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-black text-[#FFCB05] border-2 border-black shadow-[3px_3px_0_0_#E63B2E] text-xs font-bold tracking-widest text-center mb-6 uppercase flex items-center justify-center space-x-2">
              <Check className="w-4 h-4 text-[#FFCB05]" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleSignInSubmit} className="space-y-5">
              
              {/* Phone number */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Phone Number *</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Phone className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9999999999"
                    value={signInDetails.phone}
                    onChange={handleSignInChange}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Password *</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Lock className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={signInDetails.password}
                    onChange={handleSignInChange}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-5">
              
              {/* Names split row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="JOHN"
                    value={signUpDetails.firstName}
                    onChange={handleSignUpChange}
                    className="w-full border-2 border-black px-4 py-3 text-xs bg-transparent outline-none attiz-body text-black placeholder-black/35 font-bold focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="DOE"
                    value={signUpDetails.lastName}
                    onChange={handleSignUpChange}
                    className="w-full border-2 border-black px-4 py-3 text-xs bg-transparent outline-none attiz-body text-black placeholder-black/35 font-bold focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Phone Number *</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Phone className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9999999999"
                    value={signUpDetails.phone}
                    onChange={handleSignUpChange}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Passwords split row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Password *</label>
                  <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                    <Lock className="w-4 h-4 text-black/45 absolute left-3.5" />
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="••••••••"
                      value={signUpDetails.password}
                      onChange={handleSignUpChange}
                      className="w-full pl-11 pr-3 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Confirm *</label>
                  <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                    <Lock className="w-4 h-4 text-black/45 absolute left-3.5" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={signUpDetails.confirmPassword}
                      onChange={handleSignUpChange}
                      className="w-full pl-11 pr-3 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>

            </form>
          )}

          {/* Bottom toggle */}
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
            className="w-full text-center flex items-center justify-center space-x-1.5 cursor-pointer pt-6 mt-8 border-t border-black/10 text-black hover:text-[#E63B2E] transition-colors uppercase attiz-mono text-[10px] font-bold tracking-[0.15em]"
          >
            <span>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </div>
  );
}
