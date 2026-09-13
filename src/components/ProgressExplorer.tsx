"use client";

import { useState } from "react";
import type { MuscleGroup } from "@/generated/prisma/enums";
import { Card, MuscleBadge, StatCard } from "@/components/ui";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { formatKg } from "@/lib/calc";

export type ExProgress = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  points: { label: string; maxWeight: number; est1RM: number }[];
  prWeight: number;
  deltaKg: number;
  deltaPct: number;
};

export function ProgressExplorer({ exercises }: { exercises: ExProgress[] }) {
  const [selectedId, setSelectedId] = useState(exercises[0].id);
  const selected =
    exercises.find((e) => e.id === selectedId) ?? exercises[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">Exercício:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        >
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <MuscleBadge group={selected.muscleGroup} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Recorde (carga)" value={formatKg(selected.prWeight)} />
        <StatCard
          label="Evolução"
          value={`${selected.deltaKg >= 0 ? "+" : ""}${formatKg(selected.deltaKg)}`}
          hint="Da primeira à última sessão"
        />
        <StatCard
          label="Evolução %"
          value={`${selected.deltaPct >= 0 ? "+" : ""}${selected.deltaPct}%`}
        />
        <StatCard
          label="Sessões"
          value={String(selected.points.length)}
          hint="Treinos com este exercício"
        />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">
          Evolução — {selected.name}
        </h2>
        <ProgressChart data={selected.points} />
      </Card>
    </div>
  );
}
