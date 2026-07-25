"use client";

import { useTransition } from "react";
import { Archive, ArrowRight, LoaderCircle } from "lucide-react";
import { updateHypothesisStatus } from "@/app/actions/hypotheses";
import { labels } from "@/components/status";
import type { Status } from "@/lib/hypotheses";

const next: Partial<Record<Status, Status>> = { IDEA: "READY_FOR_PRIORITIZATION", READY_FOR_PRIORITIZATION: "PRIORITIZED", PRIORITIZED: "PLANNED", PLANNED: "IN_PROGRESS", IN_PROGRESS: "VALIDATED" };
export function StatusControl({ id, status, compact = false }: { id: string; status: Status; compact?: boolean }) {
  const [pending, startTransition] = useTransition(); const target = next[status];
  if (!target && status !== "ARCHIVED") return <button onClick={() => startTransition(() => updateHypothesisStatus(id, "ARCHIVED"))} disabled={pending} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-2 text-xs font-bold text-zinc-400 hover:bg-white/[0.06] disabled:opacity-50"><Archive size={14}/>В архив</button>;
  if (!target) return null;
  return <div className={`flex ${compact ? "" : "flex-wrap"} items-center gap-2`}><button onClick={() => startTransition(() => updateHypothesisStatus(id, target))} disabled={pending} className="inline-flex items-center gap-1 rounded-lg bg-[#d3f96a] px-3 py-2 text-xs font-bold text-[#151a0e] disabled:opacity-50">{pending ? <LoaderCircle size={14} className="animate-spin"/> : <ArrowRight size={14}/>}{labels[target]}</button>{!compact && <button onClick={() => startTransition(() => updateHypothesisStatus(id, "ARCHIVED"))} disabled={pending} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-zinc-400 hover:bg-white/[0.06] disabled:opacity-50"><Archive size={14}/>В архив</button>}</div>;
}
