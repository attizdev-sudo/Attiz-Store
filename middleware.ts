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
      // Add 4-second timeout to prevent middleware from hanging if DB connection slows down
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const sessionData = await Promise.race([validateSession(sessionToken), timeoutPromise]);

      if (!sessionData) {
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
      // Safe fallback if session validation fails or times out
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
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

