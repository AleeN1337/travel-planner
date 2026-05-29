import { NextResponse } from "next/server";
import { generateTripPlanWithProgress } from "@/lib/ai/generate-plan-chunked";
import {
  appendOwnerSessionCookies,
  setupOwnerSession,
} from "@/lib/plans/apply-owner-cookies";
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
      const session = await setupOwnerSession(
        cached.id,
        parsed.data.organizerName,
        cached.guestToken,
      );
      const response = NextResponse.json({
        id: cached.id,
        fromCache: true,
      });
      appendOwnerSessionCookies(
        response.headers,
        cached.id,
        session.guestToken,
        session.participantToken,
      );
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
        const headers = new Headers({
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
        });
        appendOwnerSessionCookies(
          headers,
          cached.id,
          session.guestToken,
          session.participantToken,
        );
        return new Response(stream, { headers });
      }
      return response;
    }

    const plan = await createPlanRecord(parsed.data);
    planId = plan.id;
    const session = await setupOwnerSession(
      plan.id,
      parsed.data.organizerName,
      plan.guestToken,
    );

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
      appendOwnerSessionCookies(
        response.headers,
        plan.id,
        session.guestToken,
        session.participantToken,
      );
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

          controller.enqueue(
            encoder.encode(sseLine({ type: "done", id: plan.id })),
          );
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

    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    appendOwnerSessionCookies(
      headers,
      plan.id,
      session.guestToken,
      session.participantToken,
    );

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
