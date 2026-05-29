"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddActivityForm } from "@/components/plan/add-activity-form";
import { RegenerateDayButton } from "@/components/plan/regenerate-day-button";
import { DayRouteBadge } from "@/components/plan/day-route-badge";
import type { DayRouteInsight } from "@/lib/plans/day-route-analysis";
import { PlanBVotingSection } from "@/components/plan/plan-b-voting-section";
import type {
  ActivityCommentDto,
  PlanBVoteSummaryDto,
} from "@/lib/plans/collaboration/types";
import { SortableActivity } from "@/components/plan/sortable-activity";
import type { ActivityWithCoords } from "@/lib/plans/plan-utils";
import type { PlanBAlternative, TimeOfDay } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type EditableDayColumnProps = {
  planId: string;
  dayId: string;
  dayNumber: number;
  title: string | null;
  summary: string | null;
  activityIds: string[];
  activityMap: Record<string, ActivityWithCoords>;
  planBAlternatives: PlanBAlternative[];
  onDelete: (id: string) => void;
  onAdd: (data: {
    planDayId: string;
    title: string;
    description?: string;
    locationName?: string;
    timeOfDay: TimeOfDay;
  }) => Promise<void>;
  onRegenerated: () => void;
  routeInsight?: DayRouteInsight;
  isSaving: boolean;
  commentsByActivityId?: Record<string, ActivityCommentDto[]>;
  planBVotes?: PlanBVoteSummaryDto[];
  hasMember?: boolean;
  onCollaborationChange?: () => void;
};

export function EditableDayColumn({
  planId,
  dayId,
  dayNumber,
  title,
  summary,
  activityIds,
  activityMap,
  planBAlternatives,
  onDelete,
  onAdd,
  onRegenerated,
  routeInsight,
  isSaving,
  commentsByActivityId,
  planBVotes,
  hasMember,
  onCollaborationChange,
}: EditableDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dayId });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "glass-card overflow-hidden border-white/10 transition-colors",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <CardHeader className="border-b border-white/5 bg-white/[0.02]">
        <Badge variant="outline" className="mb-2 w-fit border-primary/30 text-primary">
          Dzień {dayNumber}
        </Badge>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        {summary && (
          <CardDescription className="text-base">{summary}</CardDescription>
        )}
        <RegenerateDayButton
          planId={planId}
          dayNumber={dayNumber}
          onDone={onRegenerated}
          disabled={isSaving}
        />
        {routeInsight && (
          <DayRouteBadge
            planId={planId}
            insight={routeInsight}
            onOptimized={onRegenerated}
            disabled={isSaving}
          />
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <SortableContext
          items={activityIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[48px]">
            {activityIds.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Upuść tutaj aktywność lub dodaj punkt
              </p>
            )}
            {activityIds.map((id, index) => {
              const activity = activityMap[id];
              if (!activity) return null;
              return (
                <SortableActivity
                  key={id}
                  activity={activity}
                  index={index}
                  onDelete={onDelete}
                  isSaving={isSaving}
                  planId={planId}
                  comments={commentsByActivityId?.[id]}
                  hasMember={hasMember}
                  onCollaborationChange={onCollaborationChange}
                />
              );
            })}
          </div>
        </SortableContext>
        <AddActivityForm
          planId={planId}
          planDayId={dayId}
          onAdd={onAdd}
          disabled={isSaving}
        />
        {onCollaborationChange ?
          <PlanBVotingSection
            planId={planId}
            alternatives={planBAlternatives}
            voteSummaries={planBVotes ?? []}
            hasMember={Boolean(hasMember)}
            onChanged={onCollaborationChange}
          />
        : null}
      </CardContent>
    </Card>
  );
}
