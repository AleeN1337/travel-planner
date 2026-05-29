export type PlanAccessRole = "owner" | "view" | "edit";

export function canWritePlan(role: PlanAccessRole): boolean {
  return role === "owner" || role === "edit";
}
