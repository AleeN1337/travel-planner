import { NextResponse } from "next/server";
import { z } from "zod";
import { ensurePlanOwner } from "@/lib/plans/plan-access-response";
import { createShareInvite } from "@/lib/plans/share-plan";
import {
  enforceRateLimit,
  parseJsonBody,
} from "@/lib/security/api-guard";

const bodySchema = z
  .object({
    permission: z.enum(["VIEW", "EDIT"]).optional(),
  })
  .optional();

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanOwner(id);
  if (!access.ok) return access.response;

  const parsed = await parseJsonBody(request, bodySchema);
  if (!parsed.success) return parsed.response;

  const permission = parsed.data?.permission ?? "VIEW";

  try {
    const invite = await createShareInvite(id, permission);
    return NextResponse.json(invite);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nie udało się utworzyć zaproszenia";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
