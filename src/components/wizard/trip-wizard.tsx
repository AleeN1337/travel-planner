"use client";

import { useCallback, useEffect, useState } from "react";
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
import { MultiOptionChip } from "@/components/wizard/multi-option-chip";
import { WizardPreviewCard } from "@/components/wizard/wizard-preview-card";
import { suggestBudgetRange } from "@/lib/trip/budget-presets";
import { LegalConsentBlock } from "@/components/legal/legal-consent-block";
import { WizardCacheCard } from "@/components/wizard/wizard-cache-card";
import { generatePlanWithStream } from "@/lib/plans/generate-stream";
import { useWizardStore } from "@/stores/wizard-store";
import {
  ACCOMMODATION_TYPE_LABELS,
  BUDGET_INCLUDE_LABELS,
  BUDGET_LABELS,
  CURRENCY_LABELS,
  FOOD_STANDARD_LABELS,
  LANGUAGE_LABELS,
  MAX_TRAVEL_LABELS,
  MOBILITY_LABELS,
  PACE_LABELS,
  PLAN_VARIANT_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
  TRAVEL_PARTY_LABELS,
  TRIP_OCCASION_LABELS,
  WEATHER_PREF_LABELS,
  tripWizardSchema,
  type TripWizardInput,
} from "@/types/trip";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Gdzie jedziesz?", desc: "Kierunek, dni i lotnisko przylotu" },
  { title: "Z kim jedziesz?", desc: "Liczba osób, dzieci, mobilność" },
  { title: "Miejsca i nocleg", desc: "Must-see, czego unikać, okolica" },
  { title: "Budżet", desc: "Widełki wydatków i co wliczasz" },
  { title: "Jedzenie i nocleg", desc: "Standard posiłków i zakwaterowania" },
  { title: "Styl podróży", desc: "Do 3 priorytetów" },
  { title: "Tempo i transport", desc: "Poruszanie się i logistyka" },
  { title: "Kontekst wyjazdu", desc: "Okazja, pogoda, język" },
  { title: "Podsumowanie", desc: "Sprawdź i wygeneruj plan" },
] as const;

const STYLE_OPTIONS = (
  Object.keys(STYLE_LABELS) as TripWizardInput["travelStyles"][number][]
).filter((s) => s !== "MIXED");

