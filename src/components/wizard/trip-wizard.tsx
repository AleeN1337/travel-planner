"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OptionChip } from "@/components/wizard/option-chip";
import { useWizardStore } from "@/stores/wizard-store";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  tripWizardSchema,
  type TripWizardInput,
} from "@/types/trip";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Gdzie jedziesz?", desc: "Kierunek i długość pobytu" },
  { title: "Budżet", desc: "Ile chcesz przeznaczyć na wyjazd" },
  { title: "Styl podróży", desc: "Co Cię najbardziej interesuje" },
  { title: "Tempo i transport", desc: "Jak chcesz się poruszać" },
  { title: "Podsumowanie", desc: "Sprawdź i wygeneruj plan" },
] as const;

export function TripWizard() {
  const router = useRouter();
  const { step, data, setStep, updateData, reset } = useWizardStore();

  const progress = ((step + 1) / STEPS.length) * 100;

  const generateMutation = useMutation({
    mutationFn: async (payload: TripWizardInput) => {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Nie udało się wygenerować planu");
      }
      return json as { id: string };
    },
    onSuccess: ({ id }) => {
      reset();
      router.push(`/plan/${id}`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function validateStep(): boolean {
    if (step === 0) {
      if (data.destination.trim().length < 2) {
        toast.error("Podaj kierunek podróży (min. 2 znaki)");
        return false;
      }
      if (data.daysCount < 1 || data.daysCount > 30) {
        toast.error("Liczba dni: od 1 do 30");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function generate() {
    const result = tripWizardSchema.safeParse(data);
    if (!result.success) {
      toast.error("Uzupełnij wszystkie pola");
      return;
    }
    generateMutation.mutate(result.data);
  }

  return (
    <Card className="glass-card border-white/10 shadow-2xl">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Krok {step + 1} z {STEPS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <CardTitle className="font-heading mt-4 text-2xl">
          {STEPS[step].title}
        </CardTitle>
        <CardDescription>{STEPS[step].desc}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Kierunek podróży</Label>
              <Input
                id="destination"
                placeholder="np. Rzym, Japonia, Lizbona"
                value={data.destination}
                onChange={(e) => updateData({ destination: e.target.value })}
                className="border-white/15 bg-white/5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daysCount">Liczba dni</Label>
                <Input
                  id="daysCount"
                  type="number"
                  min={1}
                  max={30}
                  value={data.daysCount}
                  onChange={(e) =>
                    updateData({ daysCount: Number(e.target.value) || 1 })
                  }
                  className="border-white/15 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data startu (opcjonalnie)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={data.startDate ?? ""}
                  onChange={(e) =>
                    updateData({ startDate: e.target.value || undefined })
                  }
                  className="border-white/15 bg-white/5"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(BUDGET_LABELS) as TripWizardInput["budgetLevel"][]).map(
              (key) => (
                <OptionChip
                  key={key}
                  value={key}
                  selected={data.budgetLevel}
                  label={BUDGET_LABELS[key]}
                  onSelect={(v) => updateData({ budgetLevel: v })}
                />
              ),
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(STYLE_LABELS) as TripWizardInput["travelStyle"][]).map(
              (key) => (
                <OptionChip
                  key={key}
                  value={key}
                  selected={data.travelStyle}
                  label={STYLE_LABELS[key]}
                  onSelect={(v) => updateData({ travelStyle: v })}
                />
              ),
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Tempo</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(PACE_LABELS) as TripWizardInput["paceLevel"][]).map(
                  (key) => (
                    <OptionChip
                      key={key}
                      value={key}
                      selected={data.paceLevel}
                      label={PACE_LABELS[key]}
                      onSelect={(v) => updateData({ paceLevel: v })}
                    />
                  ),
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Transport</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  Object.keys(TRANSPORT_LABELS) as TripWizardInput["transportMode"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.transportMode}
                    label={TRANSPORT_LABELS[key]}
                    onSelect={(v) => updateData({ transportMode: v })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <dl className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <SummaryRow label="Kierunek" value={data.destination} />
            <SummaryRow label="Dni" value={String(data.daysCount)} />
            {data.startDate && (
              <SummaryRow label="Start" value={data.startDate} />
            )}
            <SummaryRow label="Budżet" value={BUDGET_LABELS[data.budgetLevel]} />
            <SummaryRow label="Styl" value={STYLE_LABELS[data.travelStyle]} />
            <SummaryRow label="Tempo" value={PACE_LABELS[data.paceLevel]} />
            <SummaryRow
              label="Transport"
              value={TRANSPORT_LABELS[data.transportMode]}
            />
          </dl>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 0 || generateMutation.isPending}
            className="border-white/15"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Wstecz
          </Button>

          {step < STEPS.length - 1 ?
            <Button
              type="button"
              onClick={next}
              className="gap-2 bg-gradient-to-r from-primary to-accent"
            >
              Dalej
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          : <Button
              type="button"
              onClick={generate}
              disabled={generateMutation.isPending}
              className={cn(
                "gap-2 bg-gradient-to-r from-primary to-accent",
                generateMutation.isPending && "opacity-80",
              )}
            >
              {generateMutation.isPending ?
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Generuję plan…
                </>
              : <>
                  <Sparkles className="size-4" aria-hidden />
                  Wygeneruj plan
                </>
              }
            </Button>
          }
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium sm:text-right">{value}</dd>
    </div>
  );
}
