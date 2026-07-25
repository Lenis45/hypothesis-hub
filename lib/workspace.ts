import { DEFAULT_SCALES } from "@/lib/rice";
import { prisma } from "@/lib/prisma";

export async function getDefaultWorkspace() {
  const existing = await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return prisma.workspace.create({
    data: {
      name: "Команда продукта",
      priorityPreset: { create: { reach: DEFAULT_SCALES.reach, impact: DEFAULT_SCALES.impact, confidence: DEFAULT_SCALES.confidence, effort: DEFAULT_SCALES.effort } },
      objectives: { create: { title: "Увеличить выручку", metric: "Выручка в месяц", currentValue: 0, targetValue: 2_000_000 } },
      stages: { create: ["Посещение сайта", "Нажатие на предзаказ", "Заполнение формы", "Оплата"].map((name, position) => ({ name, position })) }
    }
  });
}

export async function getWorkspaceData() {
  const workspace = await getDefaultWorkspace();
  return prisma.workspace.findUniqueOrThrow({
    where: { id: workspace.id },
    include: { objectives: true, stages: { orderBy: { position: "asc" } }, hypotheses: { include: { objective: true, funnelStage: true, owner: true, experiments: true }, orderBy: [{ score: "desc" }, { updatedAt: "desc" }] } }
  });
}
