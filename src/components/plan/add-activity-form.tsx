"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIME_OF_DAY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { TimeOfDay } from "@/generated/prisma/client";

type AddActivityFormProps = {
  planId: string;
  planDayId: string;
  onAdd: (data: {
    planDayId: string;
    title: string;
    description?: string;
    locationName?: string;
    timeOfDay: TimeOfDay;
    costMin?: number;
    costMax?: number;
  }) => Promise<void>;
  disabled?: boolean;
};

type SuggestedActivity = {
  timeOfDay: TimeOfDay;
  title: string;
  description: string;
  locationName: string | null;
  costMin: number | null;
  costMax: number | null;
};

export function AddActivityForm({
  planId,
  planDayId,
  onAdd,
  disabled,
}: AddActivityFormProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("AFTERNOON");
  const [loading, setLoading] = useState(false);

  const suggestMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/plans/${planId}/ai/suggest-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDayId,
          prompt: aiPrompt.trim(),
          timeOfDay,
        }),
      });
      const json = (await res.json()) as {
        activity?: SuggestedActivity;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Błąd AI");
      return json.activity!;
    },
    onSuccess: (activity) => {
      setTitle(activity.title);
      setDescription(activity.description);
      setLocation(activity.locationName ?? "");
      setTimeOfDay(activity.timeOfDay);
      setMode("manual");
      toast.success("Propozycja gotowa — sprawdź i dodaj");
    },
    onError: (e) => toast.error(e.message),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        planDayId,
        title: title.trim(),
        description: description.trim() || undefined,
        locationName: location.trim() || undefined,
        timeOfDay,
      });
      setTitle("");
      setLocation("");
      setDescription("");
      setAiPrompt("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="mt-4 w-full gap-2 border-dashed border-white/15"
      >
        <Plus className="size-4" aria-hidden />
        Dodaj punkt
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
            mode === "ai" ?
              "border-primary/50 bg-primary/15 text-primary"
            : "border-white/15 bg-white/5",
          )}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Zaproponuj (AI)
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
            mode === "manual" ?
              "border-primary/50 bg-primary/15 text-primary"
            : "border-white/15 bg-white/5",
          )}
        >
          Ręcznie
        </button>
      </div>

      {mode === "ai" && (
        <div className="space-y-2">
          <Label htmlFor={`ai-prompt-${planDayId}`}>Opisz czego szukasz</Label>
          <textarea
            id={`ai-prompt-${planDayId}`}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="np. kawiarnia z widokiem, wegańska kolacja, park dla dzieci"
            rows={2}
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <div className="space-y-2">
            <Label htmlFor={`ai-time-${planDayId}`}>Pora (opcjonalnie)</Label>
            <select
              id={`ai-time-${planDayId}`}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              className="h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2.5 text-sm"
            >
              {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map((t) => (
                <option key={t} value={t}>
                  {TIME_OF_DAY_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={aiPrompt.trim().length < 3 || suggestMutation.isPending}
            onClick={() => suggestMutation.mutate()}
            className="gap-1.5"
          >
            {suggestMutation.isPending ?
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Szukam…
              </>
            : <>
                <Sparkles className="size-3.5" aria-hidden />
                Wygeneruj propozycję
              </>
            }
          </Button>
        </div>
      )}

      {(mode === "manual" || title) && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`title-${planDayId}`}>Nazwa *</Label>
            <Input
              id={`title-${planDayId}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Muzeum, restauracja"
              className="border-white/15 bg-white/5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`loc-${planDayId}`}>Lokalizacja</Label>
            <Input
              id={`loc-${planDayId}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="adres lub dzielnica"
              className="border-white/15 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`desc-${planDayId}`}>Opis</Label>
            <Input
              id={`desc-${planDayId}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/15 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`time-${planDayId}`}>Pora dnia</Label>
            <select
              id={`time-${planDayId}`}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              className={cn(
                "h-8 w-full rounded-lg border border-white/15 bg-white/5 px-2.5 text-sm",
              )}
            >
              {(Object.keys(TIME_OF_DAY_LABELS) as TimeOfDay[]).map((t) => (
                <option key={t} value={t}>
                  {TIME_OF_DAY_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || disabled || !title.trim()}>
          {loading ? "Dodawanie…" : "Dodaj"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          className="border-white/15"
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
