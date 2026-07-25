import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ACTIVE_WORKSPACE_COOKIE, workspaceCreateData } from "@/lib/workspace-template";

const payload = z.object({ name: z.string().trim().min(2, "Введите название проекта").max(100) });

export async function POST(request: Request) {
  const membership = await requireRole("ADMIN");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Проверьте название" }, { status: 400 });

  const workspace = await prisma.workspace.create({
    data: {
      ...workspaceCreateData(parsed.data.name),
      memberships: { create: { userId: membership.userId, role: "ADMIN" } }
    }
  });
  const response = NextResponse.json({ id: workspace.id, name: workspace.name }, { status: 201 });
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}
