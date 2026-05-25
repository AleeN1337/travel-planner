"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CredentialsFormProps = {
  redirectTo: string;
};

export function CredentialsForm({ redirectTo }: CredentialsFormProps) {
  const { update: updateSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "unverified" ?
            "Konto nie jest aktywne. Sprawdź e-mail i kliknij link aktywacyjny."
          : result.error === "CredentialsSignin" || result.error === "invalid" ?
            "Nieprawidłowy e-mail lub hasło."
          : result.error,
        );
        setLoading(false);
        return;
      }

      await updateSession();
      window.location.href = redirectTo;
    } catch {
      setError("Nie udało się zalogować.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-white/15 bg-white/5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-white/15 bg-white/5"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="w-full gap-2 bg-gradient-to-r from-primary to-accent"
      >
        {loading ?
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Logowanie…
          </>
        : <>
            <LogIn className="size-4" aria-hidden />
            Zaloguj się
          </>
        }
      </Button>
    </form>
  );
}
