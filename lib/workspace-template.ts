import { DEFAULT_SCALES } from "@/lib/rice";

export const ACTIVE_WORKSPACE_COOKIE = "hypothesis-hub-active-workspace";

/** A new project starts with its own RICE scales, but no guessed goals or funnel. */
export function workspaceCreateData(name: string) {
  return {
    name: name.trim(),
    priorityPreset: {
      create: {
        reach: DEFAULT_SCALES.reach,
        impact: DEFAULT_SCALES.impact,
        confidence: DEFAULT_SCALES.confidence,
        effort: DEFAULT_SCALES.effort
      }
    }
  };
}
