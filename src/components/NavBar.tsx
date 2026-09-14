"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/progresso", label: "Progresso" },
  { href: "/registrar", label: "Registrar treino" },
  { href: "/rotina", label: "Minha rotina" },
  { href: "/exercicios", label: "Exercícios" },
];

// Rotas sem barra de navegação (fluxo de autenticação)
const HIDDEN_ON = ["/login", "/setup"];

export function NavBar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 sm:gap-2">
        <Link href="/" className="mr-2 flex items-center gap-2 font-bold">
          <span className="text-xl">🏋️</span>
          <span className="hidden sm:inline">Progressão</span>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        {userName && (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">
              {userName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
              >
                Sair
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
