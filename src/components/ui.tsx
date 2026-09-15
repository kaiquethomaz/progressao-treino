import type { ReactNode } from "react";
import type { MuscleGroup } from "@/generated/prisma/enums";
import { MUSCLE_GROUP_LABELS } from "@/lib/labels";

export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${
        interactive
          ? "transition-colors duration-150 hover:border-border-strong"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5">
      {accent && (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" aria-hidden />
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {icon && (
          <span className="shrink-0 text-muted/50" aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="stat-number text-3xl leading-none text-foreground">
          {value}
        </p>
        {trend && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular ${
              trend.positive === false
                ? "bg-danger/15 text-danger"
                : "bg-accent/15 text-accent"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
        {children}
      </h2>
      {action}
    </div>
  );
}

// Cor por grupo muscular (para os badges)
const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  PEITO: "bg-rose-500/15 text-rose-300",
  COSTAS: "bg-sky-500/15 text-sky-300",
  PERNAS: "bg-amber-500/15 text-amber-300",
  OMBROS: "bg-violet-500/15 text-violet-300",
  BICEPS: "bg-emerald-500/15 text-emerald-300",
  TRICEPS: "bg-teal-500/15 text-teal-300",
  ABDOMEN: "bg-orange-500/15 text-orange-300",
  GLUTEOS: "bg-pink-500/15 text-pink-300",
  PANTURRILHA: "bg-lime-500/15 text-lime-300",
  ANTEBRACO: "bg-cyan-500/15 text-cyan-300",
  CARDIO: "bg-red-500/15 text-red-300",
  OUTRO: "bg-slate-500/15 text-slate-300",
};

export function MuscleBadge({ group }: { group: MuscleGroup }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${MUSCLE_COLORS[group]}`}
    >
      {MUSCLE_GROUP_LABELS[group]}
    </span>
  );
}

// Botão primário reutilizável (accent lime + texto escuro)
export function EmptyState({
  icon = "🏋️",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="mb-1 text-3xl opacity-80">{icon}</div>
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
