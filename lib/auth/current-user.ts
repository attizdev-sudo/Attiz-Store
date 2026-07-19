import { getSessionToken } from './cookies';
import { validateSession } from './session';

/**
 * Retrieve the current authenticated user in a server-side context.
 * Automatically handles reading the cookie, checking the database,
 * and performing sliding window session updates.
 */
export async function getCurrentUser() {
  try {
    const token = await getSessionToken();
    if (!token) return null;

    const result = await validateSession(token);
    if (!result) return null;

    return result.user;
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
}
