import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Empresa Virtual OMSI", description: "Portal de gestão de empresas virtuais para OMSI 2 clássico e openOMSI.", applicationName: "Empresa Virtual OMSI" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
