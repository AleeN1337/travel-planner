import { CalendarDays } from "lucide-react";
import { getActiveFeaturedEdition } from "@/data/featured-destinations";
import { FeaturedDestinationsCarousel } from "@/components/landing/featured-destinations-carousel";

export function FeaturedDestinationsSection() {
  const edition = getActiveFeaturedEdition();

  if (!edition || edition.destinations.length === 0) {
    return null;
  }

  return (
    <section
      id="polecane"
      className="relative border-y border-white/5 bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            Polecane teraz
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Gdzie warto pojechać
            <span className="text-gradient"> w tym sezonie</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Wybierz inspirację — w kreatorze uzupełnisz dni, styl i budżet, a AI
            złoży plan podróży.
          </p>
        </div>

        <div className="mt-6 inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm">
          <CalendarDays
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>
            <span className="font-medium text-foreground">
              Edycja {edition.title}
            </span>
            <span className="text-muted-foreground"> · {edition.subtitle}</span>
          </span>
        </div>

        <div className="mt-8">
          <FeaturedDestinationsCarousel destinations={edition.destinations} />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Listę odświeżamy co kwartał. {edition.nextUpdateHint}. Zdjęcia:{" "}
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 underline-offset-2 hover:text-foreground"
          >
            Pexels
          </a>
          .
        </p>
      </div>
    </section>
  );
}
