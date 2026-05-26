"use client";

import { useCallback, useState } from "react";
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
import { AirportPicker } from "@/components/wizard/airport-picker";
import { OptionChip } from "@/components/wizard/option-chip";
import { useWizardStore } from "@/stores/wizard-store";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
  tripWizardSchema,
  type TripWizardInput,
} from "@/types/trip";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Gdzie jedziesz?", desc: "Kierunek, dni i lotnisko przylotu" },
  { title: "Z kim jedziesz?", desc: "Dopasujemy plan do ekipy" },
  { title: "Preferencje", desc: "Must-see, czego unikać, nocleg" },
  { title: "Budżet", desc: "Ile chcesz przeznaczyć na wyjazd" },
  { title: "Styl podróży", desc: "Co Cię najbardziej interesuje" },
  { title: "Tempo i transport", desc: "Jak chcesz się poruszać" },
  { title: "Podsumowanie", desc: "Sprawdź i wygeneruj plan" },
] as const;

export function TripWizard() {
  const router = useRouter();
  const { step, data, setStep, updateData, reset } = useWizardStore();
  const [airportOptionsCount, setAirportOptionsCount] = useState(0);

  const handleAirportOptionsLoaded = useCallback((count: number) => {
    setAirportOptionsCount((prev) => (prev === count ? prev : count));
  }, []);

  const handleAirportSelect = useCallback(
    (airport: { code: string; name: string } | null) => {
      updateData({
        arrivalAirportCode: airport?.code,
        arrivalAirportName: airport?.name,
      });
    },
    [updateData],
  );

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
      if (
        airportOptionsCount > 1 &&
        !data.arrivalAirportCode
      ) {
        toast.error("Wybierz lotnisko przylotu z listy");
        return false;
      }
    }
    if (step === 1) {
      if (
        data.travelParty === "FAMILY" &&
        (!data.childrenAges || data.childrenAges.length === 0)
      ) {
        toast.error("Podaj wiek przynajmniej jednego dziecka");
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

  function setChildrenAges(ages: number[]) {
    updateData({ childrenAges: ages });
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
                placeholder="np. Barcelona, Rzym, Lizbona"
                value={data.destination}
                onChange={(e) =>
                  updateData({
                    destination: e.target.value,
                    arrivalAirportCode: undefined,
                    arrivalAirportName: undefined,
                  })
                }
                className="border-white/15 bg-white/5"
              />
            </div>
            <AirportPicker
              destination={data.destination}
              selectedCode={data.arrivalAirportCode}
              selectedName={data.arrivalAirportName}
              onOptionsLoaded={handleAirportOptionsLoaded}
              onSelect={handleAirportSelect}
            />
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
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Skład ekipy</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  Object.keys(TRAVEL_PARTY_LABELS) as TripWizardInput["travelParty"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.travelParty}
                    label={TRAVEL_PARTY_LABELS[key]}
                    onSelect={(v) =>
                      updateData({
                        travelParty: v,
                        childrenAges: v === "FAMILY" ? data.childrenAges : [],
                      })
                    }
                  />
                ))}
              </div>
            </div>
            {data.travelParty === "FAMILY" && (
              <FamilyChildrenAges
                ages={data.childrenAges ?? []}
                onChange={setChildrenAges}
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mustSee">Must-see (opcjonalnie)</Label>
              <Input
                id="mustSee"
                placeholder="np. Sagrada Família, plaża Barceloneta"
                value={data.mustSee ?? ""}
                onChange={(e) => updateData({ mustSee: e.target.value })}
                className="border-white/15 bg-white/5"
              />
              <p className="text-xs text-muted-foreground">
                Miejsca, które koniecznie chcesz zobaczyć.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avoid">Czego unikać (opcjonalnie)</Label>
              <Input
                id="avoid"
                placeholder="np. tłoczne kluby, długie wędrówki"
                value={data.avoid ?? ""}
                onChange={(e) => updateData({ avoid: e.target.value })}
                className="border-white/15 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accommodationArea">
                Dzielnica / okolica noclegu (opcjonalnie)
              </Label>
              <Input
                id="accommodationArea"
                placeholder="np. Gotyk, Eixample, przy plaży"
                value={data.accommodationArea ?? ""}
                onChange={(e) =>
                  updateData({ accommodationArea: e.target.value })
                }
                className="border-white/15 bg-white/5"
              />
              <p className="text-xs text-muted-foreground">
                Plan będzie optymalizowany pod ten punkt startowy.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
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

        {step === 4 && (
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

        {step === 5 && (
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

        {step === 6 && (
          <dl className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <SummaryRow label="Kierunek" value={data.destination} />
            {data.arrivalAirportName && data.arrivalAirportCode && (
              <SummaryRow
                label="Lotnisko"
                value={`${data.arrivalAirportName} (${data.arrivalAirportCode})`}
              />
            )}
            <SummaryRow label="Dni" value={String(data.daysCount)} />
            {data.startDate && (
              <SummaryRow label="Start" value={data.startDate} />
            )}
            <SummaryRow
              label="Ekipa"
              value={TRAVEL_PARTY_LABELS[data.travelParty]}
            />
            {data.childrenAges && data.childrenAges.length > 0 && (
              <SummaryRow
                label="Wiek dzieci"
                value={data.childrenAges.join(", ") + " lat"}
              />
            )}
            {data.mustSee?.trim() && (
              <SummaryRow label="Must-see" value={data.mustSee} />
            )}
            {data.avoid?.trim() && (
              <SummaryRow label="Unikaj" value={data.avoid} />
            )}
            {data.accommodationArea?.trim() && (
              <SummaryRow label="Nocleg" value={data.accommodationArea} />
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

function FamilyChildrenAges({
  ages,
  onChange,
}: {
  ages: number[];
  onChange: (ages: number[]) => void;
}) {
  const rows = ages.length > 0 ? ages : [8];

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium">Wiek dzieci (lata)</p>
      {rows.map((age, index) => (
        <div key={index} className="flex items-center gap-2">
          <Label className="sr-only" htmlFor={`child-age-${index}`}>
            Dziecko {index + 1}
          </Label>
          <span className="w-20 shrink-0 text-xs text-muted-foreground">
            Dziecko {index + 1}
          </span>
          <Input
            id={`child-age-${index}`}
            type="number"
            min={0}
            max={17}
            value={age}
            onChange={(e) => {
              const next = [...rows];
              next[index] = Number(e.target.value) || 0;
              onChange(next);
            }}
            className="border-white/15 bg-white/5"
          />
          {rows.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              Usuń
            </Button>
          )}
        </div>
      ))}
      {rows.length < 6 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/15"
          onClick={() => onChange([...rows, 10])}
        >
          + Dodaj dziecko
        </Button>
      )}
    </div>
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
