"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, NAV } from "@/components/nav-icons";

const HIDDEN_ON = ["/login", "/setup"];

export function Sidebar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-lg text-accent-contrast">
          🏋️
        </span>
        <span className="font-display text-sm font-extrabold uppercase tracking-tight">
          Progressão
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon name={link.icon} size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-3">
        {userName && (
          <Link
            href="/conta"
            className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-150 ${
              pathname.startsWith("/conta")
                ? "bg-accent/15"
                : "hover:bg-surface-2"
            }`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-sm font-bold text-accent">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-muted-strong">
              {userName}
            </span>
            <span className="text-muted">
              <Icon name="user" size={16} />
            </span>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {userName && (
            <form action={logout} className="flex-1">
              <button
                type="submit"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground"
              >
                Sair
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
