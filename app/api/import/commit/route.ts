import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getDefaultWorkspace } from "@/lib/workspace";
import { requireRole } from "@/lib/access";

const payload = z.object({ fileName: z.string(), hypotheses: z.array(z.object({ title: z.string(), normalizedTitle: z.string(), hypothesis: z.string().optional(), actions: z.string().optional(), dataMethod: z.string().optional(), expectedUpside: z.string().optional(), expectedDownside: z.string().optional(), reachLabel: z.string().optional(), reachValue: z.number().optional(), impactLabel: z.string().optional(), impactValue: z.number().optional(), confidenceLabel: z.string().optional(), confidenceValue: z.number().optional(), effortLabel: z.string().optional(), effortValue: z.number().optional(), score: z.number().nullable() })), issues: z.array(z.object({ sheetName: z.string(), rowNumber: z.number(), reason: z.string(), title: z.string().optional() })) });

export async function POST(request: Request) {
  await requireRole("ADMIN");
  const parsed = payload.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные импорта" }, { status: 400 });
  const workspace = await getDefaultWorkspace();
  const batch = await prisma.importBatch.create({ data: { workspaceId: workspace.id, fileName: parsed.data.fileName, imported: parsed.data.hypotheses.length, skipped: parsed.data.issues.length, issues: { create: parsed.data.issues.map((issue) => ({ ...issue, payload: issue.title ? { title: issue.title } : undefined })) } } });
  const result = await prisma.hypothesis.createMany({ data: parsed.data.hypotheses.map((item) => ({ ...item, workspaceId: workspace.id, status: item.score === null ? "IDEA" : "PRIORITIZED" })), skipDuplicates: true });
  return NextResponse.json({ batchId: batch.id, imported: result.count });
}
