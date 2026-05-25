"use client";

import dynamic from "next/dynamic";
import type { DayWithRoute } from "@/lib/plans/plan-utils";

const PlanMap = dynamic(
  () => import("@/components/plan/plan-map").then((m) => m.PlanMap),
  {
    ssr: false,
    loading: () => (
      <div className="glass-card flex h-64 animate-pulse items-center justify-center rounded-2xl border-white/10 text-sm text-muted-foreground">
        Ładowanie mapy…
      </div>
    ),
  },
);

export function PlanMapClient({ days }: { days: DayWithRoute[] }) {
  return <PlanMap days={days} />;
}
