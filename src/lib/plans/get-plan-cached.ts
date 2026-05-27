import { cache } from "react";
import { getTripPlanById } from "@/lib/plans/get-plan";

/** Jedno zapytanie na request (strona + metadata). */
export const getCachedTripPlanById = cache(getTripPlanById);
