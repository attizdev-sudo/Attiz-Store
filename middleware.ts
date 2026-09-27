import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('attiz_session')?.value;

  const protectedPaths = ['/admin', '/account', '/profile', '/orders', '/wishlist', '/checkout'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      let isTimedOut = false;
      const timeoutPromise = new Promise<'TIMEOUT'>((resolve) =>
        setTimeout(() => {
          isTimedOut = true;
          resolve('TIMEOUT');
        }, 5000)
      );
      const result = await Promise.race([validateSession(sessionToken), timeoutPromise]);

      if (result === 'TIMEOUT') {
        // Database took longer than 5s; do NOT log out the user or delete their cookie.
        // Allow the request to proceed so the page can handle session check gracefully.
        return NextResponse.next();
      }

      const sessionData = result;

      if (!sessionData) {
        // Session token was verified and is definitely invalid or expired in DB
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.delete('attiz_session');
        return redirectResponse;
      }

      // Restrict /admin access to admin roles only
      if (pathname.startsWith('/admin') && sessionData.user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      console.error('Middleware session validation error:', err);
      // Safe fallback on transient errors: do not log the user out
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/account',
    '/account/:path*',
    '/profile',
    '/profile/:path*',
    '/orders',
    '/orders/:path*',
    '/wishlist',
    '/wishlist/:path*',
    '/checkout',
    '/checkout/:path*',
  ],
};

