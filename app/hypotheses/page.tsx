import { HypothesisRegistry } from "@/components/hypothesis-registry";
import { getWorkspaceData } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function HypothesesPage() {
  const data = await getWorkspaceData();
  return <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8"><HypothesisRegistry items={data.hypotheses.map((item) => ({ id: item.id, title: item.title, hypothesis: item.hypothesis, score: item.score, status: item.status, dueDate: item.dueDate?.toISOString() ?? null, objective: item.objective ? { title: item.objective.title } : null, funnelStage: item.funnelStage ? { name: item.funnelStage.name } : null }))}/></div>;
}
