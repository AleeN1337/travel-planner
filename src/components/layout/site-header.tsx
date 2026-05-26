import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#funkcje", label: "Funkcje" },
  { href: "/plan/new", label: "Nowy plan" },
] as const;

export function SiteHeader() {
  return (
    <header className="fixed top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-2xl px-3 sm:gap-3 sm:px-5">
        <Link
          href="/"
          className="group flex min-w-0 shrink items-center gap-2 font-semibold tracking-tight sm:gap-2.5"
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
            <Compass className="size-4" aria-hidden />
          </span>
          <span className="truncate text-sm sm:text-base">
            <span className="sm:hidden">Planer</span>
            <span className="hidden sm:inline">Planer Podróży</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Główne menu"
        >
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <MobileNav />
          <Link
            href="/plan/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90",
            )}
            aria-label="Zaplanuj podróż"
          >
            <Sparkles className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Zaplanuj</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
