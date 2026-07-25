import { NextResponse } from "next/server";
import { previewWorkbook } from "@/lib/importer";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !/\.(xlsx|csv)$/i.test(file.name)) return NextResponse.json({ error: "Загрузите файл .xlsx или .csv" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const existing = await prisma.hypothesis.findMany({ where: { workspaceId: workspace.id }, select: { normalizedTitle: true } });
  const preview = previewWorkbook(await file.arrayBuffer(), new Set(existing.map((item) => item.normalizedTitle)));
  return NextResponse.json(preview);
}
