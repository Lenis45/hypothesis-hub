import { describe, expect, it } from "vitest";
import { stageDeletionSummary } from "@/lib/funnel";

describe("stageDeletionSummary", () => {
  it("requires an explicit detach warning when hypotheses use the stage", () => {
    expect(stageDeletionSummary(3)).toMatchObject({ hypothesisCount: 3, detachesHypotheses: true });
  });

  it("does not report a detach impact for an empty stage", () => {
    expect(stageDeletionSummary(0)).toMatchObject({ hypothesisCount: 0, detachesHypotheses: false });
  });
});
