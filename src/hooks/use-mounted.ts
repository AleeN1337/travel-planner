"use client";

import { useEffect, useState } from "react";

/** true dopiero po hydratacji — bezpieczne dla useQuery w Client Components z SSR */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
