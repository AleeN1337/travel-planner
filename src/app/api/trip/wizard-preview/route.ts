import { NextResponse } from "next/server";
import { previewWizardTrip } from "@/lib/ai/wizard-preview";
import { guardWriteRequest } from "@/lib/security/api-guard";
import { tripWizardSchema } from "@/types/trip";

export const maxDuration = 45;

export async function POST(request: Request) {
  const guarded = await guardWriteRequest(request, "tripAi", tripWizardSchema);
  if (!guarded.ok) return guarded.response;

  try {
    const preview = await previewWizardTrip(guarded.data);
    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Błąd podglądu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
