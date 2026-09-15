"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const HIDDEN_ON = ["/login", "/setup"];

export function MobileTopBar({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur md:hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-tight"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-base text-accent-contrast">
            🏋️
          </span>
          Progressão
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          <ThemeToggle />
          {userName && (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground"
              >
                Sair
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
