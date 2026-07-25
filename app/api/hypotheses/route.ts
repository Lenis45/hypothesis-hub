import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { normalizeTitle } from "@/lib/hypotheses";
import { calculateRice } from "@/lib/rice";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

const payload = z.object({
  title: z.string().trim().min(3).max(500), objectiveId: z.string().optional(), funnelStageId: z.string().optional(),
  hypothesis: z.string().trim().optional(), actions: z.string().trim().optional(), dataMethod: z.string().trim().optional(),
  expectedUpside: z.string().trim().optional(), expectedDownside: z.string().trim().optional(), dueDate: z.string().optional(),
  reachLabel: z.string().optional(), reachValue: z.number().optional(), impactLabel: z.string().optional(), impactValue: z.number().optional(),
  confidenceLabel: z.string().optional(), confidenceValue: z.number().optional(), effortLabel: z.string().optional(), effortValue: z.number().optional()
});

export async function POST(request: Request) {
  await requireRole("EDITOR");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Проверьте обязательные поля" }, { status: 400 });
  const data = parsed.data; const workspace = await getDefaultWorkspace(); const normalizedTitle = normalizeTitle(data.title);
  const exists = await prisma.hypothesis.findUnique({ where: { workspaceId_normalizedTitle: { workspaceId: workspace.id, normalizedTitle } } });
  if (exists) return NextResponse.json({ error: "Такая идея уже есть в реестре" }, { status: 409 });
  const score = calculateRice(data.reachValue, data.impactValue, data.confidenceValue, data.effortValue);
  const hypothesis = await prisma.hypothesis.create({ data: { ...data, objectiveId: data.objectiveId || undefined, funnelStageId: data.funnelStageId || undefined, workspaceId: workspace.id, normalizedTitle, score, status: score === null ? "READY_FOR_PRIORITIZATION" : "PLANNED", dueDate: data.dueDate ? new Date(data.dueDate) : undefined, history: { create: { event: "CREATED_FROM_WIZARD", payload: { score } } } } });
  return NextResponse.json({ id: hypothesis.id }, { status: 201 });
}
