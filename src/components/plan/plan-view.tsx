import { PlanEditor } from "@/components/plan/plan-editor";
import { PlanEnrichmentTrigger } from "@/components/plan/plan-enrichment-trigger";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import type { PlanAccessRole } from "@/lib/plans/plan-access-types";

type PlanViewProps = {
  plan: TripPlanWithDays;
  hasWeatherApi: boolean;
  runEnrichment: boolean;
  accessRole: PlanAccessRole;
};

/** Server wrapper — jedna granica klienta w PlanEditor */
export function PlanView({
  plan,
  hasWeatherApi,
  runEnrichment,
  accessRole,
}: PlanViewProps) {
  return (
    <>
      <PlanEnrichmentTrigger planId={plan.id} runEnrichment={runEnrichment} />
      <PlanEditor
        plan={plan}
        hasWeatherApi={hasWeatherApi}
        accessRole={accessRole}
      />
    </>
  );
}
