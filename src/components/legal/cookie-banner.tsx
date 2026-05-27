"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEGAL_PATHS } from "@/lib/legal/site";
import {
  hasCookieConsent,
  saveCookieConsent,
} from "@/lib/legal/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasCookieConsent());
  }, []);

  if (!visible) return null;

  function accept(choice: "essential" | "all") {
    saveCookieConsent(choice);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-background/95 p-4 shadow-2xl backdrop-blur-md sm:p-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p
            id="cookie-banner-title"
            className="flex items-center gap-2 font-heading text-base font-semibold"
          >
            <Cookie className="size-4 text-primary" aria-hidden />
            Pliki cookie i pamięć lokalna
          </p>
          <p
            id="cookie-banner-desc"
            className="mt-2 text-sm text-muted-foreground"
          >
            Używamy niezbędnych plików cookie (np. zapis planu gościa) oraz
            pamięci lokalnej przeglądarki (postęp kreatora). Szczegóły w{" "}
            <Link
              href={LEGAL_PATHS.cookies}
              className="text-primary underline-offset-2 hover:underline"
            >
              polityce cookies
            </Link>{" "}
            i{" "}
            <Link
              href={LEGAL_PATHS.privacy}
              className="text-primary underline-offset-2 hover:underline"
            >
              polityce prywatności
            </Link>
            . Obecnie nie stosujemy cookies analitycznych ani reklamowych.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/15"
            onClick={() => accept("essential")}
          >
            Tylko niezbędne
          </Button>
          <Button type="button" size="sm" onClick={() => accept("all")}>
            Akceptuję
          </Button>
        </div>
      </div>
    </div>
  );
}
