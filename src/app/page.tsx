import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CloudRain,
  ListChecks,
  Map,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { HeroPreview } from "@/components/landing/hero-preview";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Plan dzień po dniu",
    description: "Rano, popołudnie i wieczór — gotowy harmonogram dopasowany do Twojego tempa.",
    gradient: "from-primary/20 to-primary/5",
    iconClass: "text-primary",
  },
  {
    icon: Map,
    title: "Mapa i trasa",
    description: "Punkty w optymalnej kolejności z czasem dojazdu między atrakcjami.",
    gradient: "from-accent/20 to-accent/5",
    iconClass: "text-accent",
  },
  {
    icon: Wallet,
    title: "Budżet podróży",
    description: "Szacunki kosztów na dzień i całą wyprawę — wariant ekonomiczny lub premium.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    iconClass: "text-emerald-400",
  },
  {
    icon: CloudRain,
    title: "Pogoda i plan B",
    description: "Alternatywy na deszcz, zmęczenie lub zamknięte muzeum — bez stresu.",
    gradient: "from-sky-500/20 to-sky-500/5",
    iconClass: "text-sky-400",
  },
  {
    icon: ListChecks,
    title: "Checklista",
    description: "Wiza, waluta, ubezpieczenie — wszystko przed wyjazdem w jednym miejscu.",
    gradient: "from-violet-500/20 to-violet-500/5",
    iconClass: "text-violet-400",
  },
  {
    icon: Users,
    title: "Współpraca",
    description: "Udostępnij plan znajomym, głosujcie i dzielcie koszty w grupie.",
    gradient: "from-rose-500/20 to-rose-500/5",
    iconClass: "text-rose-400",
  },
] as const;

const steps = [
  { num: "01", title: "Wybierz kierunek", desc: "Miasto, region lub kraj — i liczbę dni." },
  { num: "02", title: "Dopasuj styl", desc: "Budżet, tempo, zainteresowania i transport." },
  { num: "03", title: "Odbierz plan", desc: "Gotowy harmonogram z mapą i kosztami." },
] as const;

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      {/* Hero */}
      <section className="mesh-hero relative min-h-[calc(100vh-2rem)] pt-28 pb-20 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,oklch(0.12_0.025_265)_85%)]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <Badge
              variant="outline"
              className="mb-6 border-primary/30 bg-primary/10 px-3 py-1 text-primary"
            >
              <Sparkles className="mr-1.5 size-3" aria-hidden />
              AI + mapa + budżet w jednym
            </Badge>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Podróż</span>
              <br />
              zaplanowana
              <br />
              <span className="text-foreground">w minuty</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Wybierz kierunek i liczbę dni — otrzymasz spersonalizowany plan z
              trasą, kosztami, checklistą i planem awaryjnym.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/plan/new"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group h-12 gap-2 bg-gradient-to-r from-primary via-primary to-accent px-8 text-base font-semibold shadow-xl shadow-primary/25 hover:opacity-95",
                )}
              >
                Rozpocznij planowanie
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="#funkcje"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 border-white/15 bg-white/5 text-base hover:bg-white/10",
                )}
              >
                Zobacz funkcje
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-8">
              {[
                { value: "30+", label: "dni max. planu" },
                { value: "6", label: "stylów podróży" },
                { value: "1", label: "link do grupy" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div
              className="animate-pulse-glow pointer-events-none absolute left-1/2 top-1/2 size-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <HeroPreview />
            <div className="glass-card animate-float-delayed absolute -bottom-4 -left-2 hidden rounded-2xl px-4 py-3 sm:block lg:-left-8">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-accent" aria-hidden />
                <span className="text-sm font-medium">Generacja ~30 s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-y border-white/5 bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-primary">
            Jak to działa
          </p>
          <h2 className="mt-2 text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Trzy kroki do gotowej podróży
          </h2>
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.num}
                className="glass-card group relative rounded-2xl p-6 transition-transform hover:-translate-y-1"
              >
                <span className="font-heading text-5xl font-extrabold text-white/5 transition-colors group-hover:text-primary/20">
                  {step.num}
                </span>
                <h3 className="mt-2 font-heading text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="funkcje" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Wszystko, czego potrzebujesz
              <span className="text-gradient"> w trasie</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Od pierwszego dnia do powrotu — jeden plan zamiast dziesiątek zakładek.
            </p>
          </div>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="glass-card group rounded-2xl p-6 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div
                  className={cn(
                    "mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br",
                    feature.gradient,
                  )}
                >
                  <feature.icon className={cn("size-5", feature.iconClass)} aria-hidden />
                </div>
                <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-background to-accent/20 px-8 py-16 text-center sm:px-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.7_0.18_195/0.3),transparent_60%)]"
              aria-hidden
            />
            <h2 className="relative font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Gdzie jedziesz następny?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
              Stwórz pierwszy plan w kilka minut — bez rejestracji na start.
            </p>
            <Link
              href="/plan/new"
              className={cn(
                buttonVariants({ size: "lg" }),
                "relative mt-8 gap-2 bg-gradient-to-r from-primary to-accent px-10 text-base font-semibold shadow-lg shadow-primary/30",
              )}
            >
              <Sparkles className="size-4" aria-hidden />
              Zaplanuj podróż teraz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
