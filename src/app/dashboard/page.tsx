import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Calendar, MapPin, Plus, Wallet } from "lucide-react";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { claimGuestPlansForUser } from "@/lib/plans/claim-guest-plans";
import { listUserTripPlans } from "@/lib/plans/list-user-plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Moje plany",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  await claimGuestPlansForUser(session.user.id);
  const plans = await listUserTripPlans(session.user.id);

  return (
    <div className="px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Twoje konto
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Moje plany
            </h1>
            <p className="mt-1 text-muted-foreground">
              Witaj, {session.user.name ?? session.user.email}
            </p>
          </div>
          <Link
            href="/plan/new"
            className={cn(
              buttonVariants(),
              "gap-2 bg-gradient-to-r from-primary to-accent",
            )}
          >
            <Plus className="size-4" aria-hidden />
            Nowy plan
          </Link>
        </div>

        {plans.length === 0 ?
          <div className="glass-card rounded-2xl border-white/10 p-12 text-center">
            <MapPin className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <p className="mt-4 font-medium">Brak zapisanych planów</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Wygeneruj pierwszą podróż — po zalogowaniu trafi tutaj automatycznie.
            </p>
            <Link
              href="/plan/new"
              className={cn(buttonVariants({ className: "mt-6" }))}
            >
              Zaplanuj podróż
            </Link>
          </div>
        : <ul className="space-y-3">
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/plan/${plan.id}`}
                  className="glass-card block rounded-2xl border-white/10 p-5 transition-colors hover:border-primary/30 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-heading break-words text-xl font-semibold">
                        {plan.destination}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Utworzono{" "}
                        {format(plan.createdAt, "d MMM yyyy", { locale: pl })}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {plan.daysCount} dni
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden />
                      {plan.startDate ?
                        format(plan.startDate, "d MMM yyyy", { locale: pl })
                      : "Elastyczny termin"}
                    </span>
                    {plan.totalBudgetMax != null && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="size-3.5" aria-hidden />
                        {plan.totalBudgetMin != null &&
                        plan.totalBudgetMin !== plan.totalBudgetMax ?
                          `${Math.round(plan.totalBudgetMin)}–${Math.round(plan.totalBudgetMax)} PLN`
                        : `~${Math.round(plan.totalBudgetMax)} PLN`}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}
