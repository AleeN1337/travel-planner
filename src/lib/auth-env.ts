/** Usuwa typowe pomyłki przy wklejaniu z pliku .env do panelu Vercel. */
export function sanitizeEnvValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let value = raw.trim();
  const eq = value.indexOf("=");
  if (eq > 0 && /^[A-Z][A-Z0-9_]*$/i.test(value.slice(0, eq))) {
    value = value.slice(eq + 1).trim();
  }
  value = value.replace(/^["']+/, "").replace(/["']+$/, "");
  return value.trim() || undefined;
}

export function getSanitizedAuthUrl(): string | undefined {
  return sanitizeEnvValue(process.env.AUTH_URL);
}

/** Ustawia poprawne AUTH_URL w process.env przed startem Auth.js. */
export function applySanitizedAuthEnv(): void {
  const authUrl = getSanitizedAuthUrl();
  if (!authUrl) return;

  try {
    new URL(authUrl);
    process.env.AUTH_URL = authUrl;
  } catch {
    console.error(
      "[auth] Nieprawidłowy AUTH_URL:",
      JSON.stringify(process.env.AUTH_URL),
      "— ustaw np. http://localhost:3000",
    );
    delete process.env.AUTH_URL;
  }
}
