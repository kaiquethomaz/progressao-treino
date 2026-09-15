"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const HIDDEN_ON = ["/login", "/setup"];

function Icon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, ReactNode> = {
    home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
    chart: <path d="M4 20V4M4 20h16M8 16l4-5 3 3 4-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v3M16 3v3" />
      </>
    ),
    dumbbell: (
      <path d="M2 12h2m16 0h2M6.5 8.5v7m11-7v7M4.5 10v4m15-4v4M6.5 12h11" />
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const LINKS = [
  { href: "/", label: "Painel", icon: "home" },
  { href: "/progresso", label: "Progresso", icon: "chart" },
  { href: "/registrar", label: "Registrar", icon: "plus", primary: true },
  { href: "/rotina", label: "Rotina", icon: "calendar" },
  { href: "/exercicios", label: "Exercícios", icon: "dumbbell" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 py-1.5">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          if (link.primary) {
            return (
              <li key={link.href} className="flex justify-center">
                <Link
                  href={link.href}
                  aria-label={link.label}
                  className="-mt-5 flex flex-col items-center gap-1"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-contrast shadow-lg shadow-accent/20">
                    <Icon name={link.icon} />
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[0.65rem] font-medium transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon name={link.icon} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
