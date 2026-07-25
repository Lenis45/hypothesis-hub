import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET() {
  const workspace = await getDefaultWorkspace();
  const hypotheses = await prisma.hypothesis.findMany({ where: { workspaceId: workspace.id }, include: { objective: true, funnelStage: true, owner: true }, orderBy: [{ score: "desc" }, { createdAt: "desc" }] });
  const header = ["Идея", "Гипотеза", "Цель", "Этап воронки", "RICE", "Статус", "Срок", "Владелец"];
  const rows = hypotheses.map((item) => [item.title, item.hypothesis, item.objective?.title, item.funnelStage?.name, item.score, item.status, item.dueDate?.toISOString().slice(0, 10), item.owner?.name]);
  return new Response([header, ...rows].map((row) => row.map(escape).join(",")).join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=hypotheses.csv" } });
}
