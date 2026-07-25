import { describe, expect, it } from "vitest";
import { workspaceCreateData } from "@/lib/workspace-template";

describe("workspaceCreateData", () => {
  it("creates an isolated project with its own standard RICE scale", () => {
    const data = workspaceCreateData("  Новый продукт  ");

    expect(data.name).toBe("Новый продукт");
    expect(data.priorityPreset.create.reach).toHaveLength(3);
    expect(data.priorityPreset.create.effort.at(-1)).toMatchObject({ value: 60 });
    expect(data).not.toHaveProperty("stages");
    expect(data).not.toHaveProperty("objectives");
  });
});
