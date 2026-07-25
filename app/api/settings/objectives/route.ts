import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

const optionalNumber = z.number().finite().nonnegative().optional();
const payload = z.object({
  title: z.string().trim().min(3, "Название цели должно быть не короче 3 символов").max(300),
  metric: z.string().trim().max(120).optional(),
  currentValue: optionalNumber,
  targetValue: optionalNumber,
  periodStart: z.string().date().optional(),
  periodEnd: z.string().date().optional()
}).refine((value) => value.currentValue === undefined || value.targetValue === undefined || value.targetValue >= value.currentValue, {
  message: "Целевое значение не может быть меньше текущего",
  path: ["targetValue"]
});

export async function POST(request: Request) {
  await requireRole("ADMIN");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте поля цели" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const objective = await prisma.objective.create({
    data: {
      workspaceId: workspace.id,
      title: parsed.data.title,
      metric: parsed.data.metric || undefined,
      currentValue: parsed.data.currentValue,
      targetValue: parsed.data.targetValue,
      periodStart: parsed.data.periodStart ? new Date(parsed.data.periodStart) : undefined,
      periodEnd: parsed.data.periodEnd ? new Date(parsed.data.periodEnd) : undefined
    }
  });
  return NextResponse.json(objective, { status: 201 });
}
