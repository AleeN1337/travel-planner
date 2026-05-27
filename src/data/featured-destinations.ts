/**
 * Polecane destynacje na stronie głównej.
 *
 * Aktualizacja: co **kwartał** (4 edycje rocznie) — np. lato maj–sierpień.
 * Wystarczy dodać nową edycję z datami `activeFrom` / `activeUntil` i listą miejsc.
 * Zdjęcia: pliki w `public/featured/` (źródło: Pexels). Przy zmianie podmień JPG + `imageAlt`.
 */

/** Ścieżka do zdjęcia w `public/featured/{slug}.jpg` */
export function featuredImagePath(slug: string): string {
  return `/featured/${slug}.jpg`;
}

export type FeaturedDestination = {
  id: string;
  name: string;
  country: string;
  tagline: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  suggestedDays: string;
  bestFor: string;
  /** Wartość przekazywana do kreatora (?destination=) */
  wizardDestination: string;
};

export type FeaturedEdition = {
  id: string;
  title: string;
  subtitle: string;
  activeFrom: string;
  activeUntil: string;
  nextUpdateHint: string;
  destinations: FeaturedDestination[];
};

const EDITIONS: FeaturedEdition[] = [
  {
    id: "2026-summer",
    title: "Lato 2026",
    subtitle: "City break, wybrzeże i góry",
    activeFrom: "2026-05-01",
    activeUntil: "2026-08-31",
    nextUpdateHint: "Kolejna edycja: jesień 2026 (wrzesień)",
    destinations: [
      {
        id: "lisbon",
        name: "Lizbona",
        country: "Portugalia",
        tagline: "Błękitne kafelki i tramwaje",
        description:
          "Idealna na 4–6 dni: Alfama, Belém, wybrzeże Cascais i wieczorne fado w małych lokalach.",
        imageUrl: featuredImagePath("lisbon"),
        imageAlt: "Widok na Lizbonę o zachodzie słońca",
        suggestedDays: "4–6 dni",
        bestFor: "City break",
        wizardDestination: "Lizbona, Portugalia",
      },
      {
        id: "krakow",
        name: "Kraków",
        country: "Polska",
        tagline: "Historia i kuchnia Małopolski",
        description:
          "Stare Miasto, Kazimierz, Wieliczka lub Zakopane w jednodniowej wycieczce — świetny start bez lotu.",
        imageUrl: featuredImagePath("krakow"),
        imageAlt: "Rynek Główny w Krakowie",
        suggestedDays: "3–5 dni",
        bestFor: "Weekend / rodzina",
        wizardDestination: "Kraków, Polska",
      },
      {
        id: "tokyo",
        name: "Tokio",
        country: "Japonia",
        tagline: "Neony, świątynie i ramen",
        description:
          "Shibuya, Asakusa, dzielnice vintage i jednodniowy wypad do Kamakury lub Hakone.",
        imageUrl: featuredImagePath("tokyo"),
        imageAlt: "Panorama Tokio nocą",
        suggestedDays: "7–10 dni",
        bestFor: "Kultura i jedzenie",
        wizardDestination: "Tokio, Japonia",
      },
      {
        id: "lofoten",
        name: "Lofoty",
        country: "Norwegia",
        tagline: "Fiordy i białe noce",
        description:
          "Reine, wędrówki, kajaki i wędkowanie — najlepiej w czerwcu–sierpniu, z rezerwacją noclegów z wyprzedzeniem.",
        imageUrl: featuredImagePath("lofoten"),
        imageAlt: "Góry i fjord na Lofotach",
        suggestedDays: "5–8 dni",
        bestFor: "Natura i fotografia",
        wizardDestination: "Lofoty, Norwegia",
      },
      {
        id: "marrakech",
        name: "Marrakesz",
        country: "Maroko",
        tagline: "Souki i Atlas w tle",
        description:
          "Medyna, ogrody Majorelle, wieczorne jedzenie na Djemaa el-Fna i opcjonalnie 2 dni w Atlasie.",
        imageUrl: featuredImagePath("marrakech"),
        imageAlt: "Kolorowe ulice Marrakeszu",
        suggestedDays: "4–7 dni",
        bestFor: "Egzotyka blisko Europy",
        wizardDestination: "Marrakesz, Maroko",
      },
      {
        id: "bali",
        name: "Bali",
        country: "Indonezja",
        tagline: "Tarasy ryżowe i plaże",
        description:
          "Ubud, wulkan Batur, surf na południu i świątynie — połącz relaks z lekką przygodą.",
        imageUrl: featuredImagePath("bali"),
        imageAlt: "Tarasy ryżowe na Bali",
        suggestedDays: "8–12 dni",
        bestFor: "Relaks + aktywnie",
        wizardDestination: "Bali, Indonezja",
      },
      {
        id: "porto",
        name: "Porto",
        country: "Portugalia",
        tagline: "Port wine i rzeka Douro",
        description:
          "Ribeira, most Dom Luís, degustacje w Vila Nova de Gaia i rejs po Dourze.",
        imageUrl: featuredImagePath("porto"),
        imageAlt: "Kolorowe domy nad rzeką w Porto",
        suggestedDays: "3–5 dni",
        bestFor: "Para / jedzenie",
        wizardDestination: "Porto, Portugalia",
      },
      {
        id: "edinburgh",
        name: "Edynburg",
        country: "Szkocja",
        tagline: "Zamek, whisky i wyżyny",
        description:
          "Royal Mile, Arthur's Seat, jednodniowo Highlands lub wybrzeże Fife.",
        imageUrl: featuredImagePath("edinburgh"),
        imageAlt: "Edynburg z widokiem na zamek",
        suggestedDays: "4–6 dni",
        bestFor: "Historia i trekking",
        wizardDestination: "Edynburg, Szkocja",
      },
    ],
  },
];

function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Aktywna edycja wg daty serwera (UTC, dzień kalendarzowy). */
export function getActiveFeaturedEdition(
  at: Date = new Date(),
): FeaturedEdition | null {
  const today = Date.UTC(
    at.getUTCFullYear(),
    at.getUTCMonth(),
    at.getUTCDate(),
  );

  for (const edition of EDITIONS) {
    const from = parseDateOnly(edition.activeFrom).getTime();
    const until = parseDateOnly(edition.activeUntil).getTime();
    if (today >= from && today <= until) {
      return edition;
    }
  }

  return null;
}

/** Wszystkie edycje (np. podgląd w adminie / dokumentacja). */
export function getAllFeaturedEditions(): readonly FeaturedEdition[] {
  return EDITIONS;
}
