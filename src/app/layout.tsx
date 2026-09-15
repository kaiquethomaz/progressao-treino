import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { BottomNav } from "@/components/BottomNav";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Progressão",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#121417" },
  ],
  viewportFit: "cover",
};

// Aplica o tema salvo (ou o do sistema) antes da pintura, evitando "flash".
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html
      lang="pt-BR"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <NavBar userName={user?.name} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-24 sm:pb-8">
          {children}
        </main>
        <footer className="border-t border-border py-6 pb-24 text-center text-xs text-muted sm:pb-6">
          Progressão de Treino · feito com Next.js, Prisma e PostgreSQL
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
