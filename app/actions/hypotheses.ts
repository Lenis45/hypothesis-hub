"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeTitle, validateStatusTransition, type Status } from "@/lib/hypotheses";
import { getDefaultWorkspace } from "@/lib/workspace";
import { calculateRice } from "@/lib/rice";
import { requireRole } from "@/lib/access";

const quickAddSchema = z.object({ title: z.string().trim().min(3).max(500) });

export async function quickAdd(formData: FormData) {
  await requireRole("EDITOR");
  const parsed = quickAddSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: "Введите идею длиной не менее трёх символов." };
  const workspace = await getDefaultWorkspace();
  const normalizedTitle = normalizeTitle(parsed.data.title);
  const existing = await prisma.hypothesis.findUnique({ where: { workspaceId_normalizedTitle: { workspaceId: workspace.id, normalizedTitle } } });
  if (existing) return { error: "Такая идея уже есть в реестре." };
  await prisma.hypothesis.create({ data: { workspaceId: workspace.id, title: parsed.data.title, normalizedTitle } });
  revalidatePath("/"); revalidatePath("/hypotheses"); revalidatePath("/board");
  return { ok: true };
}

export async function updateHypothesisScore(id: string, values: { reachLabel: string; reachValue: number; impactLabel: string; impactValue: number; confidenceLabel: string; confidenceValue: number; effortLabel: string; effortValue: number }) {
  await requireRole("EDITOR");
  const score = calculateRice(values.reachValue, values.impactValue, values.confidenceValue, values.effortValue);
  await prisma.hypothesis.update({
    where: { id },
    data: { ...values, score, status: "PRIORITIZED", history: { create: { event: "RICE_UPDATED", payload: { ...values, score } } } }
  });
  revalidatePath("/"); revalidatePath("/hypotheses");
}

export async function updateHypothesisStatus(id: string, nextStatus: Status) {
  await requireRole("EDITOR");
  const item = await prisma.hypothesis.findUniqueOrThrow({ where: { id } });
  if (!validateStatusTransition(item.status, nextStatus)) throw new Error("Недопустимый переход статуса");
  await prisma.hypothesis.update({ where: { id }, data: { status: nextStatus, history: { create: { event: "STATUS_CHANGED", payload: { from: item.status, to: nextStatus } } } } });
  revalidatePath("/"); revalidatePath("/board"); revalidatePath("/hypotheses");
}
