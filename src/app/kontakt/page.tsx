import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import { LEGAL_PATHS, SITE_NAME, getLegalContactEmail } from "@/lib/legal/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Kontakt i sprawy RODO — ${SITE_NAME}.`,
};

export default function ContactPage() {
  const email = getLegalContactEmail();

  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Kontakt
        </h1>
        <p className="mt-4 text-muted-foreground">
          Masz pytania dotyczące serwisu, planów podróży lub ochrony danych
          osobowych (RODO)?
        </p>

        <div className="glass-card mt-8 space-y-6 rounded-2xl border-white/10 p-6">
          <div className="flex gap-4">
            <Mail className="size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-medium">E-mail</p>
              <a
                href={`mailto:${email}`}
                className="mt-1 text-primary hover:underline"
              >
                {email}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Sprawy RODO, usunięcie planu, reklamacje.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <MessageSquare className="size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-medium">Zanim napiszesz</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Podaj identyfikator planu z adresu URL (np. po{" "}
                <code className="rounded bg-white/10 px-1">/plan/...</code>
                ), jeśli dotyczy konkretnej podróży.
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-10 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href={LEGAL_PATHS.privacy} className="hover:text-foreground">
            Polityka prywatności
          </Link>
          <Link href={LEGAL_PATHS.terms} className="hover:text-foreground">
            Regulamin
          </Link>
          <Link href={LEGAL_PATHS.cookies} className="hover:text-foreground">
            Cookies
          </Link>
        </nav>
      </div>
    </div>
  );
}
