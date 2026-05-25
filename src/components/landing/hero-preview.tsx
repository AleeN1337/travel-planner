import { Calendar, MapPin, Sun, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dayPlan = [
  { time: "09:00", title: "Colosseum & Forum Romanum", tag: "Kultura" },
  { time: "13:30", title: "Trastevere — lunch u lokalnych", tag: "Jedzenie" },
  { time: "18:00", title: "Piazzale Michelangelo — zachód", tag: "Widoki" },
] as const;

export function HeroPreview() {
  return (
    <div className="glass-card glow-ring animate-float relative w-full max-w-md overflow-hidden rounded-3xl p-5 lg:max-w-lg">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-accent/20 blur-2xl" aria-hidden />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Twój plan · 5 dni
          </p>
          <h3 className="mt-1 font-heading text-2xl font-bold tracking-tight">
            Rzym, Włochy
          </h3>
        </div>
        <Badge className="border-primary/30 bg-primary/15 text-primary">
          <Sun className="mr-1 size-3" aria-hidden />
          24°C
        </Badge>
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
        {[
          { icon: Calendar, label: "5 dni" },
          { icon: MapPin, label: "12 miejsc" },
          { icon: Wallet, label: "~2 400 zł" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/5 px-2 py-2.5 text-center"
          >
            <stat.icon className="mx-auto size-3.5 text-muted-foreground" aria-hidden />
            <p className="mt-1 text-xs font-medium text-muted-foreground min-[360px]:text-[10px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <ul className="relative mt-5 space-y-2.5">
        {dayPlan.map((item, i) => (
          <li
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="shrink-0 font-mono text-xs text-primary">{item.time}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
            </div>
            <span className="shrink-0 rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              {item.tag}
            </span>
          </li>
        ))}
      </ul>

      <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 px-3 py-2">
        <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Trasa zoptymalizowana · 4,2 km pieszo dziś
        </p>
      </div>
    </div>
  );
}
