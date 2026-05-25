"use client";

import dynamic from "next/dynamic";
import type { TransportMode } from "@/generated/prisma/client";
import type { DayWithRoute } from "@/lib/plans/plan-utils";
import { MAP_SKELETON_CLASS } from "@/lib/ui/layout-classes";

const PlanMap = dynamic(
  () => import("@/components/plan/plan-map").then((m) => m.PlanMap),
  {
    ssr: false,
    loading: () => (
      <div className={MAP_SKELETON_CLASS}>Ładowanie mapy…</div>
    ),
  },
);

export function PlanMapClient({
  days,
  transport,
}: {
  days: DayWithRoute[];
  transport: TransportMode;
}) {
  return <PlanMap days={days} transport={transport} />;
}
