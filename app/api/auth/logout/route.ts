import { NextResponse } from 'next/server';
import { getSessionToken, destroySession, deleteSessionCookie } from '@/lib/auth/auth';

/** POST /api/auth/logout */
export async function POST() {
  try {
    const token = await getSessionToken();
    if (token) {
      // Remove session from DB
      await destroySession(token);
    }

    // Delete cookie on client
    await deleteSessionCookie();

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during logout.' }, { status: 500 });
  }
}
