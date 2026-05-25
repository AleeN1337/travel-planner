"use client";

import { cn } from "@/lib/utils";

type OptionChipProps<T extends string> = {
  value: T;
  selected: T;
  label: string;
  onSelect: (value: T) => void;
};

export function OptionChip<T extends string>({
  value,
  selected,
  label,
  onSelect,
}: OptionChipProps<T>) {
  const isSelected = value === selected;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
        isSelected ?
          "border-primary/50 bg-primary/15 text-foreground shadow-sm shadow-primary/10"
        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
