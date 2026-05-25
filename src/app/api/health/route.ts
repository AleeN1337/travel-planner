import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "travel-planner",
    database: hasDatabase() ? "configured" : "not_configured",
    timestamp: new Date().toISOString(),
  });
}
