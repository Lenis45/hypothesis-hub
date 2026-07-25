import type { Status } from "@/lib/hypotheses";

const labels: Record<Status, string> = { IDEA: "Идея", READY_FOR_PRIORITIZATION: "К оценке", PRIORITIZED: "Приоритизирована", PLANNED: "Запланирована", IN_PROGRESS: "В работе", VALIDATED: "Проверена", REJECTED: "Отклонена", ARCHIVED: "Архив" };
const colors: Record<Status, string> = { IDEA: "bg-zinc-700 text-zinc-200", READY_FOR_PRIORITIZATION: "bg-amber-400/15 text-amber-200", PRIORITIZED: "bg-violet-400/15 text-violet-200", PLANNED: "bg-sky-400/15 text-sky-200", IN_PROGRESS: "bg-blue-400/15 text-blue-200", VALIDATED: "bg-emerald-400/15 text-emerald-200", REJECTED: "bg-rose-400/15 text-rose-200", ARCHIVED: "bg-zinc-700 text-zinc-400" };
export function StatusBadge({ status }: { status: Status }) { return <span className={`badge ${colors[status]}`}>{labels[status]}</span>; }
export { labels };
