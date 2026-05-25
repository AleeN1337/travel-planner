import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { PlanEditor } from "@/components/plan/plan-editor";

type PlanViewProps = {
  plan: TripPlanWithDays;
  hasWeatherApi: boolean;
};

export function PlanView({ plan, hasWeatherApi }: PlanViewProps) {
  return <PlanEditor plan={plan} hasWeatherApi={hasWeatherApi} />;
}
