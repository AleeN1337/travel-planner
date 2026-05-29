"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollaborationBundle } from "@/lib/plans/collaboration/types";

export function collaborationQueryKey(planId: string) {
  return ["plan-collaboration", planId] as const;
}

async function fetchCollaboration(planId: string): Promise<CollaborationBundle> {
  const res = await fetch(`/api/plans/${planId}/collaboration`, {
    credentials: "include",
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: string };
    throw new Error(json.error ?? "Nie udało się załadować danych grupy");
  }
  return res.json() as Promise<CollaborationBundle>;
}

export function usePlanCollaboration(planId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: collaborationQueryKey(planId),
    queryFn: () => fetchCollaboration(planId),
    enabled,
    staleTime: 8_000,
    refetchInterval: 12_000,
  });

  function invalidate() {
    void queryClient.invalidateQueries({
      queryKey: collaborationQueryKey(planId),
    });
  }

  return { ...query, invalidate };
}
