import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('attiz_session')?.value;

  // ── Protect /admin ────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    try {
      const session = JSON.parse(atob(sessionCookie));
      if (session?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // ── Protect /orders ───────────────────────────────────────────────────────
  if (pathname.startsWith('/orders')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*'],
};
