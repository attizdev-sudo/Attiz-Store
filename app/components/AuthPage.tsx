'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Phone, Lock, ChevronRight, Check, Mail, RefreshCw, MailCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Google Brand Icon ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center my-4">
      <div className="flex-1 border-t border-black/10" />
      <span className="px-3 attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase">
        {label}
      </span>
      <div className="flex-1 border-t border-black/10" />
    </div>
  );
}

// ── Input Field ────────────────────────────────────────────────────────────────
function Field({
  label,
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  required,
  suffix,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/50 uppercase block">
        {label}
      </label>
      <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
        <span className="absolute left-3 text-black/85">{icon}</span>
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-9 pr-9 py-2.5 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/30 font-bold tracking-wide"
        />
        {suffix && <span className="absolute right-3">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AuthPage({ defaultMode = 'login' }: { defaultMode?: 'login' | 'signup' }) {
  const { signin, signup, resendVerification, user, sessionLoading } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');

  const [signUpDetails, setSignUpDetails] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false });
  const [signInDetails, setSignInDetails] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<{ email: string; message: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSent, setResendSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, router]);

  // Handle URL parameters from Google OAuth redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      const google = params.get('google');

      if (google === 'success') {
        // Coming back from successful Google OAuth — show spinner while session loads
        setGoogleLoading(true);
        return;
      }

      if (error) {
        const messages: Record<string, string> = {
          google_auth_not_configured: 'Google Sign-In is not configured on the server.',
          invalid_state: 'Security validation failed. Please try again.',
          token_exchange_failed: 'Failed to connect with Google. Please try again.',
          userinfo_fetch_failed: 'Failed to retrieve your Google profile.',
          email_required: 'Your Google account must have an email address.',
          database_error: 'A database error occurred. Please try again.',
          registration_failed: 'Failed to create account. Please try again.',
          auth_internal_error: 'An internal server error occurred.',
        };
        setErrorMsg(messages[error] || error.replace(/_/g, ' ').toUpperCase());
      }
    }
  }, []);

  // Once session finishes loading, stop the google spinner
  useEffect(() => {
    if (!sessionLoading) {
      setGoogleLoading(false);
    }
  }, [sessionLoading]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignUpDetails((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    if (signUpDetails.password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    if (!signUpDetails.acceptTerms) { setErrorMsg('You must accept the terms & conditions.'); return; }
    setIsLoading(true);
    const res = await signup(signUpDetails.firstName, signUpDetails.lastName, signUpDetails.email, signUpDetails.phone, signUpDetails.password, signUpDetails.acceptTerms);
    setIsLoading(false);
    if (res.success) {
      if (res.pending) {
        setPendingVerification({ email: signUpDetails.email, message: res.message || '' });
      } else {
        setSuccessMsg('Account created! Redirecting...');
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
      setSuccessMsg('Welcome back!');
      setTimeout(() => { setSuccessMsg(''); router.push(res.user?.role === 'admin' ? '/admin' : '/'); }, 1500);
    } else {
      if (res.code === 'EMAIL_NOT_VERIFIED') setEmailNotVerified(true);
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

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    window.location.href = '/api/auth/google';
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
    setEmailNotVerified(false);
  };

  // ── Pending Verification Screen ──────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] mt-[-40px] flex items-center justify-center px-4 py-8">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
        <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.5deg] relative z-10">
          <div className="bg-[#FFCB05] p-6 border-b-[3px] border-black text-center">
            <Image src="/ATTIZ.png" alt="ATTIZ" width={90} height={36} className="h-9 w-auto object-contain mx-auto" />
            <span className="attiz-mono text-[8px] font-bold text-black tracking-[0.25em] uppercase block mt-2">Verify Your Email</span>
          </div>
          <div className="p-6 text-center">
            <div className="w-12 h-12 border-[3px] border-black bg-black flex items-center justify-center shadow-[4px_4px_0_0_#FFCB05] mx-auto mb-4">
              <MailCheck className="w-6 h-6 text-[#FFCB05]" />
            </div>
            <h2 className="attiz-display text-base tracking-wider uppercase text-black mb-2">Check Your Inbox</h2>
            <p className="attiz-mono text-[9px] text-black/85 tracking-wide leading-relaxed mb-1">Verification link sent to:</p>
            <p className="attiz-display text-sm text-black border-2 border-black bg-[#FFCB05]/30 py-2 px-4 mb-4 tracking-wider">
              {pendingVerification.email}
            </p>
            <p className="attiz-mono text-[9px] text-black/85 tracking-wide leading-relaxed mb-4">
              Click the link to activate your account. Expires in 24 hours.
            </p>
            {resendSent && (
              <div className="p-2.5 bg-black text-[#FFCB05] border-2 border-black text-[9px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 mb-3">
                <Check className="w-3 h-3" /><span>Resent! Check your inbox.</span>
              </div>
            )}
            <button
              onClick={() => handleResendVerification(pendingVerification.email)}
              disabled={resendCooldown > 0}
              className="w-full py-2.5 border-[3px] border-black attiz-display text-[10px] tracking-[0.15em] uppercase bg-white text-black shadow-[4px_4px_0_0_#111111] hover:bg-black hover:text-[#FFCB05] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </button>
            <button
              onClick={() => { setPendingVerification(null); setIsLogin(true); }}
              className="mt-3 attiz-mono text-[9px] font-bold tracking-widest text-black/85 hover:text-black uppercase underline cursor-pointer block w-full text-center"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Session Loading Screen (shown while checking session after Google OAuth) ──
  if (sessionLoading || googleLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] mt-[-40px] flex items-center justify-center px-4 py-8">
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
        <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.5deg] relative z-10">
          <div className="bg-[#111111] px-6 py-5 border-b-[3px] border-black flex items-center justify-between">
            <Image src="/ATTIZ.png" alt="ATTIZ" width={80} height={32} className="h-8 w-auto object-contain" />
            <span className="bg-[#FFCB05] text-black attiz-mono text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
              {googleLoading ? 'Google' : 'Loading'}
            </span>
          </div>
          <div className="p-10 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-[3px] border-black bg-black flex items-center justify-center shadow-[4px_4px_0_0_#FFCB05]">
              <Loader2 className="w-6 h-6 text-[#FFCB05] animate-spin" />
            </div>
            <p className="attiz-mono text-[9px] font-bold tracking-widest text-black/85 uppercase text-center">
              {googleLoading ? 'Signing you in with Google...' : 'Checking your session...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Auth Layout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F5] mt-[-40px] flex items-center justify-center px-4 py-8">
      {/* Halftone texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      />

      <div className="w-full max-w-sm border-[3px] border-black bg-white shadow-[8px_8px_0_0_#111111] rotate-[-0.4deg] relative z-10">

        {/* Brand Header */}
        <div className="bg-[#111111] px-6 py-5 border-b-[3px] border-black flex items-center justify-between">
          <Image src="/ATTIZ.png" alt="ATTIZ" width={80} height={32} className="h-8 w-auto object-contain" />
          <span className="bg-[#FFCB05] text-black attiz-mono text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </span>
        </div>

        <div className="p-6">
          {/* Error / Success banners */}
          {errorMsg && (
            <div className="p-2.5 bg-white text-[#E63B2E] border-2 border-[#E63B2E] shadow-[2px_2px_0_0_#E63B2E] text-[10px] font-bold tracking-wide text-center mb-3 uppercase leading-tight">
              {errorMsg}
              {emailNotVerified && (
                <div className="mt-2">
                  {resendSent ? (
                    <span className="flex items-center justify-center gap-1 text-black/85 text-[9px]">
                      <Check className="w-3 h-3 text-green-600" /> Sent! Check your inbox.
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(signInDetails.email)}
                      disabled={resendCooldown > 0}
                      className="flex items-center justify-center gap-1 mx-auto text-[9px] text-black underline hover:text-[#E63B2E] transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
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
            <div className="p-2.5 bg-black text-[#FFCB05] border-2 border-black text-[10px] font-bold tracking-wide text-center mb-3 uppercase flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" /><span>{successMsg}</span>
            </div>
          )}

          {/* ── Google CTA (Primary) ── */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading || googleLoading}
            className="w-full py-3 border-[3px] border-black bg-white text-black shadow-[4px_4px_0_0_#4285F4] hover:shadow-[2px_2px_0_0_#4285F4] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            <span className="attiz-body text-[13px] font-semibold tracking-wide">
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          <Divider label="or" />

          {/* ── Email / Password Forms ── */}
          {isLogin ? (
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <Field
                label="Email Address"
                icon={<Mail className="w-3.5 h-3.5" />}
                type="email"
                name="email"
                placeholder="YOUR@EMAIL.COM"
                value={signInDetails.email}
                onChange={handleSignInChange}
                required
              />
              <Field
                label="Password"
                icon={<Lock className="w-3.5 h-3.5" />}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={signInDetails.password}
                onChange={handleSignInChange}
                required
                suffix={
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-black/85 hover:text-black transition-colors cursor-pointer">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 border-[3px] border-black attiz-display text-[11px] tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/85 uppercase block">First Name *</label>
                  <input
                    type="text" name="firstName" required placeholder="JOHN"
                    value={signUpDetails.firstName} onChange={handleSignUpChange}
                    className="w-full border-2 border-black px-3 py-2.5 text-xs bg-transparent outline-none attiz-body text-black placeholder-black/30 font-bold focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/85 uppercase block">Last Name *</label>
                  <input
                    type="text" name="lastName" required placeholder="DOE"
                    value={signUpDetails.lastName} onChange={handleSignUpChange}
                    className="w-full border-2 border-black px-3 py-2.5 text-xs bg-transparent outline-none attiz-body text-black placeholder-black/30 font-bold focus:shadow-[3px_3px_0_0_#E63B2E] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all uppercase"
                  />
                </div>
              </div>

              <Field
                label="Email Address *"
                icon={<Mail className="w-3.5 h-3.5" />}
                type="email" name="email" placeholder="YOUR@EMAIL.COM"
                value={signUpDetails.email} onChange={handleSignUpChange} required
              />

              <div className="space-y-1">
                <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/85 uppercase block">Phone (Optional)</label>
                <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                  <Phone className="w-3.5 h-3.5 text-black/85 absolute left-3" />
                  <input
                    type="tel" name="phone" placeholder="9999999999"
                    value={signUpDetails.phone} onChange={handleSignUpChange}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/30 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/85 uppercase block">Password *</label>
                  <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                    <Lock className="w-3.5 h-3.5 text-black/40 absolute left-3" />
                    <input
                      type={showPassword ? 'text' : 'password'} name="password" required placeholder="••••••••"
                      value={signUpDetails.password} onChange={handleSignUpChange}
                      className="w-full pl-9 pr-8 py-2.5 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/30 font-bold"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 text-black/85 hover:text-black transition-colors cursor-pointer">
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="attiz-mono text-[8px] font-bold tracking-widest text-black/50 uppercase block">Confirm *</label>
                  <div className="relative flex items-center border-2 border-black bg-white focus-within:shadow-[3px_3px_0_0_#E63B2E] focus-within:translate-x-[-1px] focus-within:translate-y-[-1px] transition-all">
                    <Lock className="w-3.5 h-3.5 text-black/40 absolute left-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required placeholder="••••••••"
                      value={signUpDetails.confirmPassword} onChange={handleSignUpChange}
                      className="w-full pl-9 pr-8 py-2.5 text-xs bg-transparent border-none outline-none attiz-body text-black placeholder-black/30 font-bold"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-2 text-black/40 hover:text-black transition-colors cursor-pointer">
                      {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox" name="acceptTerms" id="acceptTerms" required
                  checked={signUpDetails.acceptTerms} onChange={handleSignUpChange}
                  className="w-3.5 h-3.5 mt-0.5 border-2 border-black accent-[#FFCB05] shrink-0 cursor-pointer"
                />
                <label htmlFor="acceptTerms" className="attiz-mono text-[9px] font-bold tracking-wide text-black/65 cursor-pointer uppercase select-none leading-tight">
                  I accept the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E63B2E] transition-colors">
                    Terms &amp; Conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 border-[3px] border-black attiz-display text-[11px] tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 mt-1"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Toggle mode */}
          <button
            onClick={switchMode}
            className="w-full text-center flex items-center justify-center gap-1 cursor-pointer pt-4 mt-4 border-t border-black/10 text-black hover:text-[#E63B2E] transition-colors uppercase attiz-mono text-[9px] font-bold tracking-[0.15em]"
          >
            <span>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
