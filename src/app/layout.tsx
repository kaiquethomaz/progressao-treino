import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { getSessionUser } from "@/lib/auth";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Progressão de Treino",
  description:
    "Gerencie sua rotina semanal e acompanhe a evolução das suas cargas.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar userName={user?.name} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          Progressão de Treino · feito com Next.js, Prisma e PostgreSQL
        </footer>
      </body>
    </html>
  );
}
