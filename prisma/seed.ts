import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCALES } from "../lib/rice";
import { normalizeTitle } from "../lib/hypotheses";

const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.upsert({ where: { email: "admin@local.test" }, update: {}, create: { email: "admin@local.test", name: "Администратор" } });
  const workspace = await prisma.workspace.upsert({ where: { id: "default-workspace" }, update: {}, create: { id: "default-workspace", name: "Команда продукта", priorityPreset: { create: { reach: DEFAULT_SCALES.reach, impact: DEFAULT_SCALES.impact, confidence: DEFAULT_SCALES.confidence, effort: DEFAULT_SCALES.effort } }, objectives: { create: { title: "Увеличить выручку до 2 млн/мес", metric: "Выручка в месяц", currentValue: 450000, targetValue: 2000000 } }, stages: { create: ["Посещение сайта", "Нажатие на предзаказ", "Заполнение формы", "Оплата"].map((name, position) => ({ name, position })) } } });
  await prisma.membership.upsert({ where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } }, update: { role: "ADMIN" }, create: { workspaceId: workspace.id, userId: user.id, role: "ADMIN" } });
  const stages = await prisma.funnelStage.findMany({ where: { workspaceId: workspace.id } });
  const examples = [
    { title: "Показать честный статус разработки на сайте", reachLabel: "Большинство/Все", reachValue: 10, impactLabel: "M (5-10%)", impactValue: 5, confidenceLabel: "Возможно (25%)", confidenceValue: .25, effortLabel: "Меньше часа (XS)", effortValue: 1, score: 12.5, status: "PRIORITIZED" as const },
    { title: "Сократить форму предзаказа до необходимого минимума", reachLabel: "Около половины", reachValue: 5, impactLabel: "XL (>20%)", impactValue: 20, confidenceLabel: "Гарантированно (80%)", confidenceValue: .8, effortLabel: "Несколько дней (S)", effortValue: 2, score: 40, status: "PLANNED" as const },
    { title: "Собрать и отобразить отзывы тестеров", reachLabel: "Большинство/Все", reachValue: 10, impactLabel: "L (10-20%)", impactValue: 10, confidenceLabel: "Вероятно (50%)", confidenceValue: .5, effortLabel: "Несколько дней (S)", effortValue: 2, score: 25, status: "IN_PROGRESS" as const }
  ];
  for (const example of examples) await prisma.hypothesis.upsert({ where: { workspaceId_normalizedTitle: { workspaceId: workspace.id, normalizedTitle: normalizeTitle(example.title) } }, update: {}, create: { ...example, workspaceId: workspace.id, normalizedTitle: normalizeTitle(example.title), funnelStageId: stages[1]?.id } });
}
main().finally(() => prisma.$disconnect());
