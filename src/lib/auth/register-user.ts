import { getDb } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createAndSendVerificationEmail } from "@/lib/auth/email-verification";
import { isEmailConfigured } from "@/lib/email/send-mail";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Imię: min. 2 znaki").max(80),
  email: z.string().email("Podaj poprawny adres e-mail"),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export async function registerUser(
  input: RegisterInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
  }

  const { name, email, password } = parsed.data;
  const pwdError = validatePasswordStrength(password);
  if (pwdError) return { ok: false, error: pwdError };

  if (!isEmailConfigured() && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Rejestracja e-mail jest tymczasowo niedostępna. Użyj logowania Google.",
    };
  }

  const normalized = email.toLowerCase().trim();
  const db = getDb();

  const passwordHash = await hashPassword(password);

  const existing = await db.user.findUnique({
    where: { email: normalized },
    include: { accounts: true },
  });

  if (existing?.passwordHash && existing.emailVerified) {
    return { ok: false, error: "Konto z tym adresem e-mail już istnieje." };
  }
  if (existing?.passwordHash && !existing.emailVerified) {
    await db.user.update({
      where: { id: existing.id },
      data: { name, passwordHash },
    });
    try {
      await createAndSendVerificationEmail(normalized, name);
      return { ok: true };
    } catch {
      return { ok: false, error: "Nie udało się wysłać e-maila aktywacyjnego." };
    }
  }
  if (existing?.emailVerified && existing.accounts.length > 0 && !existing.passwordHash) {
    return { ok: false, error: "Ten e-mail jest już powiązany z Google — użyj logowania Google." };
  }

  if (existing) {
    await db.user.update({
      where: { id: existing.id },
      data: { name, passwordHash, emailVerified: null },
    });
  } else {
    await db.user.create({
      data: {
        name,
        email: normalized,
        passwordHash,
      },
    });
  }

  try {
    await createAndSendVerificationEmail(normalized, name);
  } catch (err) {
    console.error("[register] email:", err);
    return {
      ok: false,
      error: "Nie udało się wysłać e-maila aktywacyjnego. Spróbuj później.",
    };
  }

  return { ok: true };
}
