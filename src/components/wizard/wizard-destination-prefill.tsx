"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useWizardStore } from "@/stores/wizard-store";

/** Uzupełnia pole kierunku z ?destination= w URL (np. z karty na stronie głównej). */
export function WizardDestinationPrefill() {
  const searchParams = useSearchParams();
  const applied = useRef(false);
  const updateData = useWizardStore((s) => s.updateData);

  useEffect(() => {
    const dest = searchParams.get("destination")?.trim();
    if (!dest || applied.current) return;
    applied.current = true;
    updateData({ destination: dest });
  }, [searchParams, updateData]);

  return null;
}
