import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, ListChecks, FlaskConical, BarChart3 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { riceExplanation } from "@/lib/rice";
import { StatusBadge } from "@/components/status";
import { StatusControl } from "@/components/status-control";

export const dynamic = "force-dynamic";

export default async function HypothesisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const item = await prisma.hypothesis.findUnique({ where: { id }, include: { experiments: { orderBy: { recordedAt: "desc" } }, objective: true, funnelStage: true } }); if (!item) notFound();
  const steps = [["Идея", item.title, Lightbulb], ["Гипотеза", item.hypothesis, FlaskConical], ["Действия", item.actions, ListChecks], ["Данные и результат", item.dataMethod, BarChart3]] as const;
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 lg:px-8"><Link href="/hypotheses" className="inline-flex items-center gap-1 text-sm font-semibold text-[#d3f96a]"><ArrowLeft size={16}/>К реестру</Link><section className="card"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><p className="eyebrow">Карточка гипотезы</p><h1 className="mt-1 text-3xl font-bold">{item.title}</h1><p className="mt-2 text-zinc-400">{item.objective?.title ?? "Цель не задана"} · {item.funnelStage?.name ?? "Этап воронки не задан"}</p></div><div className="flex items-end gap-3"><StatusBadge status={item.status}/><StatusControl id={item.id} status={item.status}/></div></div></section><section className="grid gap-4 md:grid-cols-2">{steps.map(([label, content, Icon]) => <div className="card" key={label}><Icon size={20} className="text-[#d3f96a]"/><p className="mt-3 font-semibold">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{content || "Этот шаг пока не заполнен. Создайте следующую гипотезу через мастер, чтобы описывать её сразу."}</p></div>)}</section><section className="grid gap-5 lg:grid-cols-3"><div className="card lg:col-span-2"><p className="eyebrow">Приоритизация</p><h2 className="mt-1 text-xl font-bold">RICE: <span className="font-mono text-[#d3f96a]">{item.score ?? "не рассчитан"}</span></h2><p className="mt-2 text-zinc-400">{riceExplanation(item.score)}</p><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[["Охват", item.reachLabel], ["Влияние", item.impactLabel], ["Уверенность", item.confidenceLabel], ["Усилия", item.effortLabel]].map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold">{value || "Не выбрано"}</p></div>)}</div></div><div className="card"><p className="eyebrow">Эксперименты</p><p className="mt-2 text-3xl font-bold">{item.experiments.length}</p><p className="text-sm text-zinc-500">записей с результатом</p></div></section></div>;
}
