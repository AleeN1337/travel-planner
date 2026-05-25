import "dotenv/config";
import { getDb } from "../src/lib/db.ts";

const db = getDb();
const plan = await db.tripPlan.findFirst({
  orderBy: { createdAt: "desc" },
  include: {
    days: {
      orderBy: { dayNumber: "asc" },
      include: {
        activities: {
          orderBy: [{ timeOfDay: "asc" }, { orderIndex: "asc" }],
        },
      },
    },
  },
});

if (!plan) {
  console.log("Brak planów w bazie.");
  process.exit(0);
}

const activityCount = plan.days.reduce((n, d) => n + d.activities.length, 0);
const issues: string[] = [];

if (plan.status !== "READY") issues.push(`status: ${plan.status}`);
if (plan.days.length !== plan.daysCount) {
  issues.push(`dni w DB (${plan.days.length}) != daysCount (${plan.daysCount})`);
}
for (const day of plan.days) {
  if (day.dayNumber < 1 || day.dayNumber > plan.daysCount) {
    issues.push(`nieprawidłowy dayNumber: ${day.dayNumber}`);
  }
  if (!day.title?.trim()) issues.push(`dzień ${day.dayNumber}: brak tytułu`);
  if (day.activities.length === 0) {
    issues.push(`dzień ${day.dayNumber}: brak aktywności`);
  }
  for (const a of day.activities) {
    if (!a.title?.trim()) issues.push(`dzień ${day.dayNumber}: aktywność bez tytułu`);
    if (!a.description?.trim()) issues.push(`dzień ${day.dayNumber}: "${a.title}" bez opisu`);
  }
}

console.log("=== Ostatni plan ===");
console.log({
  id: plan.id,
  status: plan.status,
  destination: plan.destination,
  daysCount: plan.daysCount,
  budgetLevel: plan.budgetLevel,
  travelStyle: plan.travelStyle,
  paceLevel: plan.paceLevel,
  transportMode: plan.transportMode,
  countryCode: plan.countryCode,
  totalBudgetMin: plan.totalBudgetMin,
  totalBudgetMax: plan.totalBudgetMax,
  daysInDb: plan.days.length,
  activities: activityCount,
  localTips: plan.days.flatMap((d) => d.activities).filter((a) => a.isLocalTip).length,
});

console.log("\n=== Dni ===");
for (const day of plan.days) {
  const byTime = { MORNING: 0, AFTERNOON: 0, EVENING: 0 };
  for (const a of day.activities) byTime[a.timeOfDay]++;
  console.log(
    `D${day.dayNumber}: ${day.title} | aktywności: ${day.activities.length} (R:${byTime.MORNING} P:${byTime.AFTERNOON} W:${byTime.EVENING})`,
  );
}

if (issues.length === 0) {
  console.log("\n✓ Walidacja OK — brak problemów strukturalnych.");
} else {
  console.log("\n⚠ Problemy:");
  issues.forEach((i) => console.log(" -", i));
}

await db.$disconnect();
