"use client";

import { useState } from "react";
import { Link2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlanSharePanelProps = {
  planId: string;
};

export function PlanSharePanel({ planId }: PlanSharePanelProps) {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  async function createInviteLink() {
    setLoading(true);
    try {
      const res = await fetch(`/api/plans/${planId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission: "VIEW" }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Nie udało się utworzyć linku");
      }
      if (!json.url) {
        throw new Error("Brak adresu zaproszenia");
      }
      setInviteUrl(json.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd udostępniania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2 sm:items-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={() => void createInviteLink()}
        className="gap-1.5 border-white/15"
      >
        {loading ?
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        : <Link2 className="size-3.5" aria-hidden />}
        Udostępnij grupie
      </Button>

      {inviteUrl && (
        <div
          role="dialog"
          aria-labelledby="invite-link-title"
          className="glass-card w-full max-w-md rounded-xl border border-white/15 p-4 text-left sm:min-w-[20rem]"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p
                id="invite-link-title"
                className="font-heading text-sm font-semibold"
              >
                Link zapraszający
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Wyślij ten adres osobom z grupy. Bez linku nie otworzą planu.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Zamknij"
              onClick={() => setInviteUrl(null)}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          <Label htmlFor="invite-url" className="sr-only">
            Adres zaproszenia
          </Label>
          <Input
            id="invite-url"
            readOnly
            value={inviteUrl}
            onFocus={(e) => e.target.select()}
            className="border-white/15 bg-white/5 font-mono text-xs"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Zaznacz link i skopiuj (Ctrl+C), potem wyślij np. w wiadomości.
          </p>
        </div>
      )}
    </div>
  );
}
