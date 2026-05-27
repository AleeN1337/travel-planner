import { NextResponse } from "next/server";
import { findCachedTemplate } from "@/lib/plans/clone-plan";
import { computeParamsHash } from "@/lib/plans/params-hash";
import { enforceRateLimit, parseJsonBody } from "@/lib/security/api-guard";
import { tripWizardSchema } from "@/types/trip";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "tripAi");
  if (limited) return limited;

  const parsed = await parseJsonBody(request, tripWizardSchema);
  if (!parsed.success) {
    return NextResponse.json({ hit: false });
  }

  const hash = computeParamsHash(parsed.data);
  const template = await findCachedTemplate(
    hash,
    parsed.data.planVariant ?? "STANDARD",
  );

  if (!template) {
    return NextResponse.json({ hit: false, paramsHash: hash });
  }

  return NextResponse.json({
    hit: true,
    paramsHash: hash,
    templatePlanId: template.id,
    destination: template.destination,
    daysCount: template.daysCount,
    variant: template.variant,
    createdAt: template.createdAt.toISOString(),
  });
}
