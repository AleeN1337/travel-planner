import Link from "next/link";
import { Calendar, MapPin, Wallet } from "lucide-react";
import { PlanDayCard } from "@/components/plan/plan-day-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
} from "@/types/trip";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import { cn } from "@/lib/utils";

export function PlanView({ plan }: { plan: TripPlanWithDays }) {
  const budgetLabel = BUDGET_LABELS[plan.budgetLevel];
  const styleLabel = STYLE_LABELS[plan.travelStyle];
  const paceLabel = PACE_LABELS[plan.paceLevel];
  const transportLabel = TRANSPORT_LABELS[plan.transportMode];

  return (
    <div className="space-y-8">
      <header className="glass-card rounded-3xl border-white/10 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Twój plan podróży
            </p>
            <h1 className="font-heading mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {plan.destination}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/15">
                {budgetLabel}
              </Badge>
              <Badge variant="outline" className="border-white/15">
                {styleLabel}
              </Badge>
              <Badge variant="outline" className="border-white/15">
                {paceLabel}
              </Badge>
              <Badge variant="outline" className="border-white/15">
                {transportLabel}
              </Badge>
            </div>
          </div>
          <Link
            href="/plan/new"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-white/15")}
          >
            Nowy plan
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          <Stat icon={Calendar} label={`${plan.daysCount} dni`} />
          <Stat
            icon={MapPin}
            label={`${plan.days.reduce((n, d) => n + d.activities.length, 0)} miejsc`}
          />
          {plan.totalBudgetMax != null && (
            <Stat
              icon={Wallet}
              label={
                plan.totalBudgetMin != null && plan.totalBudgetMin !== plan.totalBudgetMax ?
                  `${Math.round(plan.totalBudgetMin)}–${Math.round(plan.totalBudgetMax)} PLN`
                : `~${Math.round(plan.totalBudgetMax)} PLN`
              }
            />
          )}
        </div>
      </header>

      <div className="space-y-6">
        {plan.days.map((day) => (
          <PlanDayCard key={day.id} day={day} />
        ))}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-3 text-center">
      <Icon className="mx-auto size-4 text-primary" aria-hidden />
      <p className="mt-1 text-xs font-medium">{label}</p>
    </div>
  );
}
