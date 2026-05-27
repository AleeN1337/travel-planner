import { PlanEditor } from "@/components/plan/plan-editor";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";

type PlanViewProps = {
  plan: TripPlanWithDays;
  hasWeatherApi: boolean;
};

/** Server wrapper — jedna granica klienta w PlanEditor */
export function PlanView({ plan, hasWeatherApi }: PlanViewProps) {
  return <PlanEditor plan={plan} hasWeatherApi={hasWeatherApi} />;
}
