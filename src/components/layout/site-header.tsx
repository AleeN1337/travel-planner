import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#funkcje", label: "Funkcje" },
  { href: "/plan/new", label: "Nowy plan" },
  { href: "/dashboard", label: "Moje plany" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 sm:px-5">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Compass className="size-4" aria-hidden />
          </span>
          <span className="hidden sm:inline">Planer Podróży</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/plan/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90",
          )}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Zaplanuj podróż
        </Link>
      </div>
    </header>
  );
}
