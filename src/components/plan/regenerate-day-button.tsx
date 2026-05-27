"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegenerateDayButtonProps = {
  planId: string;
  dayNumber: number;
  onDone: () => void;
  disabled?: boolean;
};

export function RegenerateDayButton({
  planId,
  dayNumber,
  onDone,
  disabled,
}: RegenerateDayButtonProps) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/plans/${planId}/ai/regenerate-day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber,
          instruction: instruction.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Nie udało się przerobić dnia");
    },
    onSuccess: () => {
      toast.success(`Dzień ${dayNumber} zaktualizowany`);
      setOpen(false);
      setInstruction("");
      onDone();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || mutation.isPending}
        onClick={() => setOpen(true)}
        className="gap-1.5 border-white/15 text-xs"
      >
        <RefreshCw className="size-3.5" aria-hidden />
        Przerób ten dzień (AI)
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <Label htmlFor={`regen-${dayNumber}`} className="text-xs">
        Opcjonalna wskazówka dla AI
      </Label>
      <Input
        id={`regen-${dayNumber}`}
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="np. lżej, więcej jedzenia, mniej muzeów"
        className="border-white/15 bg-white/5 text-sm"
        disabled={mutation.isPending}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="gap-1.5"
        >
          {mutation.isPending ?
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Generuję…
            </>
          : "Zastosuj"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={mutation.isPending}
          onClick={() => setOpen(false)}
          className="border-white/15"
        >
          Anuluj
        </Button>
      </div>
    </div>
  );
}
