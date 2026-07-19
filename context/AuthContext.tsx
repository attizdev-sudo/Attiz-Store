'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { SessionUser } from '@/lib/types';

interface AuthContextValue {
  user: SessionUser | null;
  signin: (email: string, password: string) => Promise<{ success: boolean; message?: string; code?: string; user?: SessionUser }>;
  signup: (firstName: string, lastName: string, email: string, phone: string, password: string, acceptTerms: boolean) => Promise<{ success: boolean; pending?: boolean; message?: string; user?: SessionUser }>;
  resendVerification: (email: string) => Promise<{ ok: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const json = await res.json();
          if (json.user) {
            setUser(json.user);
          } else {
            setUser(null);
          }
        }
      } catch {
        setUser(null);
      }
    }
    checkSession();
  }, []);

  const signin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.error || 'Sign in failed.', code: json.code };
      setUser(json.user);
      return { success: true, user: json.user as SessionUser };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, phone: string, password: string, acceptTerms: boolean) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password, acceptTerms }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.error || 'Registration failed.' };
      // pending = true means email verification is required, no auto-login
      if (json.pending) return { success: true, pending: true, message: json.message };
      if (json.user) setUser(json.user as SessionUser);
      return { success: true, user: json.user as SessionUser };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* silent */ }
    return { ok: true };
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error during logout fetch:', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signin, signup, resendVerification, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
