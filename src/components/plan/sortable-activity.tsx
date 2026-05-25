"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityWithCoords } from "@/lib/plans/plan-utils";
import { cn } from "@/lib/utils";

type SortableActivityProps = {
  activity: ActivityWithCoords;
  index: number;
  onDelete: (id: string) => void;
  isSaving: boolean;
};

export function SortableActivity({
  activity,
  index,
  onDelete,
  isSaving,
}: SortableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-white/8 bg-white/[0.03] p-4",
        isDragging && "z-50 opacity-90 shadow-xl ring-2 ring-primary/40",
      )}
    >
      <div className="flex gap-3">
        <button
          type="button"
          className="mt-0.5 flex min-h-11 min-w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground active:cursor-grabbing"
          aria-label="Przeciągnij"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="break-words font-medium">
              <span className="mr-2 font-mono text-xs text-primary">
                {index + 1}.
              </span>
              {activity.title}
            </p>
            <div className="flex items-center gap-1">
              {activity.isLocalTip && (
                <Badge className="gap-1 border-accent/30 bg-accent/15 text-accent">
                  <Sparkles className="size-3" aria-hidden />
                  Tip
                </Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={isSaving}
                onClick={() => onDelete(activity.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Usuń"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          {activity.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {activity.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {activity.locationName && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3 text-primary" aria-hidden />
                {activity.locationName}
              </span>
            )}
            {(activity.costMin ?? activity.costMax) && (
              <span>
                {activity.costMin === activity.costMax ?
                  `${activity.costMin} PLN`
                : `${activity.costMin ?? "?"}–${activity.costMax ?? "?"} PLN`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
