import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthSectionHeading } from "@/components/auth/auth-section-heading";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Separator } from "@/components/ui/separator";

type RegisterPanelProps = {
  redirectTo?: string;
};

export function RegisterPanel({ redirectTo = "/dashboard" }: RegisterPanelProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="register-email-heading">
        <AuthSectionHeading
          icon={UserPlus}
          title="Rejestracja e-mailem"
          description="Utwórz konto — wyślemy link aktywacyjny na e-mail."
        />
        <RegisterForm />
      </section>

      <div className="relative py-1">
        <Separator className="bg-white/10" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          lub
        </span>
      </div>

      <section
        className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        aria-labelledby="register-google-heading"
      >
        <AuthSectionHeading
          icon={UserPlus}
          title="Zarejestruj przez Google"
          description="Konto utworzy się automatycznie po pierwszym logowaniu Google."
        />
        <GoogleSignInButton
          redirectTo={redirectTo}
          label="Kontynuuj z Google"
        />
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Zaloguj się
        </Link>
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
