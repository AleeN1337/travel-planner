import Link from "next/link";
import { Download, Share2 } from "lucide-react";
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
      <Link
        href={`/plan/${planId}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5 border-white/15",
        )}
      >
        <Share2 className="size-3.5" aria-hidden />
        Link do planu
      </Link>
    </div>
  );
}
