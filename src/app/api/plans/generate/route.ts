import { NextResponse } from "next/server";
import { generateTripPlanWithProgress } from "@/lib/ai/generate-plan-chunked";
import { guestPlanCookieHeader } from "@/lib/plans/guest-plan-cookie";
import { geocodeTripPlan } from "@/lib/plans/geocode-plan";
import { cloneTripPlan, findCachedTemplate } from "@/lib/plans/clone-plan";
import { computeParamsHash } from "@/lib/plans/params-hash";
import {
  createPlanRecord,
  markPlanFailed,
  saveGeneratedPlan,
  updateGenerationProgress,
} from "@/lib/plans/persist-plan";
import {
  enforceRateLimit,
  rejectOversizedBody,
} from "@/lib/security/api-guard";
import { tripWizardSchema, type TripWizardInput } from "@/types/trip";

export const maxDuration = 120;

function sseLine(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

async function tryLoadFromCache(input: TripWizardInput, useCache: boolean) {
  if (useCache === false) return null;
  const hash = computeParamsHash(input);
  const template = await findCachedTemplate(
    hash,
    input.planVariant ?? "STANDARD",
  );
  if (!template) return null;
  return cloneTripPlan(template.id);
}

export async function POST(request: Request) {
  const rateLimited = await enforceRateLimit(request, "generate");
  if (rateLimited) return rateLimited;

  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const accept = request.headers.get("accept") ?? "";
  const wantsStream = accept.includes("text/event-stream");

  let planId: string | undefined;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (body.acceptedLegal !== true) {
      return NextResponse.json(
        { error: "Wymagana akceptacja regulaminu i polityki prywatności" },
        { status: 400 },
      );
    }

    const useCache = body.useCache !== false;
    const parsed = tripWizardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const cached = await tryLoadFromCache(parsed.data, useCache);
    if (cached) {
      const response = NextResponse.json({
        id: cached.id,
        fromCache: true,
      });
      if (cached.guestToken) {
        response.headers.set(
          "Set-Cookie",
          guestPlanCookieHeader(cached.guestToken),
        );
      }
      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                sseLine({
                  type: "progress",
                  stage: "Ładuję gotowy szablon…",
                  percent: 100,
                }),
              ),
            );
            controller.enqueue(
              encoder.encode(
                sseLine({ type: "done", id: cached.id, fromCache: true }),
              ),
            );
            controller.close();
          },
        });
        const headers: HeadersInit = {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
        };
        if (cached.guestToken) {
          headers["Set-Cookie"] = guestPlanCookieHeader(cached.guestToken);
        }
        return new Response(stream, { headers });
      }
      return response;
    }

    const plan = await createPlanRecord(parsed.data);
    planId = plan.id;

    if (!wantsStream) {
      const generated = await generateTripPlanWithProgress(
        parsed.data,
        async (event) => {
          await updateGenerationProgress(plan.id, event.stage, event.percent);
        },
      );
      await saveGeneratedPlan(plan.id, generated);
      try {
        await geocodeTripPlan(plan.id);
      } catch (geoErr) {
        console.error("[plans/generate] geocode:", geoErr);
      }

      const response = NextResponse.json({ id: plan.id });
      if (plan.guestToken) {
        response.headers.set(
          "Set-Cookie",
          guestPlanCookieHeader(plan.guestToken),
        );
      }
      return response;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generated = await generateTripPlanWithProgress(
            parsed.data,
            async (event) => {
              await updateGenerationProgress(
                plan.id,
                event.stage,
                event.percent,
              );
              controller.enqueue(
                encoder.encode(
                  sseLine({
                    type: "progress",
                    stage: event.stage,
                    percent: event.percent,
                    dayFrom: event.dayFrom,
                    dayTo: event.dayTo,
                  }),
                ),
              );
            },
          );

          await saveGeneratedPlan(plan.id, generated);

          controller.enqueue(
            encoder.encode(
              sseLine({ type: "progress", stage: "Mapa i lokalizacje…", percent: 95 }),
            ),
          );

          try {
            await geocodeTripPlan(plan.id);
          } catch (geoErr) {
            console.error("[plans/generate] geocode:", geoErr);
          }

          const donePayload: {
            type: "done";
            id: string;
            setCookie?: string;
          } = { type: "done", id: plan.id };
          if (plan.guestToken) {
            donePayload.setCookie = guestPlanCookieHeader(plan.guestToken);
          }
          controller.enqueue(encoder.encode(sseLine(donePayload)));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Błąd generowania planu";
          if (planId) {
            await markPlanFailed(planId, message).catch(() => undefined);
          }
          controller.enqueue(
            encoder.encode(sseLine({ type: "error", error: message })),
          );
        } finally {
          controller.close();
        }
      },
    });

    const headers: HeadersInit = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    };
    if (plan.guestToken) {
      headers["Set-Cookie"] = guestPlanCookieHeader(plan.guestToken);
    }

    return new Response(stream, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Błąd generowania planu";

    if (process.env.NODE_ENV === "development") {
      console.error("[plans/generate]", error);
    }

    if (planId) {
      await markPlanFailed(planId, message).catch(() => undefined);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
