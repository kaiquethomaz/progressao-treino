import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string; // rótulo completo (sidebar)
  short: string; // rótulo curto (bottom nav)
  icon: IconName;
  primary?: boolean;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", short: "Painel", icon: "home" },
  { href: "/progresso", label: "Progresso", short: "Progresso", icon: "chart" },
  {
    href: "/registrar",
    label: "Registrar treino",
    short: "Registrar",
    icon: "plus",
    primary: true,
  },
  { href: "/rotina", label: "Minha rotina", short: "Rotina", icon: "calendar" },
  {
    href: "/exercicios",
    label: "Exercícios",
    short: "Exercícios",
    icon: "dumbbell",
  },
];

export type IconName =
  | "home"
  | "chart"
  | "plus"
  | "calendar"
  | "dumbbell"
  | "layers"
  | "activity";

const PATHS: Record<IconName, ReactNode> = {
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
  layers: <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
};

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
