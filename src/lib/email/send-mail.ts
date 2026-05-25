import nodemailer from "nodemailer";
import {
  getEmailServer,
  getFromAddress,
  getResendApiKey,
} from "@/lib/email/email-config";

function getTransport() {
  const server = getEmailServer();
  if (!server) return null;

  return nodemailer.createTransport(server);
}

function parseResendError(status: number, body: string): Error {
  let detail = body;
  try {
    const json = JSON.parse(body) as { message?: string };
    if (json.message) detail = json.message;
  } catch {
    /* raw body */
  }
  return new Error(`Resend ${status}: ${detail}`);
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
    throw parseResendError(res.status, body);
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

export {
  getFromAddress,
  getProductionEmailSetupError,
  isEmailConfigured,
  isProductionEmailReady,
  mapEmailSendError,
} from "@/lib/email/email-config";
