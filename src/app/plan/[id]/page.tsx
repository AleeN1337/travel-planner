import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { PlanAccessDenied } from "@/components/plan/plan-access-denied";
import { PlanView } from "@/components/plan/plan-view";
import {
  getPlanEnrichmentNeeds,
  planNeedsEnrichment,
} from "@/lib/plans/enrich-plan";
import { getCachedTripPlanById } from "@/lib/plans/get-plan-cached";
import {
  getPlanAccess,
  planRecordExists,
} from "@/lib/plans/plan-access";
import { getInviteJoinRedirect } from "@/lib/plans/invite-join";
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
  const access = await getPlanAccess(id);
  if (!access.ok) {
    return { title: "Plan podróży", robots: { index: false, follow: false } };
  }
  const plan = await getCachedTripPlanById(id);
  return {
    title: plan ? `Plan: ${plan.destination}` : "Plan podróży",
    robots: { index: false, follow: false },
  };
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;
  const access = await getPlanAccess(id);

  if (!access.ok) {
    const exists = await planRecordExists(id);
    if (!exists) notFound();
    return (
      <div className="px-4 py-28 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <PlanAccessDenied />
        </div>
      </div>
    );
  }

  const joinRedirect = await getInviteJoinRedirect(id);
  if (joinRedirect) redirect(joinRedirect);

  const plan = await getCachedTripPlanById(id);

  if (!plan) {
    notFound();
  }

  const hasWeatherApi = Boolean(process.env.OPENWEATHER_API_KEY);
  const enrichmentNeeds = getPlanEnrichmentNeeds(plan, hasWeatherApi);
  const runEnrichment = planNeedsEnrichment(enrichmentNeeds);

  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {access.role === "owner" && (
          <Link
            href="/plan/new"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Nowy plan
          </Link>
        )}

        {plan.status === "READY" && plan.days.length > 0 ?
          <PlanView
            plan={plan}
            hasWeatherApi={hasWeatherApi}
            runEnrichment={runEnrichment}
            accessRole={access.role}
          />
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
              {access.role === "owner" && (
                <Link href="/plan/new" className={cn(buttonVariants())}>
                  Wróć do kreatora
                </Link>
              )}
            </CardContent>
          </Card>
        : <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Plan w przygotowaniu
              </CardTitle>
              <CardDescription>
                Odśwież stronę za chwilę
                {access.role === "owner" ? " lub wróć do kreatora." : "."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {access.role === "owner" && (
                <Link
                  href="/plan/new"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-white/15",
                  )}
                >
                  Kreator
                </Link>
              )}
            </CardContent>
          </Card>
        }
      </div>
    </div>
  );
}
