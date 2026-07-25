import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspace-template";

const payload = z.object({ workspaceId: z.string().cuid() });

export async function POST(request: Request) {
  const membership = await requireRole("VIEWER");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Не удалось выбрать проект" }, { status: 400 });
  const target = await prisma.membership.findUnique({ where: { workspaceId_userId: { workspaceId: parsed.data.workspaceId, userId: membership.userId } } });
  if (!target) return NextResponse.json({ error: "Нет доступа к этому проекту" }, { status: 403 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, target.workspaceId, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
