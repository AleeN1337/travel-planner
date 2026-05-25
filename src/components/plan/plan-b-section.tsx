import { CloudRain } from "lucide-react";
import type { PlanBAlternative } from "@/generated/prisma/client";

export function PlanBSection({
  alternatives,
}: {
  alternatives: PlanBAlternative[];
}) {
  if (alternatives.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
        <CloudRain className="size-4" aria-hidden />
        Plan B
      </div>
      <ul className="mt-3 space-y-3">
        {alternatives.map((alt) => (
          <li key={alt.id}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {alt.reason}
            </p>
            <p className="mt-0.5 font-medium">{alt.title}</p>
            {alt.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {alt.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
