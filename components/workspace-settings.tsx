"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Check, FolderPlus, GitBranch, Pencil, Plus, Scale, Target, Trash2, X } from "lucide-react";
import { stageDeletionSummary } from "@/lib/funnel";

type Project = { id: string; name: string };
type Objective = { id: string; title: string; metric: string | null; currentValue: number | null; targetValue: number | null; periodStart: string | null; periodEnd: string | null };
type Stage = { id: string; name: string; position: number; hypothesisCount: number };
type ScaleOption = { label: string; value: number };
type Scales = { reach: ScaleOption[]; impact: ScaleOption[]; confidence: ScaleOption[]; effort: ScaleOption[]; version: number };

const numberFrom = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

export function WorkspaceSettings({ activeWorkspace, projects, objectives, stages, scales }: { activeWorkspace: Project; projects: Project[]; objectives: Objective[]; stages: Stage[]; scales: Scales }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState("");
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  async function post(url: string, body: unknown) {
    return request(url, "POST", body);
  }

  async function request(url: string, method: "POST" | "PATCH" | "DELETE", body: unknown) {
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Не удалось сохранить изменения");
    return data;
  }

  async function run(action: () => Promise<void>) {
    setPending(true); setError(null); setNotice(null);
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось выполнить действие"); } finally { setPending(false); }
  }

  function handleProjectCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form);
    void run(async () => { const project = await post("/api/workspaces", { name: data.get("name") }); form.reset(); setNotice(`Создан проект «${project.name}». Добавьте к нему цель и этапы ниже.`); router.refresh(); });
  }

  function handleObjectiveCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form);
    void run(async () => { await post("/api/settings/objectives", { title: data.get("title"), metric: data.get("metric"), currentValue: numberFrom(data.get("currentValue")), targetValue: numberFrom(data.get("targetValue")), periodStart: data.get("periodStart") || undefined, periodEnd: data.get("periodEnd") || undefined }); form.reset(); setNotice("Цель добавлена. Теперь её можно назначить новой гипотезе."); router.refresh(); });
  }

  function handleStageCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form);
    void run(async () => { await post("/api/settings/stages", { name: data.get("name") }); form.reset(); setNotice("Этап добавлен в конец воронки и доступен в мастере гипотез."); router.refresh(); });
  }

  function startStageEdit(stage: Stage) {
    setEditingStageId(stage.id); setEditingStageName(stage.name); setDeleteCandidateId(null); setError(null); setNotice(null);
  }

  function handleStageEdit(event: FormEvent<HTMLFormElement>, stageId: string) {
    event.preventDefault();
    void run(async () => { await request(`/api/settings/stages/${stageId}`, "PATCH", { name: editingStageName }); setEditingStageId(null); setNotice("Название этапа обновлено. Все привязанные гипотезы останутся на нём."); router.refresh(); });
  }

  function confirmStageDelete(stage: Stage) {
    void run(async () => { const result = await request(`/api/settings/stages/${stage.id}`, "DELETE", { confirmDetach: true }); setDeleteCandidateId(null); setNotice(result.detached ? `Этап удалён. У ${result.detached} гипотез снято назначение этапа.` : "Пустой этап удалён."); router.refresh(); });
  }

  function switchProject(workspaceId: string) {
    if (workspaceId === activeWorkspace.id) return;
    void run(async () => { await post("/api/workspaces/active", { workspaceId }); setNotice("Проект переключён."); router.refresh(); });
  }

  const scaleGroups: Array<[string, ScaleOption[]]> = [["Охват", scales.reach], ["Влияние", scales.impact], ["Уверенность", scales.confidence], ["Усилия", scales.effort]];

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
    <header className="max-w-3xl"><p className="eyebrow">Управление</p><h1 className="mt-1 text-3xl font-bold">Проекты, цели и методика</h1><p className="mt-2 text-zinc-400">Каждый проект — отдельное рабочее пространство: свои гипотезы, цели, воронка и RICE-настройки. Данные между ними не смешиваются.</p></header>
    {(notice || error) && <p role="status" className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-300/30 bg-rose-300/10 text-rose-200" : "border-[#d3f96a]/25 bg-[#d3f96a]/10 text-[#e1ff91]"}`}>{error ?? notice}</p>}

    <section className="grid gap-5 lg:grid-cols-[1fr_.95fr]">
      <div className="card"><div className="flex items-start gap-3"><ArrowRightLeft className="mt-1 text-[#d3f96a]" size={20}/><div><p className="eyebrow">Активный проект</p><h2 className="mt-1 text-xl font-bold">{activeWorkspace.name}</h2><p className="mt-1 text-sm text-zinc-500">Переключение меняет контекст всего приложения: реестра, доски, аналитики и импорта.</p></div></div><label className="mt-5 block text-sm font-semibold">Открыть проект<select value={activeWorkspace.id} disabled={pending} onChange={(event) => switchProject(event.target.value)} className="mt-2 w-full rounded-lg p-3 outline-none"><option value={activeWorkspace.id}>{activeWorkspace.name}</option>{projects.filter((project) => project.id !== activeWorkspace.id).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>
      <form onSubmit={handleProjectCreate} className="card"><div className="flex items-start gap-3"><FolderPlus className="mt-1 text-[#d3f96a]" size={20}/><div><p className="eyebrow">Новый проект</p><h2 className="mt-1 text-xl font-bold">Начать с чистого контекста</h2><p className="mt-1 text-sm text-zinc-500">Создаётся отдельное пространство со стандартной RICE-шкалой, без случайно перенесённых целей и этапов.</p></div></div><label className="mt-5 block text-sm font-semibold">Название проекта<input required minLength={2} maxLength={100} name="name" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#d3f96a]/30" placeholder="Например: Новый продукт / Q4 2026"/></label><button disabled={pending} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d3f96a] px-4 py-2.5 text-sm font-bold text-[#151a0e] disabled:opacity-50"><Plus size={16}/>Создать и перейти</button></form>
    </section>

    <section id="goals" className="grid gap-5 lg:grid-cols-[1fr_.95fr]">
      <div className="card"><div className="flex items-start gap-3"><Target className="mt-1 text-[#d3f96a]" size={20}/><div><p className="eyebrow">Цели проекта</p><h2 className="mt-1 text-xl font-bold">К чему привязывать гипотезы</h2></div></div><div className="mt-5 space-y-2">{objectives.length ? objectives.map((objective) => <div key={objective.id} className="rounded-lg border border-white/10 bg-white/[0.025] p-3"><p className="font-semibold">{objective.title}</p><p className="mt-1 text-sm text-zinc-500">{objective.metric || "Метрика пока не задана"}{objective.currentValue !== null || objective.targetValue !== null ? ` · ${objective.currentValue?.toLocaleString("ru-RU") ?? "—"} → ${objective.targetValue?.toLocaleString("ru-RU") ?? "—"}` : ""}</p></div>) : <p className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-zinc-500">В проекте ещё нет целей. Добавьте измеримую цель перед оценкой гипотез.</p>}</div></div>
      <form onSubmit={handleObjectiveCreate} className="card"><p className="eyebrow">Новая цель</p><h2 className="mt-1 text-xl font-bold">Зафиксировать ориентир</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold">Цель<input required name="title" minLength={3} disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none" placeholder="Увеличить конверсию в оплату"/></label><label className="sm:col-span-2 text-sm font-semibold">Метрика<input name="metric" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none" placeholder="Конверсия в оплату, %"/></label><label className="text-sm font-semibold">Текущее значение<input name="currentValue" type="number" min="0" step="any" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none" placeholder="2.3"/></label><label className="text-sm font-semibold">Целевое значение<input name="targetValue" type="number" min="0" step="any" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none" placeholder="4"/></label><label className="text-sm font-semibold">Начало периода<input name="periodStart" type="date" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none"/></label><label className="text-sm font-semibold">Конец периода<input name="periodEnd" type="date" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none"/></label></div><button disabled={pending} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d3f96a] px-4 py-2.5 text-sm font-bold text-[#151a0e] disabled:opacity-50"><Plus size={16}/>Добавить цель</button></form>
    </section>

    <section id="funnel" className="grid gap-5 lg:grid-cols-[1fr_.95fr]">
      <div className="card"><div className="flex items-start gap-3"><GitBranch className="mt-1 text-[#d3f96a]" size={20}/><div><p className="eyebrow">Воронка</p><h2 className="mt-1 text-xl font-bold">Этапы пути пользователя</h2><p className="mt-1 text-sm text-zinc-500">Новые этапы добавляются в конец. Их можно переименовать или удалить с понятным последствием для гипотез.</p></div></div><ol className="mt-5 space-y-2">{stages.length ? stages.map((stage, index) => { const deletion = stageDeletionSummary(stage.hypothesisCount); const isEditing = editingStageId === stage.id; const isConfirmingDelete = deleteCandidateId === stage.id; return <li key={stage.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.07] text-xs font-bold text-[#d3f96a]">{index + 1}</span>{isEditing ? <form onSubmit={(event) => handleStageEdit(event, stage.id)} className="flex min-w-0 flex-1 items-center gap-2"><input autoFocus required minLength={2} maxLength={100} value={editingStageName} onChange={(event) => setEditingStageName(event.target.value)} disabled={pending} aria-label="Новое название этапа" className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none"/><button disabled={pending} title="Сохранить название" className="rounded-lg bg-[#d3f96a] p-2 text-[#151a0e] disabled:opacity-50"><Check size={16}/><span className="sr-only">Сохранить</span></button><button type="button" onClick={() => { setEditingStageId(null); setEditingStageName(""); }} disabled={pending} title="Отменить" className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06]"><X size={16}/><span className="sr-only">Отменить</span></button></form> : <><div className="min-w-0 flex-1"><span className="font-medium">{stage.name}</span><span className="ml-2 text-xs text-zinc-500">{stage.hypothesisCount ? `${stage.hypothesisCount} гип.` : "пустой"}</span></div><div className="flex items-center gap-1"><button type="button" onClick={() => startStageEdit(stage)} disabled={pending} title={`Переименовать этап «${stage.name}»`} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-[#d3f96a] disabled:opacity-50"><Pencil size={16}/><span className="sr-only">Переименовать</span></button><button type="button" onClick={() => { setDeleteCandidateId(stage.id); setEditingStageId(null); setError(null); setNotice(null); }} disabled={pending} title={`Удалить этап «${stage.name}»`} className="rounded-lg p-2 text-zinc-400 transition hover:bg-rose-300/10 hover:text-rose-200 disabled:opacity-50"><Trash2 size={16}/><span className="sr-only">Удалить</span></button></div></>}{isConfirmingDelete && <div className="basis-full rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm"><p className="text-rose-100">{deletion.message}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => confirmStageDelete(stage)} disabled={pending} className="rounded-lg bg-rose-300 px-3 py-2 text-xs font-bold text-[#2b0a0a] disabled:opacity-50">Да, удалить этап</button><button type="button" onClick={() => setDeleteCandidateId(null)} disabled={pending} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/[0.06]">Отмена</button></div></div>}</li>; }) : <li className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-zinc-500">Воронка пока пуста. Добавьте первый этап — например, «Просмотр лендинга».</li>}</ol></div>
      <form onSubmit={handleStageCreate} className="card"><p className="eyebrow">Новый этап</p><h2 className="mt-1 text-xl font-bold">Расширить воронку</h2><p className="mt-2 text-sm text-zinc-500">Описывайте наблюдаемое действие пользователя, а не внутреннюю задачу команды.</p><label className="mt-5 block text-sm font-semibold">Название этапа<input required minLength={2} maxLength={100} name="name" disabled={pending} className="mt-2 w-full rounded-lg p-3 outline-none" placeholder="Например: Оплата"/></label><button disabled={pending} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#d3f96a] px-4 py-2.5 text-sm font-bold text-[#151a0e] disabled:opacity-50"><Plus size={16}/>Добавить этап</button></form>
    </section>

    <section id="methodology" className="card"><div className="flex items-start gap-3"><Scale className="mt-1 text-[#d3f96a]" size={20}/><div><p className="eyebrow">Методика оценки · версия {scales.version}</p><h2 className="mt-1 text-xl font-bold">Как считается RICE</h2><p className="mt-2 text-zinc-400"><strong className="font-mono text-[#d3f96a]">RICE = охват × влияние × уверенность ÷ усилия</strong>. Балл помогает сопоставить альтернативы внутри одного проекта; не доказывает будущий эффект.</p></div></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{scaleGroups.map(([title, options]) => <div key={title} className="rounded-lg border border-white/10 bg-white/[0.025] p-4"><p className="font-semibold">{title}</p><div className="mt-3 space-y-2">{options.map((option) => <div key={option.label} className="flex items-start justify-between gap-3 text-sm"><span className="text-zinc-400">{option.label}</span><span className="font-mono font-bold text-[#d3f96a]">{option.value}</span></div>)}</div></div>)}</div><div className="mt-5 rounded-lg border border-amber-200/15 bg-amber-200/[0.05] p-4 text-sm text-amber-100/80">Проверяйте результат экспериментом: высокий RICE — повод обсудить запуск, а не автоматическое решение. Для каждой оценки фиксируйте метод измерения, ожидаемый положительный эффект и риск.</div></section>
  </div>;
}
