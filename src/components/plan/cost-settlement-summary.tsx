"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import type { CostSplitDto } from "@/lib/plans/collaboration/types";
import { computeCostSettlements } from "@/lib/plans/cost-settlement";

type CostSettlementSummaryProps = {
  splits: CostSplitDto[];
  minExpenses?: number;
};

export function CostSettlementSummary({
  splits,
  minExpenses = 2,
}: CostSettlementSummaryProps) {
  const transfers = useMemo(
    () => computeCostSettlements(splits),
    [splits],
  );

  if (splits.length < minExpenses) return null;

  const total = splits.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/10 p-4">
      <h4 className="text-sm font-semibold text-foreground">Podsumowanie rozliczeń</h4>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Łącznie wydatków: {total.toFixed(2)} PLN · {splits.length}{" "}
        {splits.length === 1 ? "pozycja" : "pozycje"}
      </p>
      {transfers.length === 0 ?
        <p className="mt-3 text-sm text-muted-foreground">
          Wszyscy są rozliczeni — nikt nikomu nie jest winien.
        </p>
      : <ul className="mt-3 space-y-2">
          {transfers.map((t, i) => (
            <li
              key={`${t.from}-${t.to}-${i}`}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 text-sm"
            >
              <span className="font-medium text-foreground">{t.from}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                oddaje
                <ArrowRight className="size-3.5 text-primary" aria-hidden />
              </span>
              <span className="font-medium text-foreground">{t.to}</span>
              <span className="ml-auto tabular-nums font-semibold text-primary">
                {t.amount.toFixed(2)} PLN
              </span>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
