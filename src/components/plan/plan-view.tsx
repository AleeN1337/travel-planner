import { PlanEditor } from "@/components/plan/plan-editor";
import { PlanEnrichmentTrigger } from "@/components/plan/plan-enrichment-trigger";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";

type PlanViewProps = {
  plan: TripPlanWithDays;
  hasWeatherApi: boolean;
  runEnrichment: boolean;
};

/** Server wrapper — jedna granica klienta w PlanEditor */
export function PlanView({ plan, hasWeatherApi, runEnrichment }: PlanViewProps) {
  return (
    <>
      <PlanEnrichmentTrigger planId={plan.id} runEnrichment={runEnrichment} />
      <PlanEditor plan={plan} hasWeatherApi={hasWeatherApi} />
    </>
  );
}
