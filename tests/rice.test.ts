import { describe, expect, it } from "vitest";
import { calculateRice, riceExplanation } from "@/lib/rice";
import { normalizeTitle, validateStatusTransition } from "@/lib/hypotheses";
import { hasRole } from "@/lib/roles";

describe("RICE", () => {
  it("calculates score from four weighted criteria", () => expect(calculateRice(10, 20, 0.8, 5)).toBe(32));
  it("returns null for incomplete or invalid effort", () => { expect(calculateRice(10, 20, null, 5)).toBeNull(); expect(calculateRice(10, 20, 0.8, 0)).toBeNull(); });
  it("explains the result without presenting it as proof", () => expect(riceExplanation(3)).toContain("не доказательство"));
});

describe("hypothesis workflow", () => {
  it("normalizes duplicate titles", () => expect(normalizeTitle("  Новая   идея ")).toBe("новая идея"));
  it("allows validation only after experiment is in progress", () => { expect(validateStatusTransition("PLANNED", "IN_PROGRESS")).toBe(true); expect(validateStatusTransition("IDEA", "IN_PROGRESS")).toBe(false); });
  it("does not allow a viewer to edit", () => { expect(hasRole("VIEWER", "EDITOR")).toBe(false); expect(hasRole("ADMIN", "EDITOR")).toBe(true); });
});
