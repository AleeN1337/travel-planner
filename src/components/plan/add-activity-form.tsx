"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TIME_OF_DAY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { TimeOfDay } from "@/generated/prisma/client";

type AddActivityFormProps = {
  planDayId: string;
  onAdd: (data: {
    planDayId: string;
    title: string;
    description?: string;
    locationName?: string;
    timeOfDay: TimeOfDay;
  }) => Promise<void>;
  disabled?: boolean;
};

export function AddActivityForm({
  planDayId,
  onAdd,
  disabled,
}: AddActivityFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("AFTERNOON");
  const [loading, setLoading] = useState(false);

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
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || disabled}>
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
