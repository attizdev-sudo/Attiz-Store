import { validateSession } from '@/lib/auth/session';

const secret = process.env.SESSION_SECRET || 'fallback-secret-for-development-only-attiz-secret';

/**
 * Sign a session payload using HMAC-SHA256 and return a base64-encoded signed string.
 */
export async function signSession(payload: { role: string; id: string }): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const serializedPayload = JSON.stringify(payload);
  const data = encoder.encode(serializedPayload);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  
  const hashArray = Array.from(new Uint8Array(signature));
  const sigHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  // Base64 encode the final signed payload
  const envelope = JSON.stringify({ payload, sig: sigHex });
  if (typeof btoa !== 'undefined') {
    return btoa(envelope);
  }
  return Buffer.from(envelope).toString('base64');
}

/**
 * Retrieve the session token from headers.
 */
export function getSessionCookieFromHeaders(headers: Headers | undefined): string | null {
  const fromHeader = headers?.get('x-attiz-session');
  if (fromHeader) return fromHeader;

  const authorization = headers?.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.replace(/^Bearer\s+/i, '');
  }

  return null;
}

/**
 * Verify a session token. Validates against database sessions first, falling back to HMAC token signature.
 */
export async function verifySession(cookieValue: string): Promise<{ role: string; id: string } | null> {
  if (!cookieValue) return null;

  try {
    const sessionData = await validateSession(cookieValue);
    if (sessionData?.user) {
      return {
        id: sessionData.user.id,
        role: sessionData.user.role,
      };
    }
  } catch {
    // Ignore error and try HMAC legacy fallback
  }

  try {
    const raw = typeof atob !== 'undefined' 
      ? atob(cookieValue) 
      : Buffer.from(cookieValue, 'base64').toString('utf-8');
      
    const { payload, sig } = JSON.parse(raw);
    
    if (!payload || !sig || !payload.id || !payload.role) {
      return null;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const serializedPayload = JSON.stringify(payload);
    const data = encoder.encode(serializedPayload);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedSig = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    
    if (sig === expectedSig) {
      return payload as { role: string; id: string };
    }
    return null;
  } catch {
    return null;
  }
}

