import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TripPlanDocument } from "@/lib/pdf/trip-plan-document";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { ensurePlanRead } from "@/lib/plans/plan-access-response";
import { enforceRateLimit } from "@/lib/security/api-guard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = await enforceRateLimit(request, "api");
  if (limited) return limited;

  const { id } = await context.params;
  const access = await ensurePlanRead(id);
  if (!access.ok) return access.response;

  const plan = await getTripPlanById(id);

  if (!plan || plan.status !== "READY") {
    return NextResponse.json({ error: "Plan niedostępny" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<TripPlanDocument plan={plan} />);
  const filename = `plan-${plan.destination.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
