import Link from "next/link";
import { LogIn, Mail } from "lucide-react";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { AuthSectionHeading } from "@/components/auth/auth-section-heading";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Separator } from "@/components/ui/separator";

type LoginPanelProps = {
  redirectTo: string;
  verified?: boolean;
  error?: string;
};

export function LoginPanel({ redirectTo, verified, error }: LoginPanelProps) {
  return (
    <div className="space-y-6">
      {verified && (
        <p className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm text-primary">
          Konto aktywowane. Możesz się teraz zalogować.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <section className="space-y-4" aria-labelledby="login-email-heading">
        <AuthSectionHeading
          icon={Mail}
          title="Logowanie e-mailem"
          description="Wpisz adres e-mail i hasło do konta."
        />
        <CredentialsForm redirectTo={redirectTo} />
      </section>

      <div className="relative py-1">
        <Separator className="bg-white/10" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          lub
        </span>
      </div>

      <section
        className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        aria-labelledby="login-google-heading"
      >
        <AuthSectionHeading
          icon={LogIn}
          title="Zaloguj przez Google"
          description="Szybkie logowanie bez hasła — konto Google musi być aktywne."
        />
        <GoogleSignInButton redirectTo={redirectTo} label="Kontynuuj z Google" />
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Nie masz konta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Zarejestruj się
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        Bez logowania możesz generować plany — nie trafią na konto.
      </p>
      <Link
        href="/"
        className="block text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}
