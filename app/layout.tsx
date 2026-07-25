import type { Metadata } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { getDefaultWorkspace } from "@/lib/workspace";

export const metadata: Metadata = { title: "Гипотезы", description: "Рабочее пространство продуктовых гипотез" };

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const workspace = await getDefaultWorkspace();
  return <html lang="ru"><body><AppShell workspaceName={workspace.name}>{children}</AppShell></body></html>;
}
