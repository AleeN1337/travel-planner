export const COOKIE_CONSENT_KEY = "tp-cookie-consent-v1";

export type CookieConsentChoice = "essential" | "all";

export type CookieConsentRecord = {
  choice: CookieConsentChoice;
  at: string;
};

export function parseCookieConsent(
  raw: string | null,
): CookieConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (parsed.choice === "essential" || parsed.choice === "all") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveCookieConsent(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") return;
  const record: CookieConsentRecord = {
    choice,
    at: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(record));
}

export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  return parseCookieConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function hasCookieConsent(): boolean {
  return readCookieConsent() !== null;
}
