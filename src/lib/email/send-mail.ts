import nodemailer from "nodemailer";
import { sanitizeEnvValue } from "@/lib/auth-env";

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

function getResendApiKey(): string | undefined {
  return sanitizeEnvValue(process.env.RESEND_API_KEY);
}

async function sendViaResend(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = getResendApiKey();
  if (!apiKey) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body || res.statusText}`);
  }
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean; devLink?: string }> {
  if (getResendApiKey()) {
    await sendViaResend(options);
    return { sent: true };
  }

  const transport = getTransport();

  if (!transport) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:dev]", options.subject, "→", options.to);
      console.info(options.text);
      return { sent: false, devLink: options.text };
    }
    throw new Error(
      "Brak konfiguracji e-mail (EMAIL_SERVER lub RESEND_API_KEY).",
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
  return Boolean(getResendApiKey() || sanitizeEnvValue(process.env.EMAIL_SERVER));
}
