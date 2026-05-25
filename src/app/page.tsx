import Link from "next/link";
import {
  Calendar,
  Map,
  Wallet,
  CloudRain,
  Users,
  ListChecks,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Plan dzień po dniu",
    description: "Rano, popołudnie i wieczór — gotowy harmonogram.",
  },
  {
    icon: Map,
    title: "Mapa i trasa",
    description: "Punkty w kolejności z czasem dojazdu.",
  },
  {
    icon: Wallet,
    title: "Budżet",
    description: "Szacunki kosztów i wariant tańszy / droższy.",
  },
  {
    icon: CloudRain,
    title: "Pogoda i plan B",
    description: "Alternatywy na deszcz lub zmęczenie.",
  },
  {
    icon: ListChecks,
    title: "Checklista",
    description: "Wiza, waluta, ubezpieczenie — przed wyjazdem.",
  },
  {
    icon: Users,
    title: "Współpraca",
    description: "Udostępnij plan i głosuj w grupie.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.75_0.12_220/0.25),transparent)]"
        aria-hidden
      />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <Badge variant="secondary" className="mb-4">
          Faza 0 — szkielet gotowy
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Zaplanuj podróż w kilka minut
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Wybierz kierunek, liczbę dni i swój styl. Otrzymasz spersonalizowany
          plan z mapą, budżetem, checklistą i możliwością edycji.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/plan/new"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Rozpocznij planowanie
          </Link>
          <Link
            href="/api/health"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Status API
          </Link>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Co będzie w pełnej wersji
          </h2>
          <p className="mt-2 text-muted-foreground">
            Wszystkie funkcje z roadmapy — budujemy etapami.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full border-border/60 bg-card/80">
                  <CardHeader>
                    <feature.icon
                      className="mb-2 size-5 text-primary"
                      aria-hidden
                    />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
