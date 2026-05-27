"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  planId: string;
  runEnrichment: boolean;
};

/**
 * Po wyświetleniu planu uzupełnia mapę/pogodę/checklistę w tle i odświeża widok.
 */
export function PlanEnrichmentTrigger({ planId, runEnrichment }: Props) {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (!runEnrichment || started.current) return;
    started.current = true;

    const toastId = toast.loading("Uzupełniam mapę, checklistę i pogodę…", {
      duration: Infinity,
    });

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/enrich`, {
          method: "POST",
        });
        if (cancelled) return;

        if (!res.ok) {
          toast.dismiss(toastId);
          return;
        }

        router.refresh();
        toast.success("Plan zaktualizowany (mapa i pogoda)", { id: toastId });
      } catch {
        if (!cancelled) toast.dismiss(toastId);
      }
    })();

    return () => {
      cancelled = true;
      toast.dismiss(toastId);
    };
  }, [planId, runEnrichment, router]);

  return null;
}
