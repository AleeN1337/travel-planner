import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { TripPlanWithDays } from "@/lib/plans/get-plan";
import {
  BUDGET_LABELS,
  PACE_LABELS,
  STYLE_LABELS,
  TRANSPORT_LABELS,
} from "@/types/trip";
import { TIME_OF_DAY_LABELS } from "@/lib/labels";
import { sortActivities } from "@/lib/plans/plan-utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 22, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 11, color: "#444", marginBottom: 16 },
  section: { marginTop: 14, marginBottom: 6, fontSize: 13, fontFamily: "Helvetica-Bold" },
  dayTitle: { fontSize: 12, marginTop: 10, fontFamily: "Helvetica-Bold" },
  activity: { marginLeft: 8, marginTop: 4 },
  muted: { color: "#666", fontSize: 9 },
  checklistItem: { marginLeft: 8, marginTop: 3 },
});

export function TripPlanDocument({ plan }: { plan: TripPlanWithDays }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{plan.destination}</Text>
        <Text style={styles.subtitle}>
          {plan.daysCount} dni · {BUDGET_LABELS[plan.budgetLevel]} ·{" "}
          {STYLE_LABELS[plan.travelStyle]} · {PACE_LABELS[plan.paceLevel]} ·{" "}
          {TRANSPORT_LABELS[plan.transportMode]}
          {plan.totalBudgetMax != null &&
            ` · ~${Math.round(plan.totalBudgetMin ?? plan.totalBudgetMax)}–${Math.round(plan.totalBudgetMax)} PLN`}
        </Text>

        {plan.checklistItems.length > 0 && (
          <>
            <Text style={styles.section}>Checklista przed wyjazdem</Text>
            {plan.checklistItems.map((item) => (
              <Text key={item.id} style={styles.checklistItem}>
                {item.isChecked ? "☑" : "☐"} {item.label}
                {item.category ? ` (${item.category})` : ""}
              </Text>
            ))}
          </>
        )}

        {plan.weatherSnapshots.length > 0 && (
          <>
            <Text style={styles.section}>Pogoda</Text>
            {plan.weatherSnapshots.map((w) => (
              <Text key={w.id} style={styles.checklistItem}>
                {new Date(w.date).toLocaleDateString("pl-PL")}: {w.condition}{" "}
                {w.tempMin != null && w.tempMax != null &&
                  `${Math.round(w.tempMin)}–${Math.round(w.tempMax)}°C`}
              </Text>
            ))}
          </>
        )}

        <Text style={styles.section}>Plan dzień po dniu</Text>
        {plan.days.map((day) => (
          <View key={day.id} wrap={false}>
            <Text style={styles.dayTitle}>
              Dzień {day.dayNumber}: {day.title}
            </Text>
            {day.summary && (
              <Text style={styles.muted}>{day.summary}</Text>
            )}
            {sortActivities(day.activities).map((a) => (
              <View key={a.id} style={styles.activity}>
                <Text>
                  {TIME_OF_DAY_LABELS[a.timeOfDay]} — {a.title}
                </Text>
                <Text style={styles.muted}>{a.description}</Text>
              </View>
            ))}
            {day.planBAlternatives.map((b) => (
              <Text key={b.id} style={styles.muted}>
                Plan B ({b.reason}): {b.title}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
