import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/env";
import { rateLimitBackend } from "@/lib/security/rate-limit";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "travel-planner",
    database: hasDatabase() ? "configured" : "not_configured",
    rateLimit: rateLimitBackend(),
    timestamp: new Date().toISOString(),
  });
}
