import { NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/register-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
    });

    if (!result.ok) {
      const isEmailConfig =
        result.error.includes("EMAIL_FROM") ||
        result.error.includes("RESEND") ||
        result.error.includes("domen") ||
        result.error.includes("Vercel");
      return NextResponse.json(
        { error: result.error },
        { status: isEmailConfig ? 503 : 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Konto utworzone. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny.",
    });
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Nie udało się utworzyć konta." },
      { status: 500 },
    );
  }
}
