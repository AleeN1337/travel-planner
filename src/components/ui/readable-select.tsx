"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__readable_select_empty__";

export type ReadableSelectOption = {
  value: string;
  label: string;
};

type ReadableSelectProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const triggerClassName =
  "h-10 w-full border-white/25 bg-card text-sm font-medium text-foreground shadow-sm hover:bg-card/90 data-placeholder:text-muted-foreground";

const contentClassName =
  "border-white/20 bg-popover text-popover-foreground shadow-lg";

const itemClassName =
  "py-2.5 text-sm font-medium text-popover-foreground focus:bg-primary/20 focus:text-foreground";

export function ReadableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Wybierz…",
  disabled,
  className,
}: ReadableSelectProps) {
  const selectValue = value === "" ? EMPTY_VALUE : value;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} className="text-xs font-medium text-foreground/90">
          {label}
        </Label>
      )}
      <Select
        value={selectValue}
        onValueChange={(v) => onChange(v === EMPTY_VALUE ? "" : (v ?? ""))}
        disabled={disabled}
        items={Object.fromEntries(
          options.map((o) => [
            o.value === "" ? EMPTY_VALUE : o.value,
            o.label,
          ]),
        )}
      >
        <SelectTrigger id={id} size="default" className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName} alignItemWithTrigger={false}>
          {options.map((opt) => {
            const itemValue = opt.value === "" ? EMPTY_VALUE : opt.value;
            return (
              <SelectItem
                key={itemValue}
                value={itemValue}
                className={itemClassName}
              >
                {opt.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

type ParticipantSelectProps = {
  id?: string;
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  participants: string[];
  placeholder?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
};

/** Wybór uczestnika planu — checklista, rozliczenia itd. */
export function ParticipantSelect({
  id,
  label,
  value,
  onChange,
  participants,
  placeholder = "Wybierz osobę…",
  emptyLabel = "— nie przypisano —",
  allowEmpty = true,
  disabled,
  className,
}: ParticipantSelectProps) {
  const options: ReadableSelectOption[] = [
    ...(allowEmpty ? [{ value: "", label: emptyLabel }] : []),
    ...participants.map((name) => ({ value: name, label: name })),
  ];

  return (
    <ReadableSelect
      id={id}
      label={label}
      value={value ?? ""}
      onChange={(v) => onChange(v || null)}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}
