import type { Metadata } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Гипотезы", description: "Рабочее пространство продуктовых гипотез" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><AppShell>{children}</AppShell></body></html>;
}
