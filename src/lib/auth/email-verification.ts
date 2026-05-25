import { randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import { getAuthBaseUrl } from "@/lib/auth/get-auth-base-url";
import { sendMail } from "@/lib/email/send-mail";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createAndSendVerificationEmail(
  email: string,
  name?: string | null,
): Promise<void> {
  const db = getDb();
  const normalized = email.toLowerCase().trim();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await db.verificationToken.deleteMany({
    where: { identifier: normalized },
  });

  await db.verificationToken.create({
    data: {
      identifier: normalized,
      token,
      expires,
    },
  });

  const verifyUrl = `${getAuthBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalized)}`;

  const greeting = name ? `Cześć ${name}` : "Cześć";
  const text = `${greeting},

Potwierdź rejestrację w Planerze Podróży — kliknij link (ważny 24 h):

${verifyUrl}

Jeśli to nie Ty, zignoruj tę wiadomość.`;

  const html = `
    <p>${greeting},</p>
    <p>Potwierdź rejestrację w <strong>Planerze Podróży</strong>:</p>
    <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2dd4bf;color:#0f172a;text-decoration:none;border-radius:8px;font-weight:600;">Aktywuj konto</a></p>
    <p style="color:#666;font-size:14px;">Link ważny 24 godziny. Jeśli przycisk nie działa, wklej w przeglądarce:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
  `;

  await sendMail({
    to: normalized,
    subject: "Potwierdź rejestrację — Planer Podróży",
    html,
    text,
  });
}

export async function verifyEmailToken(
  email: string,
  token: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = getDb();
  const normalized = email.toLowerCase().trim();

  const record = await db.verificationToken.findFirst({
    where: { identifier: normalized, token },
  });

  if (!record) {
    return { ok: false, reason: "Nieprawidłowy lub wygasły link aktywacyjny." };
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: record.identifier,
          token: record.token,
        },
      },
    });
    return { ok: false, reason: "Link aktywacyjny wygasł. Zarejestruj się ponownie." };
  }

  const user = await db.user.findUnique({ where: { email: normalized } });
  if (!user) {
    return { ok: false, reason: "Nie znaleziono konta." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  return { ok: true };
}
