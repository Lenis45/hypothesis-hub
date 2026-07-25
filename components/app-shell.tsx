"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Download, GitBranch, LayoutDashboard, ListTodo, Plus, Target } from "lucide-react";

const navigation = [
  { href: "/", label: "Обзор", icon: LayoutDashboard },
  { href: "/hypotheses", label: "Реестр", icon: ListTodo },
  { href: "/board", label: "Процесс", icon: GitBranch },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/import", label: "Импорт", icon: Download }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return <div className="min-h-screen bg-[#0d1015] text-zinc-100"><aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-[#12161d] p-4 lg:flex"><Link href="/" className="flex items-center gap-2 px-2 py-3 text-lg font-black tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d3f96a] text-[#10140a]"><Target size={18}/></span>гипотезы<span className="text-zinc-500">.hub</span></Link><div className="mt-8 space-y-1">{navigation.map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={`nav-dark ${path === href ? "nav-dark-active" : ""}`}><Icon size={18}/>{label}</Link>)}</div><div className="mt-auto rounded-xl border border-white/10 bg-white/[0.035] p-3"><p className="text-xs uppercase tracking-wider text-zinc-500">Рабочее пространство</p><p className="mt-1 font-semibold">Команда продукта</p><p className="mt-1 text-xs text-zinc-500">Администратор</p></div></aside><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#0d1015]/90 px-4 backdrop-blur lg:ml-64 lg:px-8"><Link href="/" className="flex items-center gap-2 font-black lg:hidden"><span className="grid h-7 w-7 place-items-center rounded-md bg-[#d3f96a] text-[#10140a]"><Target size={15}/></span>гипотезы.hub</Link><p className="hidden text-sm text-zinc-500 lg:block">Рабочая система решений, а не электронная таблица</p><Link href="/new" className="inline-flex items-center gap-2 rounded-lg bg-[#d3f96a] px-3.5 py-2 text-sm font-bold text-[#151a0e] transition hover:bg-[#e1ff91]"><Plus size={17}/>Новая гипотеза</Link></header><main className="pb-24 lg:ml-64 lg:pb-8">{children}</main><nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/10 bg-[#12161d]/95 px-1 py-2 backdrop-blur lg:hidden">{navigation.slice(0, 4).map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={`flex min-w-16 flex-col items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ${path === href ? "text-[#d3f96a]" : "text-zinc-500"}`}><Icon size={18}/>{label}</Link>)}</nav></div>;
}
