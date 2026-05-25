import { getSanitizedAuthUrl } from "@/lib/auth-env";

export function getAuthBaseUrl(): string {
  const fromEnv = getSanitizedAuthUrl();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
