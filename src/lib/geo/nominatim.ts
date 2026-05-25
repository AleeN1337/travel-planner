const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "TravelPlanner/1.0";

export type GeoPoint = { lat: number; lng: number };

export async function geocodeLocation(
  query: string,
  context?: string,
): Promise<GeoPoint | null> {
  const q = context ? `${query}, ${context}` : query;
  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "1",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data[0]) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

/** Nominatim: max 1 req/s — krótka pauza między zapytaniami */
export function geocodeDelay(ms = 1100): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
