"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Calendar, Eye, MapPin, Pencil, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PlanDayCard } from "@/components/plan/plan-day-card";
import { EditableDayColumn } from "@/components/plan/editable-day-column";
import { SortableActivity } from "@/components/plan/sortable-activity";
import { BudgetPanel } from "@/components/plan/budget-panel";
import { LocalTipsSection } from "@/components/plan/local-tips-section";
import { PlanMapClient } from "@/components/plan/plan-view-client";
import { ChecklistPanel } from "@/components/plan/checklist-panel";
import { WeatherPanel } from "@/components/plan/weather-panel";
import { PlanExportActions } from "@/components/plan/plan-export-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
} from "@/types/trip";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  enrichDay,
  sortActivities,
  type ActivityWithCoords,
} from "@/lib/plans/plan-utils";
import type { TimeOfDay } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type PlanEditorProps = {
  plan: TripPlanWithDays;
  hasWeatherApi: boolean;
};

function initContainers(plan: TripPlanWithDays): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const day of plan.days) {
    out[day.id] = sortActivities(day.activities).map((a) => a.id);
  }
  return out;
}

function buildActivityMap(
  plan: TripPlanWithDays,
): Record<string, ActivityWithCoords> {
  const map: Record<string, ActivityWithCoords> = {};
  for (const day of plan.days) {
    for (const a of day.activities) {
      map[a.id] = {
        ...a,
        coords:
          a.latitude != null && a.longitude != null ?
            { lat: a.latitude, lng: a.longitude }
          : null,
      };
    }
  }
  return map;
}

