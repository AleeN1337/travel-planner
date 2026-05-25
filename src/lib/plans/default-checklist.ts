export const DEFAULT_CHECKLIST_ITEMS: { label: string; category: string }[] = [
  { label: "Dokument podróży (dowód osobisty / paszport)", category: "Dokumenty" },
  { label: "Ubezpieczenie podróżne", category: "Dokumenty" },
  { label: "Bilety i potwierdzenia rezerwacji", category: "Dokumenty" },
  { label: "Karta płatnicza i gotówka w lokalnej walucie", category: "Finanse" },
  { label: "Aplikacja bankowa / powiadomienie o wyjeździe", category: "Finanse" },
  { label: "Karta SIM / roaming / eSIM", category: "Bagaż" },
  { label: "Ładowarka i adapter do gniazdek", category: "Bagaż" },
  { label: "Apteczka podstawowa", category: "Zdrowie" },
  { label: "Wygodne buty na cały dzień", category: "Bagaż" },
  { label: "Kurtka przeciwdeszczowa / parasol", category: "Bagaż" },
];

export async function ensureDefaultChecklist(planId: string) {
  const { getDb } = await import("@/lib/db");
  const db = getDb();
  const count = await db.checklistItem.count({ where: { tripPlanId: planId } });
  if (count > 0) return;

  await db.checklistItem.createMany({
    data: DEFAULT_CHECKLIST_ITEMS.map((item, i) => ({
      tripPlanId: planId,
      label: item.label,
      category: item.category,
      orderIndex: i,
    })),
  });
}
