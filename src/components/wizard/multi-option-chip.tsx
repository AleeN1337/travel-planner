"use client";

import { cn } from "@/lib/utils";

type MultiOptionChipProps<T extends string> = {
  value: T;
  selected: T[];
  label: string;
  onToggle: (value: T) => void;
  max?: number;
};

export function MultiOptionChip<T extends string>({
  value,
  selected,
  label,
  onToggle,
  max = 3,
}: MultiOptionChipProps<T>) {
  const isSelected = selected.includes(value);
  const atMax = !isSelected && selected.length >= max;

  return (
    <button
      type="button"
      disabled={atMax}
      onClick={() => onToggle(value)}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40",
        isSelected ?
          "border-primary/50 bg-primary/15 text-foreground shadow-sm shadow-primary/10"
        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
