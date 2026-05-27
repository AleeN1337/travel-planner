"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { FeaturedDestination } from "@/data/featured-destinations";
import { DestinationCardImage } from "@/components/landing/destination-card-image";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  destinations: FeaturedDestination[];
};

const CARD_WIDTH = 360;

function DestinationCard({
  place,
  imagePriority,
}: {
  place: FeaturedDestination;
  imagePriority: boolean;
}) {
  return (
    <article className="flex w-[min(92vw,360px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-card shadow-lg shadow-black/20">
      <div className="relative h-44 w-full shrink-0 bg-muted sm:h-48">
        <DestinationCardImage
          src={place.imageUrl}
          alt={place.imageAlt}
          priority={imagePriority}
        />
        <Badge className="absolute right-3 top-3 border-0 bg-background/90 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
          {place.suggestedDays}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-heading text-xl font-bold leading-tight tracking-tight text-foreground">
            {place.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{place.country}</p>
        </div>

        <p className="text-sm font-medium leading-snug text-primary">
          {place.tagline}
        </p>

        <p className="text-sm leading-relaxed text-foreground/85">
          {place.description}
        </p>

        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Dla kogo: </span>
          {place.bestFor}
        </p>

        <Link
          href={`/plan/new?destination=${encodeURIComponent(place.wizardDestination)}`}
          className={cn(
            buttonVariants({ size: "default" }),
            "mt-auto w-full gap-2 bg-primary/90 text-primary-foreground hover:bg-primary",
          )}
        >
          <span className="truncate">Zaplanuj podróż</span>
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function FeaturedDestinationsCarousel({ destinations }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const scrollBy = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * CARD_WIDTH,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState, destinations.length]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {destinations.length} inspiracji · przewiń w poziomie
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label="Poprzednie miejsce"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            aria-label="Następne miejsce"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        role="region"
        aria-roledescription="karuzela"
        aria-label="Polecane miejsca do odwiedzenia"
      >
        {destinations.map((place, index) => (
          <DestinationCard
            key={place.id}
            place={place}
            imagePriority={index < 2}
          />
        ))}
      </div>
    </div>
  );
}
