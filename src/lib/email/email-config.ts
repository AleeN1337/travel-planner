import { sanitizeEnvValue } from "@/lib/auth-env";

const TEST_RESEND_FROM_PATTERN = /onboarding@resend\.dev/i;

export function getResendApiKey(): string | undefined {
  return sanitizeEnvValue(process.env.RESEND_API_KEY);
}

export function getEmailServer(): string | undefined {
  return sanitizeEnvValue(process.env.EMAIL_SERVER);
}

/** Adres nadawcy — w produkcji musi być ze zweryfikowanej domeny (Resend) lub konta SMTP. */
export function getFromAddress(): string {
  return (
    sanitizeEnvValue(process.env.EMAIL_FROM) ??
    "Planer Podróży <onboarding@resend.dev>"
  );
}

function extractEmailAddress(from: string): string {
  const angle = from.match(/<([^>]+)>/);
  if (angle?.[1]) return angle[1].trim().toLowerCase();
  return from.trim().toLowerCase();
}

export function isTestResendFromAddress(from: string): boolean {
  const addr = extractEmailAddress(from);
  return TEST_RESEND_FROM_PATTERN.test(addr) || addr.endsWith("@resend.dev");
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey() || getEmailServer());
}

/**
 * Resend w trybie testowym (onboarding@resend.dev) wysyła tylko na e-mail właściciela konta.
 * Do wszystkich użytkowników wymagana jest zweryfikowana domena + EMAIL_FROM.
 */
export function getProductionEmailSetupError(): string | null {
  if (process.env.NODE_ENV !== "production") return null;

  if (!isEmailConfigured()) {
    return "Brak RESEND_API_KEY lub EMAIL_SERVER w Vercel. Dodaj zmienne i wykonaj Redeploy.";
  }

  const from = sanitizeEnvValue(process.env.EMAIL_FROM);

  if (getResendApiKey()) {
    if (!from || isTestResendFromAddress(from)) {
      return [
        "Wysyłka do wszystkich użytkowników wymaga zweryfikowanej domeny w Resend.",
        "1) resend.com/domains → dodaj domenę i wpisz rekordy DNS",
        "2) W Vercel ustaw EMAIL_FROM, np. Planer Podróży <noreply@twoja-domena.pl>",
        "3) Redeploy",
      ].join(" ");
    }
    return null;
  }

  if (getEmailServer() && !from) {
    return "Ustaw EMAIL_FROM w Vercel (adres nadawcy zgodny z kontem SMTP, np. Gmail).";
  }

  return null;
}

export function isProductionEmailReady(): boolean {
  if (process.env.NODE_ENV !== "production") return isEmailConfigured();
  return isEmailConfigured() && getProductionEmailSetupError() === null;
}

export function mapEmailSendError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (
    message.includes("zweryfikowanej domeny") ||
    message.includes("EMAIL_FROM") ||
    message.includes("Resend nie wysyła")
  ) {
    return message;
  }

  if (message.includes("Resend 403") || /only send.*testing/i.test(message)) {
    return [
      "Resend nie wysyła na ten adres w trybie testowym.",
      "Zweryfikuj domenę w Resend i ustaw EMAIL_FROM na adres@twoja-domena.pl w Vercel.",
    ].join(" ");
  }

  if (message.includes("Resend 422") || /domain.*not verified/i.test(message)) {
    return "Adres EMAIL_FROM musi być ze zweryfikowanej domeny w Resend (resend.com/domains).";
  }

  if (message.includes("Resend 401")) {
    return "Nieprawidłowy RESEND_API_KEY w Vercel.";
  }

  console.error("[email]", err);
  return "Nie udało się wysłać e-maila aktywacyjnego. Sprawdź konfigurację e-mail na serwerze.";
}
