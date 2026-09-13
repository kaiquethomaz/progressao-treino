import type { ReactNode } from "react";
import type { MuscleGroup } from "@/generated/prisma/enums";
import { MUSCLE_GROUP_LABELS } from "@/lib/labels";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
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
      <h2 className="text-lg font-semibold">{children}</h2>
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${MUSCLE_COLORS[group]}`}
    >
      {MUSCLE_GROUP_LABELS[group]}
    </span>
  );
}
