export type GenerateProgressEvent = {
  type: "progress";
  stage: string;
  percent: number;
  dayFrom?: number;
  dayTo?: number;
};

export type GenerateDoneEvent = {
  type: "done";
  id: string;
};

export type GenerateErrorEvent = {
  type: "error";
  error: string;
};

export type GenerateStreamEvent =
  | GenerateProgressEvent
  | GenerateDoneEvent
  | GenerateErrorEvent;

export async function generatePlanWithStream(
  payload: unknown,
  onEvent: (event: GenerateStreamEvent) => void,
  options?: { useCache?: boolean },
): Promise<string> {
  const res = await fetch("/api/plans/generate", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      ...(typeof payload === "object" && payload !== null ? payload : {}),
      useCache: options?.useCache !== false,
      acceptedLegal: true,
    }),
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? "Nie udało się wygenerować planu");
  }

  const reader = res.body?.getReader();
  if (!reader) {
    const json = (await res.json()) as { id: string };
    return json.id;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let planId = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as GenerateStreamEvent;
        onEvent(event);
        if (event.type === "done") {
          planId = event.id;
        }
        if (event.type === "error") {
          throw new Error(event.error);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  if (!planId) {
    throw new Error("Generowanie przerwane — brak identyfikatora planu");
  }

  return planId;
}
