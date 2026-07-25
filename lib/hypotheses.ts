import { calculateRice } from "@/lib/rice";

export const STATUSES = ["IDEA", "READY_FOR_PRIORITIZATION", "PRIORITIZED", "PLANNED", "IN_PROGRESS", "VALIDATED", "REJECTED", "ARCHIVED"] as const;
export type Status = (typeof STATUSES)[number];

export function normalizeTitle(title: string) {
  return title.trim().toLocaleLowerCase("ru").replace(/\s+/g, " ");
}

export function validateStatusTransition(from: Status, to: Status) {
  if (from === "ARCHIVED") return to === "ARCHIVED";
  if (to === "IN_PROGRESS" && from !== "PLANNED") return false;
  if (to === "VALIDATED" && from !== "IN_PROGRESS") return false;
  return true;
}

export function enrichRice<T extends { reachValue?: number | null; impactValue?: number | null; confidenceValue?: number | null; effortValue?: number | null }>(item: T) {
  return { ...item, score: calculateRice(item.reachValue, item.impactValue, item.confidenceValue, item.effortValue) };
}
