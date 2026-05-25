import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TripPlanDocument } from "@/lib/pdf/trip-plan-document";
import { getTripPlanById } from "@/lib/plans/get-plan";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
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