export function PlanEditor({ plan, hasWeatherApi }: PlanEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [containers, setContainers] = useState(() => initContainers(plan));
  const [activeId, setActiveId] = useState<string | null>(null);

  const activityMap = useMemo(() => buildActivityMap(plan), [plan]);

  useEffect(() => {
    setContainers(initContainers(plan));
  }, [plan]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = useCallback(
    (id: string) => {
      if (id in containers) return id;
      return Object.keys(containers).find((key) => containers[key].includes(id));
    },
    [containers],
  );

  const persistOrder = useCallback(async () => {
    setSaveState("saving");
    const moves: { activityId: string; planDayId: string; orderIndex: number }[] =
      [];
    for (const [planDayId, ids] of Object.entries(containers)) {
      ids.forEach((activityId, orderIndex) => {
        moves.push({ activityId, planDayId, orderIndex });
      });
    }

    const res = await fetch(`/api/plans/${plan.id}/activities/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    });

    if (!res.ok) {
      setSaveState("idle");
      toast.error("Nie udało się zapisać kolejności");
      throw new Error("save failed");
    }

    setSaveState("saved");
    router.refresh();
    setTimeout(() => setSaveState("idle"), 2000);
  }, [containers, plan.id, router]);

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(String(active.id));
    const overId = String(over.id);
    const overContainer =
      overId in containers ? overId : findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setContainers((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];
      const activeIndex = activeItems.indexOf(String(active.id));
      if (activeIndex === -1) return prev;

      activeItems.splice(activeIndex, 1);
      const overIndex = overItems.indexOf(overId);
      if (overIndex >= 0) {
        overItems.splice(overIndex, 0, String(active.id));
      } else {
        overItems.push(String(active.id));
      }

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: overItems,
      };
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeContainer = findContainer(String(active.id));
    const overContainer =
      String(over.id) in containers ?
        String(over.id)
      : findContainer(String(over.id));

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const items = containers[activeContainer];
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setContainers((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex),
        }));
      }
    }

    try {
      await persistOrder();
    } catch {
      setContainers(initContainers(plan));
    }
  }

  async function handleDelete(activityId: string) {
    if (!confirm("Usunąć ten punkt z planu?")) return;
    setSaveState("saving");
    const res = await fetch(
      `/api/plans/${plan.id}/activities/${activityId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      toast.error("Nie udało się usunąć");
      setSaveState("idle");
      return;
    }
    toast.success("Usunięto");
    router.refresh();
    setSaveState("idle");
  }

  async function handleAdd(data: {
    planDayId: string;
    title: string;
    description?: string;
    locationName?: string;
    timeOfDay: TimeOfDay;
  }) {
    setSaveState("saving");
    const res = await fetch(`/api/plans/${plan.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Nie udało się dodać punktu");
      setSaveState("idle");
      return;
    }
    toast.success("Dodano punkt");
    router.refresh();
    setSaveState("idle");
  }

  const enrichedDays = plan.days.map((d) => enrichDay(d, plan.transportMode));

  const localEnrichedDays = useMemo(() => {
    return plan.days.map((day) => {
      const ids = containers[day.id] ?? [];
      const activities = ids
        .map((id) => activityMap[id])
        .filter(Boolean) as ActivityWithCoords[];
      return enrichDay(
        { ...day, activities, planBAlternatives: day.planBAlternatives },
        plan.transportMode,
      );
    });
  }, [plan.days, containers, activityMap, plan.transportMode]);

  const activeActivity = activeId ? activityMap[activeId] : null;

  return (
    <div className="space-y-8">
      <header className="glass-card rounded-3xl border-white/10 p-4 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Twój plan podróży
            </p>
            <h1 className="font-heading mt-1 break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {plan.destination}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15">
                {BUDGET_LABELS[plan.budgetLevel]}
              </Badge>
              <Badge variant="outline" className="border-white/15">
                {STYLE_LABELS[plan.travelStyle]}
              </Badge>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {saveState === "saving" && (
                <span className="text-xs text-muted-foreground">Zapisywanie…</span>
              )}
              {saveState === "saved" && (
                <span className="text-xs text-primary">Zapisano</span>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing((e) => !e)}
                className="gap-1.5 border-white/15"
              >
                {editing ?
                  <>
                    <Eye className="size-3.5" aria-hidden />
                    Podgląd
                  </>
                : <>
                    <Pencil className="size-3.5" aria-hidden />
                    Edytuj
                  </>
                }
              </Button>
            </div>
            <PlanExportActions planId={plan.id} />
            <Link
              href="/plan/new"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/15")}
            >
              Nowy plan
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 min-[400px]:grid-cols-3 sm:max-w-md sm:gap-3">
          <Stat icon={Calendar} label={`${plan.daysCount} dni`} />
          <Stat
            icon={MapPin}
            label={`${plan.days.reduce((n, d) => n + d.activities.length, 0)} miejsc`}
          />
          {plan.totalBudgetMax != null && (
            <Stat
              icon={Wallet}
              label={
                plan.totalBudgetMin != null && plan.totalBudgetMin !== plan.totalBudgetMax ?
                  `${Math.round(plan.totalBudgetMin)}–${Math.round(plan.totalBudgetMax)} PLN`
                : `~${Math.round(plan.totalBudgetMax)} PLN`
              }
            />
          )}
        </div>

        {editing && (
          <p className="mt-4 text-sm text-muted-foreground">
            Przeciągnij punkty między dniami · zmiany zapisują się automatycznie
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3 lg:col-start-1 lg:row-start-1">
          <PlanMapClient
            days={editing ? localEnrichedDays : enrichedDays}
            transport={plan.transportMode}
          />
        </div>

        <aside className="space-y-6 lg:col-span-2 lg:col-start-4 lg:row-span-2 lg:row-start-1">
          <WeatherPanel
            snapshots={plan.weatherSnapshots}
            hasApiKey={hasWeatherApi}
          />
          {plan.checklistItems.length > 0 && (
            <ChecklistPanel planId={plan.id} items={plan.checklistItems} />
          )}
          <BudgetPanel plan={plan} />
          <LocalTipsSection plan={plan} />
        </aside>

        <div className="space-y-6 lg:col-span-3 lg:col-start-1 lg:row-start-2">
          {editing ?
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={(e) => setActiveId(String(e.active.id))}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
            >
              <div className="space-y-6">
                {plan.days.map((day) => (
                  <EditableDayColumn
                    key={day.id}
                    dayId={day.id}
                    dayNumber={day.dayNumber}
                    title={day.title}
                    summary={day.summary}
                    activityIds={containers[day.id] ?? []}
                    activityMap={activityMap}
                    planBAlternatives={day.planBAlternatives}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    isSaving={saveState === "saving"}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeActivity ?
                  <div className="rounded-xl border border-primary/50 bg-card p-4 shadow-2xl opacity-95">
                    <p className="font-medium">{activeActivity.title}</p>
                  </div>
                : null}
              </DragOverlay>
            </DndContext>
          : <div className="space-y-6">
              {enrichedDays.map((day) => (
                <PlanDayCard
                  key={day.id}
                  day={day}
                  transport={plan.transportMode}
                />
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 min-[400px]:flex-col min-[400px]:gap-1 min-[400px]:px-3 min-[400px]:text-center">
      <Icon className="size-4 shrink-0 text-primary min-[400px]:mx-auto" aria-hidden />
      <p className="text-sm font-medium min-[400px]:text-xs">{label}</p>
    </div>
  );
}
