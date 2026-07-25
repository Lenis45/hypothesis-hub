import { WorkspaceSettings } from "@/components/workspace-settings";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SCALES } from "@/lib/rice";
import { getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const membership = await requireRole("VIEWER");
  const data = await getWorkspaceData();
  const projects = await prisma.workspace.findMany({ where: { memberships: { some: { userId: membership.userId } } }, select: { id: true, name: true }, orderBy: { createdAt: "asc" } });
  const preset = data.priorityPreset;
  const scales = {
    reach: (preset?.reach ?? DEFAULT_SCALES.reach) as unknown as { label: string; value: number }[],
    impact: (preset?.impact ?? DEFAULT_SCALES.impact) as unknown as { label: string; value: number }[],
    confidence: (preset?.confidence ?? DEFAULT_SCALES.confidence) as unknown as { label: string; value: number }[],
    effort: (preset?.effort ?? DEFAULT_SCALES.effort) as unknown as { label: string; value: number }[],
    version: preset?.version ?? 1
  };
  return <WorkspaceSettings activeWorkspace={{ id: data.id, name: data.name }} projects={projects} objectives={data.objectives.map((objective) => ({ ...objective, periodStart: objective.periodStart?.toISOString() ?? null, periodEnd: objective.periodEnd?.toISOString() ?? null }))} stages={data.stages} scales={scales}/>;
}
