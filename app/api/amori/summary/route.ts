import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const token = process.env.AMORI_INTEGRATION_TOKEN;
  if (!token) return process.env.NODE_ENV !== "production";
  return request.headers.get("x-amori-token") === token;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Amori integration is not authorized" }, { status: 401 });
  const workspace = await getDefaultWorkspace();
  const data = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspace.id },
    include: {
      objectives: true,
      hypotheses: { include: { objective: true, funnelStage: true, experiments: { orderBy: { recordedAt: "desc" }, take: 1 } }, orderBy: [{ score: "desc" }, { updatedAt: "desc" }] }
    }
  });
  const active = data.hypotheses.filter((item) => !["VALIDATED", "REJECTED", "ARCHIVED"].includes(item.status));
  const overdue = active.filter((item) => item.dueDate && item.dueDate < new Date());
  return NextResponse.json({
    generatedAt: new Date().toISOString(), workspace: data.name,
    objectives: data.objectives.map(({ id, title, metric, currentValue, targetValue, periodEnd }) => ({ id, title, metric, currentValue, targetValue, periodEnd })),
    totals: { all: data.hypotheses.length, active: active.length, unscored: data.hypotheses.filter((item) => item.score === null).length, validated: data.hypotheses.filter((item) => item.status === "VALIDATED").length, overdue: overdue.length },
    hypotheses: data.hypotheses.slice(0, 30).map((item) => ({ id: item.id, title: item.title, status: item.status, score: item.score, reach: item.reachLabel, impact: item.impactLabel, confidence: item.confidenceLabel, effort: item.effortLabel, objective: item.objective?.title ?? null, funnelStage: item.funnelStage?.name ?? null, dueDate: item.dueDate, hypothesis: item.hypothesis, actions: item.actions, dataMethod: item.dataMethod, expectedUpside: item.expectedUpside, expectedDownside: item.expectedDownside, latestExperiment: item.experiments[0] ? { actual: item.experiments[0].actual, conclusion: item.experiments[0].conclusion, decision: item.experiments[0].decision, recordedAt: item.experiments[0].recordedAt } : null }))
  });
}
