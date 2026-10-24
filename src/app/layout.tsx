import type { Metadata } from "next";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";
import "./portal-polish.css";

export const metadata: Metadata = { title: "Empresa Virtual OMSI", description: "Portal de gestão de empresas virtuais para OMSI 2 clássico e openOMSI.", applicationName: "Empresa Virtual OMSI" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" data-theme="dark"><body>{children}<ThemeToggle /></body></html>;
}
