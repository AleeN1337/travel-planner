import { NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/ai/generate-plan";
import { geocodeTripPlan } from "@/lib/plans/geocode-plan";
import {
  createPlanRecord,
  markPlanFailed,
  saveGeneratedPlan,
} from "@/lib/plans/persist-plan";
import { tripWizardSchema } from "@/types/trip";

export const maxDuration = 120;

export async function POST(request: Request) {
  let planId: string | undefined;

  try {
    const body = await request.json();
    const parsed = tripWizardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const plan = await createPlanRecord(parsed.data);
    planId = plan.id;

    const generated = await generateTripPlan(parsed.data);
    await saveGeneratedPlan(plan.id, generated);

    try {
      await geocodeTripPlan(plan.id);
    } catch (geoErr) {
      console.error("[plans/generate] geocode:", geoErr);
    }

    return NextResponse.json({ id: plan.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Błąd generowania planu";

    if (process.env.NODE_ENV === "development") {
      console.error("[plans/generate]", error);
    }

    if (planId) {
      await markPlanFailed(planId, message).catch(() => undefined);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
