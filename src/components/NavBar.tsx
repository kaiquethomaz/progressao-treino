"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 sm:gap-2">
        <Link
          href="/"
          className="mr-3 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-base text-accent-contrast">
            🏋️
          </span>
          <span className="hidden sm:inline">Progressão</span>
        </Link>
        <div className="flex-1 sm:hidden" />
        <nav className="hidden flex-1 flex-wrap items-center gap-1 text-sm font-medium sm:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 transition-colors duration-150 ${
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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userName && (
            <>
              <span className="hidden items-center gap-2 text-sm text-muted-strong sm:flex">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-xs font-bold text-accent">
                  {userName.charAt(0).toUpperCase()}
                </span>
                {userName}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground"
                >
                  Sair
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
