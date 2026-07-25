import { getWorkspaceData } from "@/lib/workspace";
import { StatusBadge, labels } from "@/components/status";
import type { Status } from "@/lib/hypotheses";
import Link from "next/link";
import { StatusControl } from "@/components/status-control";

export const dynamic = "force-dynamic";

const columns: Status[] = ["IDEA", "READY_FOR_PRIORITIZATION", "PRIORITIZED", "PLANNED", "IN_PROGRESS", "VALIDATED"];
export default async function BoardPage() {
  const data = await getWorkspaceData();
  return <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8"><p className="eyebrow">Процесс</p><h1 className="mt-1 text-3xl font-bold">Поток экспериментов</h1><p className="mt-2 text-zinc-400">Статус меняется только кнопкой внутри карточки — каждый переход фиксируется в истории и проверяется сервером.</p><div className="mt-6 grid gap-4 overflow-x-auto pb-3" style={{ gridTemplateColumns: "repeat(6, minmax(235px, 1fr))" }}>{columns.map((status) => { const entries = data.hypotheses.filter((item) => item.status === status); return <section className="rounded-xl border border-white/10 bg-white/[0.025] p-3" key={status}><div className="mb-3 flex items-center justify-between"><StatusBadge status={status}/><span className="text-sm text-zinc-500">{entries.length}</span></div><div className="space-y-3">{entries.map((item) => <article key={item.id} className="rounded-lg border border-white/10 bg-[#161b23] p-3 shadow-sm"><Link href={`/hypotheses/${item.id}`} className="font-semibold leading-snug hover:text-[#d3f96a]">{item.title}</Link><div className="mt-3 flex justify-between text-xs text-zinc-500"><span>{item.funnelStage?.name ?? "Без этапа"}</span><strong className="font-mono text-[#d3f96a]">{item.score ?? "—"}</strong></div><div className="mt-3"><StatusControl id={item.id} status={item.status} compact/></div></article>)}{!entries.length && <p className="p-3 text-center text-sm text-zinc-600">Пока пусто</p>}</div></section>; })}</div></div>;
}
