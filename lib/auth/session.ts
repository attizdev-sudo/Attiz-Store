import { supabase } from '@/lib/db';

/**
 * Generate a cryptographically secure random session token.
 * This is fully compatible with Edge and Node.js runtimes.
 */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Insert a new session row in the database and return the token and expiresAt date.
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days expiration

  const { error } = await supabase.from('sessions').insert({
    user_id: userId,
    session_token: token,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(`Failed to create session in database: ${error.message}`);
  }

  return { token, expiresAt };
}

/**
 * Validate a session token from the database, extend it if needed (sliding expiration),
 * and return the associated user and session metadata.
 */
export async function validateSession(token: string): Promise<{ session: any; user: any } | null> {
  if (!token) return null;

  const { data, error } = await supabase
    .from('sessions')
    .select('*, users(*)')
    .eq('session_token', token)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const expiresAt = new Date(data.expires_at);
  if (Date.now() >= expiresAt.getTime()) {
    // Session has expired, remove from database
    await supabase.from('sessions').delete().eq('session_token', token);
    return null;
  }

  // Sliding window: extend session if it's within 15 days of expiration
  const isNearExpiration = expiresAt.getTime() - Date.now() < 15 * 24 * 60 * 60 * 1000;
  const lastActiveDate = new Date(data.last_active);
  const timeSinceLastActive = Date.now() - lastActiveDate.getTime();

  // Avoid spamming db updates on every click, update if near expiration or inactive for > 1 min
  if (isNearExpiration || timeSinceLastActive > 60 * 1000) {
    const nextExpiresAt = isNearExpiration
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : expiresAt;

    await supabase
      .from('sessions')
      .update({
        last_active: new Date().toISOString(),
        expires_at: nextExpiresAt.toISOString(),
      })
      .eq('session_token', token);

    data.expires_at = nextExpiresAt.toISOString();
    data.last_active = new Date().toISOString();
  }

  // Deconstruct and filter out sensitive user credentials
  const { users: rawUser, ...session } = data;
  if (!rawUser) return null;

  const { password_hash, ...user } = rawUser;
  return { session, user };
}

/**
 * Delete a session token from the database.
 */
export async function destroySession(token: string): Promise<void> {
  if (!token) return;
  await supabase.from('sessions').delete().eq('session_token', token);
}

/**
 * Revoke all sessions belonging to a specific user (logout from all devices).
 */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  if (!userId) return;
  await supabase.from('sessions').delete().eq('user_id', userId);
}
