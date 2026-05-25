import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/env";
import {
  getProductionEmailSetupError,
  isEmailConfigured,
  isProductionEmailReady,
} from "@/lib/email/email-config";

export async function GET() {
  const emailIssue = getProductionEmailSetupError();

  return NextResponse.json({
    status: "ok",
    service: "travel-planner",
    database: hasDatabase() ? "configured" : "not_configured",
    email: {
      configured: isEmailConfigured(),
      productionReady: isProductionEmailReady(),
      ...(emailIssue ? { issue: emailIssue } : {}),
    },
    timestamp: new Date().toISOString(),
  });
}
