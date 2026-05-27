import Link from "next/link";
import { Compass } from "lucide-react";
import { LEGAL_PATHS } from "@/lib/legal/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-background/50 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Compass className="size-4 text-primary" aria-hidden />
          <span>© {new Date().getFullYear()} Planer Podróży</span>
        </div>
        <nav
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:gap-x-6"
          aria-label="Stopka — nawigacja"
        >
          <Link href="/#funkcje" className="transition-colors hover:text-foreground">
            Funkcje
          </Link>
          <Link href="/plan/new" className="transition-colors hover:text-foreground">
            Nowy plan
          </Link>
          <Link
            href={LEGAL_PATHS.privacy}
            className="transition-colors hover:text-foreground"
          >
            Prywatność
          </Link>
          <Link
            href={LEGAL_PATHS.terms}
            className="transition-colors hover:text-foreground"
          >
            Regulamin
          </Link>
          <Link
            href={LEGAL_PATHS.cookies}
            className="transition-colors hover:text-foreground"
          >
            Cookies
          </Link>
          <Link
            href={LEGAL_PATHS.contact}
            className="transition-colors hover:text-foreground"
          >
            Kontakt
          </Link>
        </nav>
        <p className="text-center text-xs text-muted-foreground/80 sm:text-right">
          Plan · mapa · budżet · checklista
        </p>
      </div>
    </footer>
  );
}
