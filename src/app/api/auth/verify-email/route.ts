import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/email-verification";
import { getAuthBaseUrl } from "@/lib/auth/get-auth-base-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const base = getAuthBaseUrl();

  if (!token || !email) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent("Brak parametrów aktywacji.")}`,
    );
  }

  const result = await verifyEmailToken(email, token);

  if (!result.ok) {
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(result.reason)}`,
    );
  }

  return NextResponse.redirect(`${base}/login?verified=1`);
}
