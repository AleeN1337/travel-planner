import { getDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";

export type CredentialsInput = {
  email: string;
  password: string;
};

export async function authorizeCredentials(
  input: CredentialsInput,
): Promise<
  | { ok: true; user: { id: string; email: string; name: string | null; image: string | null } }
  | { ok: false; error: string }
> {
  const email = input.email?.toLowerCase().trim();
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Podaj e-mail i hasło." };
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return { ok: false, error: "Nieprawidłowy e-mail lub hasło." };
  }

  if (!user.emailVerified) {
    return {
      ok: false,
      error: "Konto nie jest aktywne. Sprawdź skrzynkę i kliknij link w e-mailu.",
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Nieprawidłowy e-mail lub hasło." };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email!,
      name: user.name,
      image: user.image,
    },
  };
}
