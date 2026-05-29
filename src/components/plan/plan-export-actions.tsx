import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlanExportActions({ planId }: { planId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/plans/${planId}/pdf`}
        download
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5 border-white/15",
        )}
      >
        <Download className="size-3.5" aria-hidden />
        Pobierz PDF
      </a>
    </div>
  );
}
