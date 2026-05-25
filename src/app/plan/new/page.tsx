import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Kreator podróży</CardTitle>
          <CardDescription>
            Formularz wielokrokowy pojawi się w Fazie 1. Na razie możesz
            przejść do podglądu struktury planu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/plan/preview-demo"
            className={cn(buttonVariants())}
          >
            Podgląd demo planu
          </Link>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Wróć na stronę główną
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
