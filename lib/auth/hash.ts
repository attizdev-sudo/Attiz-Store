import { hash, verify } from '@node-rs/argon2';

/**
 * Hash a password using Argon2id with standard safe default parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify a plaintext password matches its Argon2id hash.
 */
export async function verifyPassword(password: string, hashString: string): Promise<boolean> {
  try {
    return await verify(hashString, password);
  } catch {
    return false;
  }
}
