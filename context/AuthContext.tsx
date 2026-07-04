'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import type { SessionUser } from '@/lib/types';

interface AuthContextValue {
  user: SessionUser | null;
  signin: (phoneOrEmail: string, password: string) => Promise<{ success: boolean; message?: string; user?: SessionUser }>;
  signup: (firstName: string, lastName: string, phone: string, password: string) => Promise<{ success: boolean; message?: string; user?: SessionUser }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearSessionCookie() {
  document.cookie = 'attiz_session=; path=/; max-age=0; SameSite=Strict';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const hasCookie = document.cookie.split(';').some((c) => c.trim().startsWith('attiz_session='));
      if (!hasCookie) {
        localStorage.removeItem('auth_session');
        setUser(null);
        return;
      }
      const saved = localStorage.getItem('auth_session');
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_session');
      clearSessionCookie();
    }
  }, [user]);


  const signin = async (phoneOrEmail: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.error || 'Sign in failed.' };
      setUser(json.user);
      return { success: true, user: json.user as SessionUser };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (firstName: string, lastName: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.error || 'Registration failed.' };
      if (json.user) setUser(json.user as SessionUser);
      return { success: true, user: json.user as SessionUser };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
