import { HypothesisWizard } from "@/components/hypothesis-wizard";
import { DEFAULT_SCALES } from "@/lib/rice";
import { getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export default async function NewHypothesisPage() { const data = await getWorkspaceData(); const preset = data.priorityPreset; const scales = { reach: (preset?.reach ?? DEFAULT_SCALES.reach) as unknown as { label: string; value: number }[], impact: (preset?.impact ?? DEFAULT_SCALES.impact) as unknown as { label: string; value: number }[], confidence: (preset?.confidence ?? DEFAULT_SCALES.confidence) as unknown as { label: string; value: number }[], effort: (preset?.effort ?? DEFAULT_SCALES.effort) as unknown as { label: string; value: number }[] }; return <HypothesisWizard objectives={data.objectives.map(({ id, title }) => ({ id, title }))} stages={data.stages.map(({ id, name }) => ({ id, name }))} scales={scales}/>; }
