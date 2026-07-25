import { HypothesisWizard } from "@/components/hypothesis-wizard";
import { getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export default async function NewHypothesisPage() { const data = await getWorkspaceData(); return <HypothesisWizard objectives={data.objectives.map(({ id, title }) => ({ id, title }))} stages={data.stages.map(({ id, name }) => ({ id, name }))}/>; }
