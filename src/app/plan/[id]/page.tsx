import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { PlanView } from "@/components/plan/plan-view";
import { getTripPlanById } from "@/lib/plans/get-plan";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlanPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  const plan = await getTripPlanById(id);
  return {
    title: plan ? `Plan: ${plan.destination}` : "Plan podróży",
  };
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const plan = await getTripPlanById(id);

  if (!plan) {
    notFound();
  }

  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/plan/new"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Nowy plan
        </Link>

        {plan.status === "READY" && plan.days.length > 0 ?
          <PlanView plan={plan} />
        : plan.status === "FAILED" ?
          <Card className="glass-card border-destructive/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5" aria-hidden />
                <CardTitle className="font-heading text-xl">
                  Generowanie nie powiodło się
                </CardTitle>
              </div>
              <CardDescription>
                {plan.errorMessage ?? "Spróbuj ponownie z kreatora."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/plan/new" className={cn(buttonVariants())}>
                Wróć do kreatora
              </Link>
            </CardContent>
          </Card>
        : <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Plan w przygotowaniu
              </CardTitle>
              <CardDescription>
                Odśwież stronę za chwilę lub wróć do kreatora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/plan/new"
                className={cn(buttonVariants({ variant: "outline" }), "border-white/15")}
              >
                Kreator
              </Link>
            </CardContent>
          </Card>
        }
      </div>
    </div>
  );
}
