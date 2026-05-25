import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TripWizard } from "@/components/wizard/trip-wizard";

export const metadata: Metadata = {
  title: "Nowy plan",
};

export default function NewPlanPage() {
  return (
    <div className="mesh-hero min-h-[calc(100vh-4rem)] px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Strona główna
        </Link>
        <TripWizard />
      </div>
    </div>
  );
}
