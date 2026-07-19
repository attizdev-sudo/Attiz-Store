'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ChevronRight, Check, Mail, RefreshCw, MailCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage({ defaultMode = 'login' }: { defaultMode?: 'login' | 'signup' }) {
  const { signin, signup, resendVerification, user } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');

  const [signUpDetails, setSignUpDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
  const [signInDetails, setSignInDetails] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // email_not_verified: shows resend button on login screen
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  // pendingEmail: shows "check your inbox" screen after signup
  const [pendingVerification, setPendingVerification] = useState<{ email: string; message: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignUpDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    if (!signUpDetails.acceptTerms) { setErrorMsg('You must accept the terms & conditions.'); return; }
    setIsLoading(true);
    const res = await signup(
      signUpDetails.firstName,
      signUpDetails.lastName,
      signUpDetails.email,
      signUpDetails.phone,
      signUpDetails.password,
      signUpDetails.acceptTerms
    );
    setIsLoading(false);
    if (res.success) {
      if (res.pending) {
        // Email verification required — show the pending screen
        setPendingVerification({ email: signUpDetails.email, message: res.message || '' });
      } else {
        setSuccessMsg('Account registered successfully! Logging you in...');
        setTimeout(() => { setSuccessMsg(''); router.push('/'); }, 2000);
      }
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailNotVerified(false);
    setIsLoading(true);
    const res = await signin(signInDetails.email, signInDetails.password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => { setSuccessMsg(''); router.push(res.user?.role === 'admin' ? '/admin' : '/'); }, 1500);
    } else {
      if (res.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true);
      }
      setErrorMsg(res.message || 'Sign in failed.');
    }
  };

  const handleResendVerification = async (email: string) => {
    if (resendCooldown > 0) return;
    setResendSent(false);
    await resendVerification(email);
    setResendSent(true);
    setResendCooldown(60);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // PENDING VERIFICATION SCREEN (shown after signup until email is verified)
  // ────────────────────────────────────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] mt-[-40px] relative overflow-hidden flex items-center justify-center py-20 px-4">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] z-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="w-full max-w-md border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.5deg] relative z-10">
          {/* Header */}
          <div className="bg-[#FFCB05] p-8 border-b-[3px] border-black text-center">
            <div className="flex justify-center mb-3">
              <Image src="/ATTIZ.png" alt="ATTIZ Logo" width={110} height={44} className="h-11 w-auto object-contain" />
            </div>
            <span className="attiz-mono text-[9px] font-bold text-black tracking-[0.25em] uppercase block mt-2">Verify Your Email</span>
          </div>
          {/* Body */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 border-[3px] border-black bg-black flex items-center justify-center shadow-[4px_4px_0_0_#FFCB05]">
                <MailCheck className="w-7 h-7 text-[#FFCB05]" />
              </div>
            </div>
            <h2 className="attiz-display text-lg tracking-wider uppercase text-black mb-3">Check Your Inbox</h2>
            <p className="attiz-mono text-[10px] text-black/60 tracking-wide leading-relaxed mb-2">
              We sent a verification link to:
            </p>
            <p className="attiz-display text-sm text-black border-2 border-black bg-[#FFCB05]/30 py-2 px-4 mb-6 tracking-wider">
              {pendingVerification.email}
            </p>
            <p className="attiz-mono text-[10px] text-black/50 tracking-wide leading-relaxed mb-6">
              Click the link in the email to activate your account. The link expires in 24 hours.
            </p>

            {resendSent && (
              <div className="p-3 bg-black text-[#FFCB05] border-2 border-black text-[10px] font-bold tracking-widest uppercase flex items-center justify-center space-x-2 mb-4">
                <Check className="w-3.5 h-3.5" />
                <span>Verification email resent!</span>
              </div>
            )}

            <button
              onClick={() => handleResendVerification(pendingVerification.email)}
              disabled={resendCooldown > 0}
              className="w-full py-3 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-white text-black shadow-[4px_4px_0_0_#111111] hover:bg-black hover:text-[#FFCB05] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => { setPendingVerification(null); setIsLogin(true); }}
              className="mt-4 attiz-mono text-[9px] font-bold tracking-widest text-black/50 hover:text-black uppercase underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="p-3.5 bg-white text-[#E63B2E] border-2 border-[#E63B2E] shadow-[3px_3px_0_0_#E63B2E] text-xs font-bold tracking-widest text-center mb-3 uppercase">
              {errorMsg}
              {/* Resend verification button — shown inline when email is not verified */}
              {emailNotVerified && (
                <div className="mt-3">
                  {resendSent ? (
                    <span className="flex items-center justify-center gap-1.5 text-black/60 text-[9px]">
                      <Check className="w-3 h-3 text-green-600" /> Sent! Check your inbox.
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(signInDetails.email)}
                      disabled={resendCooldown > 0}
                      className="flex items-center justify-center gap-1.5 mx-auto text-[9px] text-black underline hover:text-[#E63B2E] transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}
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
              
              {/* Email address */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Email Address *</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Mail className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="YOUR@EMAIL.COM"
                    value={signInDetails.email}
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

              {/* Email address */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Email Address *</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Mail className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="YOUR@EMAIL.COM"
                    value={signUpDetails.email}
                    onChange={handleSignUpChange}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/35 font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="attiz-mono text-[9px] font-bold tracking-widest text-black/60 uppercase block">Phone Number (Optional)</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Phone className="w-4 h-4 text-black/45 absolute left-3.5" />
                  <input
                    type="tel"
                    name="phone"
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

              {/* Accept Terms & Conditions */}
              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                  required
                  checked={signUpDetails.acceptTerms}
                  onChange={handleSignUpChange}
                  className="w-4 h-4 mt-0.5 border-2 border-black accent-[#FFCB05] shrink-0 cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="attiz-mono text-[10px] font-bold tracking-wide text-black/75 cursor-pointer uppercase select-none">
                  I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E63B2E] transition-colors">Terms & Conditions</a> *
                </label>
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
