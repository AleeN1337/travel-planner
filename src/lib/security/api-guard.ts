import { NextResponse } from "next/server";
import type { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  type RateLimitCategory,
} from "@/lib/security/rate-limit";

export const MAX_JSON_BYTES = 512 * 1024;

export function rateLimitExceededResponse(
  retryAfterSec: number,
  label: string,
): NextResponse {
  return NextResponse.json(
    {
      error: `Zbyt wiele żądań (${label}). Spróbuj ponownie za ${retryAfterSec} s.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Policy": label,
      },
    },
  );
}

/** Zwraca NextResponse przy przekroczeniu limitu, inaczej null */
export async function enforceRateLimit(
  request: Request,
  category: RateLimitCategory,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(ip, category);
  if (!result.ok) {
    return rateLimitExceededResponse(result.retryAfterSec, result.label);
  }
  return null;
}

export function rejectOversizedBody(request: Request): NextResponse | null {
  const length = request.headers.get("content-length");
  if (length) {
    const bytes = Number.parseInt(length, 10);
    if (!Number.isNaN(bytes) && bytes > MAX_JSON_BYTES) {
      return NextResponse.json(
        { error: "Zbyt duży rozmiar żądania" },
        { status: 413 },
      );
    }
  }
  return null;
}

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse }
> {
  const oversized = rejectOversizedBody(request);
  if (oversized) {
    return { success: false, response: oversized };
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Nieprawidłowy format JSON" },
        { status: 400 },
      ),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Nieprawidłowe dane", details: parsed.error.flatten() },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: parsed.data };
}

/** Rate limit + opcjonalna walidacja JSON dla POST/PATCH */
export async function guardWriteRequest<T extends z.ZodType>(
  request: Request,
  category: RateLimitCategory,
  schema: T,
): Promise<
  | { ok: true; data: z.infer<T> }
  | { ok: false; response: NextResponse }
> {
  const limited = await enforceRateLimit(request, category);
  if (limited) {
    return { ok: false, response: limited };
  }

  const body = await parseJsonBody(request, schema);
  if (!body.success) {
    return { ok: false, response: body.response };
  }

  return { ok: true, data: body.data };
}
