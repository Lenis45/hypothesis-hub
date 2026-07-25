import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

const payload = z.object({ name: z.string().trim().min(2, "Название этапа должно быть не короче 2 символов").max(100) });

export async function POST(request: Request) {
  await requireRole("ADMIN");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте название этапа" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const maxPosition = await prisma.funnelStage.aggregate({ where: { workspaceId: workspace.id }, _max: { position: true } });
  try {
    const stage = await prisma.funnelStage.create({ data: { workspaceId: workspace.id, name: parsed.data.name, position: (maxPosition._max.position ?? -1) + 1 } });
    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") return NextResponse.json({ error: "Такой этап уже есть" }, { status: 409 });
    throw error;
  }
}
