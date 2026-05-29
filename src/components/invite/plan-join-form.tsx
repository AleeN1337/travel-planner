"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlanJoinFormProps = {
  planId: string;
  destination: string;
  /** Po dołączeniu — domyślnie przejście do planu */
  onSuccess?: () => void;
};

export function PlanJoinForm({
  planId,
  destination,
  onSuccess,
}: PlanJoinFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      toast.error("Podaj swoje imię");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/plans/${planId}/member`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd");
      toast.success(`Witaj, ${trimmed}!`);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/plan/${planId}`);
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="glass-card w-full max-w-md space-y-6 rounded-3xl border-white/15 p-8 shadow-xl"
    >
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15">
          <User className="size-7 text-primary" aria-hidden />
        </div>
        <h1 className="font-heading text-2xl font-semibold">Dołącz do planu</h1>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          {destination}
        </p>
        <p className="text-sm text-muted-foreground">
          Podaj imię, aby wejść do planu i współpracować z grupą.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="join-name" className="text-sm font-medium">
          Twoje imię
        </Label>
        <Input
          id="join-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Bartek"
          maxLength={40}
          autoFocus
          className="h-11 border-white/20 bg-white/8 text-base"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full text-base"
        disabled={saving || name.trim().length < 1}
      >
        {saving ? "Dołączanie…" : "Wejdź do planu"}
      </Button>
    </form>
  );
}
