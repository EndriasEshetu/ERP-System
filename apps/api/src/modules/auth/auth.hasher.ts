import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with work factor 12.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a candidate plaintext password with a stored bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
