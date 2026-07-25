import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

const renamePayload = z.object({ name: z.string().trim().min(2, "Название этапа должно быть не короче 2 символов").max(100) });
const deletePayload = z.object({ confirmDetach: z.literal(true).optional() });
type RouteContext = { params: Promise<{ stageId: string }> };

async function findStage(stageId: string, workspaceId: string) {
  return prisma.funnelStage.findFirst({ where: { id: stageId, workspaceId }, select: { id: true, name: true, _count: { select: { hypotheses: true } } } });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  await requireRole("ADMIN");
  const parsed = renamePayload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте название этапа" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const { stageId } = await params;
  const stage = await findStage(stageId, workspace.id);
  if (!stage) return NextResponse.json({ error: "Этап не найден" }, { status: 404 });
  try {
    const updated = await prisma.funnelStage.update({ where: { id: stage.id }, data: { name: parsed.data.name } });
    return NextResponse.json(updated);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Такой этап уже есть" }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  await requireRole("ADMIN");
  const parsed = deletePayload.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Не удалось подтвердить удаление" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const { stageId } = await params;
  const stage = await findStage(stageId, workspace.id);
  if (!stage) return NextResponse.json({ error: "Этап не найден" }, { status: 404 });
  if (stage._count.hypotheses > 0 && !parsed.data.confirmDetach) return NextResponse.json({ error: "На этапе есть гипотезы. Подтвердите снятие назначения этапа.", hypothesisCount: stage._count.hypotheses, requiresConfirmation: true }, { status: 409 });

  const detached = await prisma.$transaction(async (transaction) => {
    const hypotheses = await transaction.hypothesis.findMany({ where: { funnelStageId: stage.id }, select: { id: true } });
    if (hypotheses.length) await transaction.hypothesisHistory.createMany({ data: hypotheses.map((hypothesis) => ({ hypothesisId: hypothesis.id, event: "FUNNEL_STAGE_DETACHED", payload: { stageId: stage.id, stageName: stage.name } })) });
    await transaction.funnelStage.delete({ where: { id: stage.id } });
    return hypotheses.length;
  });
  return NextResponse.json({ ok: true, detached });
}
