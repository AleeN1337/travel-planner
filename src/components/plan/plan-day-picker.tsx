"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type PlanDayPickerItem = {
  dayNumber: number;
  title?: string | null;
  mappedCount?: number;
};

type PlanDayPickerProps = {
  days: PlanDayPickerItem[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  className?: string;
};

function buildWeekGroups(days: PlanDayPickerItem[]) {
  const groups: { label: string; days: PlanDayPickerItem[] }[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const start = chunk[0]?.dayNumber ?? i + 1;
    const end = chunk[chunk.length - 1]?.dayNumber ?? start;
    groups.push({
      label: start === end ? `Dzień ${start}` : `Tydzień · dni ${start}–${end}`,
      days: chunk,
    });
  }
  return groups;
}

function DayListItem({
  day,
  selected,
  onPick,
}: {
  day: PlanDayPickerItem;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onPick}
      className={cn(
        "flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
        selected ?
          "bg-primary/15 text-foreground ring-1 ring-primary/35"
        : "text-foreground hover:bg-white/8",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
          selected ?
            "bg-primary text-primary-foreground"
          : "bg-white/10 text-muted-foreground",
        )}
      >
        {day.dayNumber}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">
          Dzień {day.dayNumber}
        </span>
        {day.title?.trim() ?
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {day.title.trim()}
          </span>
        : null}
        {day.mappedCount != null && day.mappedCount > 0 ?
          <span className="mt-1 block text-xs text-primary/90">
            {day.mappedCount}{" "}
            {day.mappedCount === 1 ? "miejsce" : "miejsc"} na mapie
          </span>
        : null}
      </span>
      {selected ?
        <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
      : null}
    </button>
  );
}

export function PlanDayPicker({
  days,
  selectedDay,
  onSelectDay,
  className,
}: PlanDayPickerProps) {
  const [open, setOpen] = useState(false);
  const total = days.length;
  const currentIndex = days.findIndex((d) => d.dayNumber === selectedDay);
  const index = currentIndex >= 0 ? currentIndex : 0;
  const current = days[index];

  const weekGroups = useMemo(() => buildWeekGroups(days), [days]);
  const useWeekGroups = total > 7;

  const goPrev = () => {
    if (index > 0) onSelectDay(days[index - 1].dayNumber);
  };

  const goNext = () => {
    if (index < total - 1) onSelectDay(days[index + 1].dayNumber);
  };

  const pickDay = (dayNumber: number) => {
    onSelectDay(dayNumber);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-white/10 p-3 sm:flex-nowrap",
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={goPrev}
        disabled={index <= 0}
        className="shrink-0 border-white/15"
        aria-label="Poprzedni dzień"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            "flex h-auto min-h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-white/15",
            "bg-white/5 px-3 py-2 text-left text-sm outline-none transition-colors",
            "hover:bg-white/8 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/30",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block font-semibold leading-snug text-foreground">
              Dzień {selectedDay}
            </span>
            {current?.title?.trim() ?
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {current.title.trim()}
              </span>
            : <span className="mt-0.5 block text-xs text-muted-foreground">
                Wybierz dzień trasy
              </span>
            }
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="max-h-[min(70vh,20rem)] w-[min(calc(100vw-1.5rem),22rem)] overflow-y-auto p-2"
        >
          {useWeekGroups ?
            weekGroups.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <p className="sticky top-0 z-10 mb-1 rounded-md bg-popover px-2 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.days.map((d) => (
                    <DayListItem
                      key={d.dayNumber}
                      day={d}
                      selected={selectedDay === d.dayNumber}
                      onPick={() => pickDay(d.dayNumber)}
                    />
                  ))}
                </div>
              </div>
            ))
          : <div className="flex flex-col gap-0.5">
              {days.map((d) => (
                <DayListItem
                  key={d.dayNumber}
                  day={d}
                  selected={selectedDay === d.dayNumber}
                  onPick={() => pickDay(d.dayNumber)}
                />
              ))}
            </div>
          }
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={goNext}
        disabled={index >= total - 1}
        className="shrink-0 border-white/15"
        aria-label="Następny dzień"
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>

      <span
        className="w-full shrink-0 text-center text-xs tabular-nums text-muted-foreground sm:w-auto sm:min-w-[3rem]"
        aria-live="polite"
      >
        {selectedDay} / {total}
      </span>
    </div>
  );
}
