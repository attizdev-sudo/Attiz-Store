import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('attiz_session')?.value;

  // ── Protect /admin ────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    const session = await verifySession(sessionCookie);
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // ── Protect /orders ───────────────────────────────────────────────────────
  if (pathname.startsWith('/orders')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    const session = await verifySession(sessionCookie);
    if (!session) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*'],
};

