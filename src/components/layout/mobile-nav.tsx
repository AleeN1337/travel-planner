"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#polecane", label: "Polecane" },
  { href: "/#funkcje", label: "Funkcje" },
  { href: "/plan/new", label: "Nowy plan" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label="Otwórz menu"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        id="mobile-nav-panel"
        className={cn(
          "fixed top-0 right-0 z-[101] flex h-full w-[min(100vw-3rem,20rem)] flex-col gap-1 border-l border-white/10 bg-background/95 p-4 pt-20 shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
          open ?
            "translate-x-0 pointer-events-auto"
          : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-5 right-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
          aria-label="Zamknij menu"
        >
          <X className="size-5" aria-hidden />
        </button>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-white/5"
          >
            {item.label}
          </Link>
        ))}

        <Link
          href="/plan/new"
          onClick={() => setOpen(false)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-4 gap-2 border-white/15",
          )}
        >
          <Sparkles className="size-4" aria-hidden />
          Zaplanuj podróż
        </Link>
      </nav>
    </div>
  );
}
