import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import type { SharePermission } from "@/generated/prisma/client";

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function buildInviteUrl(shareToken: string): string {
  return `${getAppBaseUrl()}/zaproszenie/${shareToken}`;
}

export async function createShareInvite(
  planId: string,
  permission: SharePermission = "VIEW",
) {
  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    select: { id: true, status: true },
  });
  if (!plan) {
    throw new Error("Nie znaleziono planu");
  }

  const link = await db.shareLink.create({
    data: {
      tripPlanId: planId,
      token: randomUUID(),
      permission,
    },
  });

  return {
    id: link.id,
    token: link.token,
    permission: link.permission,
    url: buildInviteUrl(link.token),
    createdAt: link.createdAt,
  };
}

export async function resolveShareInvite(shareToken: string) {
  const db = getDb();
  const link = await db.shareLink.findUnique({
    where: { token: shareToken },
    include: {
      tripPlan: { select: { id: true, destination: true, status: true } },
    },
  });

  if (!link) return null;
  if (link.expiresAt && link.expiresAt < new Date()) return null;

  return link;
}
