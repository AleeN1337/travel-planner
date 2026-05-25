import nodemailer from "nodemailer";
import { getSanitizedAuthUrl, sanitizeEnvValue } from "@/lib/auth-env";

function getTransport() {
  const server = sanitizeEnvValue(process.env.EMAIL_SERVER);
  if (!server) return null;

  return nodemailer.createTransport(server);
}

function getFromAddress(): string {
  return (
    sanitizeEnvValue(process.env.EMAIL_FROM) ?? "Planer Podróży <onboarding@resend.dev>"
  );
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; devLink?: string }> {
  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", options.subject, "→", options.to);
      console.info(options.text);
      return { sent: false, devLink: options.text };
    }
    throw new Error(
      "Brak konfiguracji e-mail (EMAIL_SERVER). Ustaw SMTP w .env.",
    );
  }

  await transport.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { sent: true };
}

export function isEmailConfigured(): boolean {
  return Boolean(sanitizeEnvValue(process.env.EMAIL_SERVER));
}
