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
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const sessionData = await validateSession(sessionToken);
    if (!sessionData) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.delete('attiz_session');
      return redirectResponse;
    }

    // Restrict /admin access to admin roles only
    if (pathname.startsWith('/admin') && sessionData.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/checkout/:path*',
  ],
};

