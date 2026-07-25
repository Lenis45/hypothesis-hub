"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { quickAdd } from "@/app/actions/hypotheses";

export function QuickAdd() {
  const form = useRef<HTMLFormElement>(null); const [message, setMessage] = useState(""); const [pending, startTransition] = useTransition();
  return <form ref={form} action={(data) => startTransition(async () => { const result = await quickAdd(data); setMessage(result?.error ?? "Идея добавлена в реестр"); if (result?.ok) form.current?.reset(); })} className="flex flex-col gap-2 sm:flex-row">
    <input name="title" required minLength={3} className="min-w-0 flex-1 rounded-xl border px-4 py-3 outline-none ring-[#d3f96a]/30 focus:ring" placeholder="Например: добавить прозрачный статус разработки на лендинг" />
    <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d3f96a] px-4 py-3 font-bold text-[#151a0e] hover:bg-[#e1ff91] disabled:opacity-50"><Plus size={18}/>{pending ? "Добавляю…" : "Добавить идею"}</button>
    {message && <p aria-live="polite" className="basis-full text-sm text-zinc-400">{message}</p>}
  </form>;
}
