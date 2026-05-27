"use client";

import Link from "next/link";
import { LEGAL_PATHS } from "@/lib/legal/site";
import { cn } from "@/lib/utils";

type LegalConsentBlockProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function LegalConsentBlock({
  checked,
  onCheckedChange,
  disabled,
}: LegalConsentBlockProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-white/20 accent-primary"
        />
        <span className="text-sm leading-relaxed text-muted-foreground">
          Akceptuję{" "}
          <Link
            href={LEGAL_PATHS.terms}
            target="_blank"
            className="text-primary underline-offset-2 hover:underline"
          >
            Regulamin
          </Link>{" "}
          oraz{" "}
          <Link
            href={LEGAL_PATHS.privacy}
            target="_blank"
            className="text-primary underline-offset-2 hover:underline"
          >
            Politykę prywatności
          </Link>
          . Rozumiem, że plan jest generowany przez sztuczną inteligencję i ma
          charakter informacyjny.
        </span>
      </label>
      <p className="text-xs leading-relaxed text-muted-foreground/90">
        Nie podawaj w kreatorze danych wrażliwych (np. PESEL, informacje
        medyczne). Treści mogą być przekazywane do dostawcy modelu AI (OpenAI) w
        celu wygenerowania planu — zgodnie z polityką prywatności.
      </p>
    </div>
  );
}