export function TripWizard() {
  const router = useRouter();
  const { step, data, setStep, updateData, reset } = useWizardStore();
  const [airportOptionsCount, setAirportOptionsCount] = useState(0);
  const [daysDraft, setDaysDraft] = useState(() => String(data.daysCount));
  const [genStage, setGenStage] = useState("");
  const [genPercent, setGenPercent] = useState(0);
  const [skipCache, setSkipCache] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  useEffect(() => {
    if (step === 0) {
      setDaysDraft(String(data.daysCount));
    }
  }, [step, data.daysCount]);

  useEffect(() => {
    if (
      step === 3 &&
      data.totalBudgetMin == null &&
      data.totalBudgetMax == null
    ) {
      const range = suggestBudgetRange(
        data.budgetLevel,
        data.daysCount,
        data.adultsCount ?? 2,
      );
      updateData({
        totalBudgetMin: range.totalBudgetMin,
        totalBudgetMax: range.totalBudgetMax,
      });
    }
  }, [step, data.budgetLevel, data.daysCount, data.adultsCount, data.totalBudgetMin, data.totalBudgetMax, updateData]);

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
    mutationFn: async ({
      payload,
      useCache,
    }: {
      payload: TripWizardInput;
      useCache: boolean;
    }) => {
      setGenStage("Przygotowuję plan…");
      setGenPercent(5);
      const id = await generatePlanWithStream(
        payload,
        (event) => {
          if (event.type === "progress") {
            setGenStage(event.stage);
            setGenPercent(event.percent);
          }
        },
        { useCache },
      );
      return { id };
    },
    onSuccess: ({ id }) => {
      setGenStage("");
      setGenPercent(0);
      setSkipCache(false);
      reset();
      router.push(`/plan/${id}`);
    },
    onError: (err) => {
      setGenStage("");
      setGenPercent(0);
      toast.error(err.message);
    },
  });

  const templateMutation = useMutation({
    mutationFn: async (templatePlanId: string) => {
      const res = await fetch("/api/plans/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templatePlanId, acceptedLegal: true }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Nie udało się wczytać szablonu");
      return json as { id: string };
    },
    onSuccess: ({ id }) => {
      reset();
      router.push(`/plan/${id}`);
      toast.success("Plan wczytany z szablonu");
    },
    onError: (err) => toast.error(err.message),
  });

  function commitDaysCount(showToast = true): boolean {
    const trimmed = daysDraft.trim();
    if (trimmed === "") {
      if (showToast) toast.error("Podaj liczbę dni wyjazdu (1–30)");
      return false;
    }
    const n = Number.parseInt(trimmed, 10);
    if (Number.isNaN(n) || n < 1 || n > 30) {
      if (showToast) toast.error("Liczba dni musi być od 1 do 30");
      return false;
    }
    updateData({ daysCount: n });
    setDaysDraft(String(n));
    return true;
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (data.destination.trim().length < 2) {
        toast.error("Podaj kierunek podróży (min. 2 znaki)");
        return false;
      }
      if (!commitDaysCount()) {
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
      if (data.adultsCount < 1) {
        toast.error("Podaj liczbę dorosłych (min. 1)");
        return false;
      }
      if (
        data.travelParty === "FAMILY" &&
        (!data.childrenAges || data.childrenAges.length === 0)
      ) {
        toast.error("Podaj wiek przynajmniej jednego dziecka");
        return false;
      }
    }
    if (step === 3) {
      if (
        data.totalBudgetMin != null &&
        data.totalBudgetMax != null &&
        data.totalBudgetMin > data.totalBudgetMax
      ) {
        toast.error("Minimalny budżet nie może być większy od maksymalnego");
        return false;
      }
    }
    if (step === 5) {
      if (!data.travelStyles?.length) {
        toast.error("Wybierz co najmniej jeden styl podróży");
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

  function generate(useCache = !skipCache) {
    if (!legalAccepted) {
      toast.error("Zaakceptuj regulamin i politykę prywatności");
      return;
    }
    const result = tripWizardSchema.safeParse(data);
    if (!result.success) {
      toast.error("Uzupełnij wszystkie pola");
      return;
    }
    generateMutation.mutate({ payload: result.data, useCache });
  }

  function useTemplate(templatePlanId: string) {
    if (!legalAccepted) {
      toast.error("Zaakceptuj regulamin i politykę prywatności");
      return;
    }
    templateMutation.mutate(templatePlanId);
  }

  function setChildrenAges(ages: number[]) {
    updateData({ childrenAges: ages });
  }

  function applyBudgetPreset(level: TripWizardInput["budgetLevel"]) {
    const range = suggestBudgetRange(
      level,
      data.daysCount,
      data.adultsCount ?? 2,
    );
    updateData({
      budgetLevel: level,
      totalBudgetMin: range.totalBudgetMin,
      totalBudgetMax: range.totalBudgetMax,
    });
  }

  function toggleTravelStyle(style: TripWizardInput["travelStyles"][number]) {
    const current = data.travelStyles ?? ["MIXED"];
    if (style === "MIXED") {
      updateData({ travelStyles: ["MIXED"] });
      return;
    }
    const withoutMixed = current.filter((s) => s !== "MIXED");
    if (withoutMixed.includes(style)) {
      const next = withoutMixed.filter((s) => s !== style);
      updateData({ travelStyles: next.length ? next : ["MIXED"] });
      return;
    }
    if (withoutMixed.length >= 3) {
      toast.error("Możesz wybrać maksymalnie 3 style");
      return;
    }
    updateData({ travelStyles: [...withoutMixed, style] });
  }

  function toggleBudgetInclude(
    key: keyof TripWizardInput["budgetIncludes"],
  ) {
    updateData({
      budgetIncludes: {
        ...data.budgetIncludes,
        [key]: !data.budgetIncludes[key],
      },
    });
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
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="np. 7"
                  value={daysDraft}
                  onChange={(e) => {
                    const next = e.target.value.replace(/\D/g, "");
                    setDaysDraft(next);
                  }}
                  onBlur={() => {
                    const trimmed = daysDraft.trim();
                    if (trimmed === "") return;
                    const n = Number.parseInt(trimmed, 10);
                    if (Number.isNaN(n) || n < 1 || n > 30) {
                      setDaysDraft(String(data.daysCount));
                      return;
                    }
                    updateData({ daysCount: n });
                    setDaysDraft(String(n));
                  }}
                  className="border-white/15 bg-white/5"
                  aria-describedby="daysCount-hint"
                />
                <p id="daysCount-hint" className="text-xs text-muted-foreground">
                  Od 1 do 30 dni — możesz skasować i wpisać od nowa
                </p>
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
                        adultsCount:
                          v === "SOLO" ? 1
                          : v === "COUPLE" ? 2
                          : data.adultsCount,
                      })
                    }
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adultsCount">Liczba dorosłych</Label>
              <Input
                id="adultsCount"
                type="number"
                min={1}
                max={12}
                value={data.adultsCount}
                onChange={(e) =>
                  updateData({
                    adultsCount: Math.min(
                      12,
                      Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                    ),
                  })
                }
                className="border-white/15 bg-white/5"
              />
            </div>
            {data.travelParty === "FAMILY" && (
              <FamilyChildrenAges
                ages={data.childrenAges ?? []}
                onChange={setChildrenAges}
              />
            )}
            <div>
              <p className="mb-2 text-sm font-medium">Mobilność</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  Object.keys(MOBILITY_LABELS) as TripWizardInput["mobilityNeeds"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.mobilityNeeds}
                    label={MOBILITY_LABELS[key]}
                    onSelect={(v) => updateData({ mobilityNeeds: v })}
                  />
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.firstTimeVisit}
                onChange={(e) =>
                  updateData({ firstTimeVisit: e.target.checked })
                }
                className="size-4 rounded border-white/20"
              />
              Pierwsza wizyta w tym miejscu
            </label>
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
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium">Poziom wydatków (preset)</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  Object.keys(BUDGET_LABELS) as TripWizardInput["budgetLevel"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.budgetLevel}
                    label={BUDGET_LABELS[key]}
                    onSelect={(v) => applyBudgetPreset(v)}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Waluta</Label>
                <select
                  id="currency"
                  value={data.currency}
                  onChange={(e) =>
                    updateData({
                      currency: e.target.value as TripWizardInput["currency"],
                    })
                  }
                  className="h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 text-sm"
                >
                  {(
                    Object.keys(CURRENCY_LABELS) as TripWizardInput["currency"][]
                  ).map((c) => (
                    <option key={c} value={c}>
                      {CURRENCY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBudgetMin">Budżet min.</Label>
                <Input
                  id="totalBudgetMin"
                  type="number"
                  min={0}
                  value={data.totalBudgetMin ?? ""}
                  onChange={(e) =>
                    updateData({
                      totalBudgetMin:
                        e.target.value === "" ?
                          undefined
                        : Number(e.target.value),
                    })
                  }
                  className="border-white/15 bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalBudgetMax">Budżet max.</Label>
                <Input
                  id="totalBudgetMax"
                  type="number"
                  min={0}
                  value={data.totalBudgetMax ?? ""}
                  onChange={(e) =>
                    updateData({
                      totalBudgetMax:
                        e.target.value === "" ?
                          undefined
                        : Number(e.target.value),
                    })
                  }
                  className="border-white/15 bg-white/5"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Co wliczasz w widełki?</p>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(BUDGET_INCLUDE_LABELS) as (keyof TripWizardInput["budgetIncludes"])[]
                ).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleBudgetInclude(key)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      data.budgetIncludes[key] ?
                        "border-primary/50 bg-primary/15 text-foreground"
                      : "border-white/10 bg-white/5 text-muted-foreground",
                    )}
                  >
                    {BUDGET_INCLUDE_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Wariant planu AI</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  Object.keys(PLAN_VARIANT_LABELS) as TripWizardInput["planVariant"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.planVariant ?? "STANDARD"}
                    label={PLAN_VARIANT_LABELS[key]}
                    onSelect={(v) => updateData({ planVariant: v })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Standard jedzenia</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  Object.keys(FOOD_STANDARD_LABELS) as TripWizardInput["foodStandard"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.foodStandard}
                    label={FOOD_STANDARD_LABELS[key]}
                    onSelect={(v) => updateData({ foodStandard: v })}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryNotes">Dieta / alergie (opcjonalnie)</Label>
              <Input
                id="dietaryNotes"
                placeholder="np. wegetariańskie, bez glutenu"
                value={data.dietaryNotes ?? ""}
                onChange={(e) => updateData({ dietaryNotes: e.target.value })}
                className="border-white/15 bg-white/5"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Typ noclegu</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  Object.keys(
                    ACCOMMODATION_TYPE_LABELS,
                  ) as TripWizardInput["accommodationType"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.accommodationType}
                    label={ACCOMMODATION_TYPE_LABELS[key]}
                    onSelect={(v) => updateData({ accommodationType: v })}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredStartHour">Start dnia ok.</Label>
                <Input
                  id="preferredStartHour"
                  type="number"
                  min={7}
                  max={11}
                  value={data.preferredStartHour}
                  onChange={(e) =>
                    updateData({
                      preferredStartHour: Math.min(
                        11,
                        Math.max(7, Number.parseInt(e.target.value, 10) || 9),
                      ),
                    })
                  }
                  className="border-white/15 bg-white/5"
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.quietEvenings}
                  onChange={(e) =>
                    updateData({ quietEvenings: e.target.checked })
                  }
                  className="size-4 rounded border-white/20"
                />
                Spokojne wieczory (bez klubów po 22:00)
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wybierz do 3 priorytetów lub „Mix wszystkiego”.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <OptionChip
                value="MIXED"
                selected={
                  data.travelStyles.length === 1 &&
                  data.travelStyles[0] === "MIXED" ?
                    "MIXED"
                  : null
                }
                label={STYLE_LABELS.MIXED}
                onSelect={() => toggleTravelStyle("MIXED")}
              />
              {STYLE_OPTIONS.map((key) => (
                <MultiOptionChip
                  key={key}
                  value={key}
                  selected={data.travelStyles}
                  label={STYLE_LABELS[key]}
                  onToggle={toggleTravelStyle}
                />
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stylePriorityNote">
                Priorytet w jednym zdaniu (opcjonalnie)
              </Label>
              <Input
                id="stylePriorityNote"
                placeholder="np. głównie jedzenie i małe kawiarnie"
                value={data.stylePriorityNote ?? ""}
                onChange={(e) =>
                  updateData({ stylePriorityNote: e.target.value })
                }
                className="border-white/15 bg-white/5"
              />
            </div>
          </div>
        )}

        {step === 6 && (
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
            <div>
              <p className="mb-2 text-sm font-medium">Dystans między punktami</p>
              <div className="grid gap-2">
                {(
                  Object.keys(MAX_TRAVEL_LABELS) as TripWizardInput["maxTravelBetween"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.maxTravelBetween}
                    label={MAX_TRAVEL_LABELS[key]}
                    onSelect={(v) => updateData({ maxTravelBetween: v })}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.hasTransitPass}
                  onChange={(e) =>
                    updateData({ hasTransitPass: e.target.checked })
                  }
                  className="size-4 rounded border-white/20"
                />
                Mam bilet/karnet komunikacji
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.carRental}
                  onChange={(e) => updateData({ carRental: e.target.checked })}
                  className="size-4 rounded border-white/20"
                />
                Wynajem auta
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.lightFirstDay}
                  onChange={(e) =>
                    updateData({ lightFirstDay: e.target.checked })
                  }
                  className="size-4 rounded border-white/20"
                />
                Lżejszy pierwszy dzień
              </label>
            </div>
            <AirportPicker
              destination={data.destination}
              selectedCode={data.departureAirportCode}
              selectedName={data.departureAirportName}
              label="Lotnisko wylotu (opcjonalnie)"
              onSelect={(airport) =>
                updateData({
                  departureAirportCode: airport?.code,
                  departureAirportName: airport?.name,
                })
              }
            />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Okazja</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  Object.keys(TRIP_OCCASION_LABELS) as TripWizardInput["tripOccasion"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.tripOccasion}
                    label={TRIP_OCCASION_LABELS[key]}
                    onSelect={(v) => updateData({ tripOccasion: v })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Pogoda w planie</p>
              <div className="grid gap-2">
                {(
                  Object.keys(WEATHER_PREF_LABELS) as TripWizardInput["weatherPreference"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.weatherPreference}
                    label={WEATHER_PREF_LABELS[key]}
                    onSelect={(v) => updateData({ weatherPreference: v })}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Język / komunikacja</p>
              <div className="grid gap-2">
                {(
                  Object.keys(LANGUAGE_LABELS) as TripWizardInput["languageComfort"][]
                ).map((key) => (
                  <OptionChip
                    key={key}
                    value={key}
                    selected={data.languageComfort}
                    label={LANGUAGE_LABELS[key]}
                    onSelect={(v) => updateData({ languageComfort: v })}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="safetyNotes">Bezpieczeństwo (opcjonalnie)</Label>
              <Input
                id="safetyNotes"
                placeholder="np. wracać przed zmrokiem"
                value={data.safetyNotes ?? ""}
                onChange={(e) => updateData({ safetyNotes: e.target.value })}
                className="border-white/15 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Dodatkowe uwagi dla AI</Label>
              <textarea
                id="additionalNotes"
                rows={3}
                placeholder="Wszystko, co powinniśmy wiedzieć…"
                value={data.additionalNotes ?? ""}
                onChange={(e) =>
                  updateData({ additionalNotes: e.target.value })
                }
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {step === 8 && (
          <>
          {tripWizardSchema.safeParse(data).success && (
            <WizardCacheCard
              data={tripWizardSchema.parse(data)}
              loading={
                generateMutation.isPending || templateMutation.isPending
              }
              onUseTemplate={useTemplate}
              onGenerateFresh={() => {
                setSkipCache(true);
                generate(false);
              }}
            />
          )}
          <WizardPreviewCard
            data={tripWizardSchema.safeParse(data).success ? tripWizardSchema.parse(data) : data}
            enabled={data.destination.trim().length >= 2}
          />
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
              value={`${TRAVEL_PARTY_LABELS[data.travelParty]}, ${data.adultsCount} dorosłych`}
            />
            {data.childrenAges && data.childrenAges.length > 0 && (
              <SummaryRow
                label="Wiek dzieci"
                value={data.childrenAges.join(", ") + " lat"}
              />
            )}
            <SummaryRow
              label="Mobilność"
              value={MOBILITY_LABELS[data.mobilityNeeds]}
            />
            <SummaryRow
              label="Pierwsza wizyta"
              value={data.firstTimeVisit ? "tak" : "nie"}
            />
            {data.mustSee?.trim() && (
              <SummaryRow label="Must-see" value={data.mustSee} />
            )}
            {data.avoid?.trim() && (
              <SummaryRow label="Unikaj" value={data.avoid} />
            )}
            {data.accommodationArea?.trim() && (
              <SummaryRow label="Okolica noclegu" value={data.accommodationArea} />
            )}
            <SummaryRow label="Poziom budżetu" value={BUDGET_LABELS[data.budgetLevel]} />
            {data.totalBudgetMin != null && data.totalBudgetMax != null && (
              <SummaryRow
                label="Widełki"
                value={`${data.totalBudgetMin}–${data.totalBudgetMax} ${data.currency}`}
              />
            )}
            <SummaryRow
              label="Wariant planu"
              value={PLAN_VARIANT_LABELS[data.planVariant ?? "STANDARD"]}
            />
            <SummaryRow
              label="Styl"
              value={data.travelStyles
                .map((s) => STYLE_LABELS[s])
                .join(", ")}
            />
            <SummaryRow
              label="Jedzenie"
              value={FOOD_STANDARD_LABELS[data.foodStandard]}
            />
            <SummaryRow
              label="Nocleg (typ)"
              value={ACCOMMODATION_TYPE_LABELS[data.accommodationType]}
            />
            <SummaryRow label="Tempo" value={PACE_LABELS[data.paceLevel]} />
            <SummaryRow
              label="Transport"
              value={TRANSPORT_LABELS[data.transportMode]}
            />
            <SummaryRow
              label="Okazja"
              value={TRIP_OCCASION_LABELS[data.tripOccasion]}
            />
          </dl>
          <LegalConsentBlock
            checked={legalAccepted}
            onCheckedChange={setLegalAccepted}
            disabled={
              generateMutation.isPending || templateMutation.isPending
            }
          />
          </>
        )}

        {generateMutation.isPending && (
          <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium">{genStage || "Generuję plan…"}</p>
            <Progress value={genPercent || 8} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {genPercent > 0 ? `${genPercent}%` : "To może potrwać do 2 minut"}
            </p>
          </div>
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
              onClick={() => {
                if (!skipCache) generate(true);
                else generate(false);
              }}
              disabled={
                !legalAccepted ||
                generateMutation.isPending ||
                templateMutation.isPending
              }
              className={cn(
                "gap-2 bg-gradient-to-r from-primary to-accent",
                (generateMutation.isPending || !legalAccepted) && "opacity-80",
              )}
            >
              {generateMutation.isPending ?
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {genStage || "Generuję plan…"}
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
