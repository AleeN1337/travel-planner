import { generateTripPlanWithProgress } from "@/lib/ai/generate-plan-chunked";
import { planToWizardInput } from "@/lib/ai/plan-context";
import { geocodeTripPlan } from "@/lib/plans/geocode-plan";
import { getTripPlanById } from "@/lib/plans/get-plan";
import {
  createPlanRecord,
  saveGeneratedPlan,
  updateGenerationProgress,
} from "@/lib/plans/persist-plan";
import type { PlanVariant } from "@/generated/prisma/client";
import type { TripWizardInput } from "@/types/trip";

export async function generatePlanVariantFromSource(
  sourcePlanId: string,
  variant: PlanVariant,
  onProgress?: (stage: string, percent: number) => void | Promise<void>,
) {
  const source = await getTripPlanById(sourcePlanId);
  if (!source || source.status !== "READY") {
    throw new Error("Plan źródłowy niedostępny");
  }

  const input: TripWizardInput = {
    ...planToWizardInput(source),
    planVariant: variant,
  };

  const plan = await createPlanRecord(input);

  const generated = await generateTripPlanWithProgress(input, async (e) => {
    await updateGenerationProgress(plan.id, e.stage, e.percent);
    await onProgress?.(e.stage, e.percent);
  });

  await saveGeneratedPlan(plan.id, generated);

  try {
    await geocodeTripPlan(plan.id);
  } catch {
    /* optional */
  }

  return plan;
}
