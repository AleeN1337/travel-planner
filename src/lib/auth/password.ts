import bcrypt from "bcryptjs";

const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków.";
  }
  if (password.length > 128) {
    return "Hasło jest zbyt długie.";
  }
  return null;
}
