"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLAN_VARIANT_LABELS } from "@/types/trip";
import type { PlanVariant } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const VARIANTS: PlanVariant[] = ["BUDGET", "STANDARD", "PREMIUM"];

type PlanVariantActionsProps = {
  planId: string;
  currentVariant: PlanVariant;
};

export function PlanVariantActions({
  planId,
  currentVariant,
}: PlanVariantActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanVariant | null>(null);

  async function generateVariant(variant: PlanVariant) {
    if (variant === currentVariant) return;
    setLoading(variant);
    try {
      const res = await fetch(`/api/plans/${planId}/variant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Błąd generowania wariantu");
      toast.success(`Utworzono wariant ${PLAN_VARIANT_LABELS[variant]}`);
      router.push(`/plan/${json.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="glass-card rounded-2xl border-white/10 p-4">
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-primary" aria-hidden />
        <h2 className="font-heading text-sm font-semibold">Wariant planu</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Aktualny: {PLAN_VARIANT_LABELS[currentVariant]}. Wygeneruj alternatywę AI
        z tymi samymi parametrami.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {VARIANTS.map((v) => (
          <Button
            key={v}
            type="button"
            variant={v === currentVariant ? "default" : "outline"}
            size="sm"
            disabled={loading !== null}
            onClick={() => generateVariant(v)}
            className={cn(
              v !== currentVariant && "border-white/15",
              "text-xs",
            )}
          >
            {loading === v ?
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            : PLAN_VARIANT_LABELS[v]}
          </Button>
        ))}
      </div>
    </section>
  );
}
