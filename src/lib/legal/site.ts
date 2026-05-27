export const SITE_NAME = "Planer Podróży";

export const LEGAL_PATHS = {
  privacy: "/polityka-prywatnosci",
  terms: "/regulamin",
  cookies: "/cookies",
  contact: "/kontakt",
} as const;

/** E-mail kontaktowy RODO — ustaw LEGAL_CONTACT_EMAIL w .env */
export function getLegalContactEmail(): string {
  return (
    process.env.LEGAL_CONTACT_EMAIL ??
    process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL ??
    "kontakt@example.com"
  );
}

export function getPublicContactEmail(): string {
  return process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL ?? getLegalContactEmail();
}
