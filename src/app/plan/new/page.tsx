import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nowy plan",
};

export default function NewPlanPage() {
  return (
    <div className="mesh-hero min-h-[70vh] px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Strona główna
        </Link>

        <Card className="glass-card border-white/10 bg-transparent shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="size-6 text-primary-foreground" aria-hidden />
            </div>
            <CardTitle className="font-heading text-2xl">Kreator podróży</CardTitle>
            <CardDescription className="text-base">
              Formularz wielokrokowy pojawi się wkrótce. Na razie możesz zobaczyć
              podgląd struktury planu.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/plan/preview-demo"
              className={cn(
                buttonVariants(),
                "bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20",
              )}
            >
              Podgląd demo planu
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
            >
              Wróć
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
