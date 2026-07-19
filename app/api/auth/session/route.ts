import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';

/** GET /api/auth/session */
export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Session route error:', error);
    return NextResponse.json({ error: 'Failed to retrieve session.' }, { status: 500 });
  }
}
