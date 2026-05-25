import type { TransportMode } from "@/generated/prisma/client";

export const MAPBOX_STYLE = "mapbox://styles/mapbox/navigation-night-v1";

export function getMapboxToken(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ??
    process.env.MAPBOX_ACCESS_TOKEN
  );
}

export function directionsProfile(transport: TransportMode): string {
  switch (transport) {
    case "CAR":
      return "driving";
    case "PUBLIC_TRANSIT":
      return "driving-traffic";
    default:
      return "walking";
  }
}

export type LngLat = { lng: number; lat: number };

export async function fetchMapboxRoute(
  points: LngLat[],
  transport: TransportMode,
  token: string,
): Promise<GeoJSON.LineString | null> {
  if (points.length < 2) return null;

  const profile = directionsProfile(transport);
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}` +
    `?geometries=geojson&overview=full&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    routes?: { geometry: GeoJSON.LineString }[];
  };

  return data.routes?.[0]?.geometry ?? null;
}
