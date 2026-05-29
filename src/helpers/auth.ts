// src/helpers/auth.ts
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  if (!plain || !hashed) return false;
  return await bcrypt.compare(plain, hashed);
};
