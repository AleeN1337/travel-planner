import { addDays, startOfDay } from "date-fns";
import { geocodeLocation } from "@/lib/geo/nominatim";
import { getDb } from "@/lib/db";

type ForecastItem = {
  dt: number;
  main: { temp_min: number; temp_max: number };
  weather: { main: string; description: string }[];
};

const CONDITION_PL: Record<string, string> = {
  Clear: "Słonecznie",
  Clouds: "Pochmurno",
  Rain: "Deszcz",
  Drizzle: "Mżawka",
  Thunderstorm: "Burza",
  Snow: "Śnieg",
  Mist: "Mgła",
  Fog: "Mgła",
};

function suggestForCondition(main: string): string {
  switch (main) {
    case "Rain":
    case "Drizzle":
    case "Thunderstorm":
      return "Weź plan B na ten dzień — deszcz. Parki zamien na muzea lub kawiarnie.";
    case "Snow":
      return "Ubierz się ciepło; sprawdź komunikację miejską.";
    case "Clear":
      return "Idealny dzień na zwiedzanie i spacery — zapas wody i krem z filtrem.";
    default:
      return "Sprawdź plan dnia rano i miej alternatywę pod ręką.";
  }
}

function tripDates(startDate: Date | null, daysCount: number): Date[] {
  const start = startOfDay(startDate ?? new Date());
  return Array.from({ length: daysCount }, (_, i) => addDays(start, i));
}

export async function syncWeatherForPlan(planId: string): Promise<boolean> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return false;

  const db = getDb();
  const plan = await db.tripPlan.findUnique({
    where: { id: planId },
    include: {
      days: {
        include: { activities: true },
      },
      weatherSnapshots: true,
    },
  });

  if (!plan) return false;

  const fresh =
    plan.weatherSnapshots.length > 0 &&
    plan.weatherSnapshots[0].fetchedAt.getTime() > Date.now() - 6 * 60 * 60 * 1000;
  if (fresh) return true;

  const withCoords = plan.days
    .flatMap((d) => d.activities)
    .find((a) => a.latitude != null && a.longitude != null);

  let lat: number;
  let lng: number;

  if (withCoords?.latitude != null && withCoords.longitude != null) {
    lat = withCoords.latitude;
    lng = withCoords.longitude;
  } else {
    const point = await geocodeLocation(plan.destination);
    if (!point) return false;
    lat = point.lat;
    lng = point.lng;
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pl`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return false;

  const data = (await res.json()) as { list: ForecastItem[] };
  const dates = tripDates(plan.startDate, plan.daysCount);

  await db.weatherSnapshot.deleteMany({ where: { tripPlanId: planId } });

  for (const date of dates.slice(0, 5)) {
    const dayStart = startOfDay(date).getTime() / 1000;
    const dayEnd = dayStart + 86400;
    const slots = data.list.filter(
      (item) => item.dt >= dayStart && item.dt < dayEnd,
    );
    if (slots.length === 0) continue;

    const temps = slots.flatMap((s) => [s.main.temp_min, s.main.temp_max]);
    const main = slots[Math.floor(slots.length / 2)].weather[0]?.main ?? "Clouds";
    const description =
      slots[Math.floor(slots.length / 2)].weather[0]?.description ?? "";

    await db.weatherSnapshot.create({
      data: {
        tripPlanId: planId,
        date,
        tempMin: Math.min(...temps),
        tempMax: Math.max(...temps),
        condition: CONDITION_PL[main] ?? description,
        suggestion: suggestForCondition(main),
      },
    });
  }

  return true;
}
