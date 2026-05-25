"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { error?: string; message?: string };

      if (!res.ok) {
        setError(data.error ?? "Rejestracja nie powiodła się.");
        setLoading(false);
        return;
      }

      setSuccess(
        data.message ??
          "Sprawdź skrzynkę e-mail i kliknij link aktywacyjny.",
      );
      setLoading(false);
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-primary">{success}</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-sm text-muted-foreground">
            W trybie deweloperskim link może być w terminalu (`npm run dev`).
          </p>
        )}
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Imię</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-white/15 bg-white/5"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">E-mail</Label>
        <Input
          id="reg-email"
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
        <Label htmlFor="reg-password">Hasło (min. 8 znaków)</Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
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
        className="w-full bg-gradient-to-r from-primary to-accent"
      >
        {loading ?
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Tworzenie konta…
          </>
        : <>
            <UserPlus className="size-4" aria-hidden />
            Utwórz konto
          </>
        }
      </Button>
    </form>
  );
}
