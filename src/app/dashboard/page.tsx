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
  title: "Moje plany",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Moje plany</CardTitle>
          <CardDescription>
            Lista zapisanych podróży po zalogowaniu — Faza 5 (Auth.js).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Brak zapisanych planów. Wygeneruj pierwszy plan w kreatorze.
          </p>
          <Link href="/plan/new" className={cn(buttonVariants())}>
            Utwórz nowy plan
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
