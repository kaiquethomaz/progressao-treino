"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MuscleGroup, Weekday } from "@/generated/prisma/enums";
import { WEEKDAY_LABELS } from "@/lib/labels";
import { Card, SectionTitle } from "@/components/ui";
import { createSession } from "@/lib/actions/sessions";

type ExerciseLite = { id: string; name: string; muscleGroup: MuscleGroup };

type RoutineDayView = {
  id: string;
  weekday: Weekday;
  label: string;
  exercises: {
    targetSets: number;
    targetReps: number;
    exercise: ExerciseLite;
  }[];
};

type Row = {
  key: number;
  exerciseId: string;
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
};

let rowCounter = 0;
const newRow = (partial: Partial<Row> = {}): Row => ({
  key: rowCounter++,
  exerciseId: "",
  setNumber: 1,
  weight: "",
  reps: "",
  rpe: "",
  ...partial,
});

export function SessionLogger({
  routineDays,
  allExercises,
  lastByExercise,
}: {
  routineDays: RoutineDayView[];
  allExercises: ExerciseLite[];
  lastByExercise: Record<string, { weight: number; reps: number }>;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [dayId, setDayId] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const exerciseName = useMemo(() => {
    const m = new Map(allExercises.map((e) => [e.id, e.name]));
    return (id: string) => m.get(id) ?? "";
  }, [allExercises]);

  function loadDay(id: string) {
    setDayId(id);
    const day = routineDays.find((d) => d.id === id);
    if (!day) return;
    const generated: Row[] = [];
    for (const de of day.exercises) {
      const last = lastByExercise[de.exercise.id];
      for (let s = 1; s <= de.targetSets; s++) {
        generated.push(
          newRow({
            exerciseId: de.exercise.id,
            setNumber: s,
            weight: last ? String(last.weight) : "",
            reps: String(last?.reps ?? de.targetReps),
          }),
        );
      }
    }
    setRows(generated);
  }

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRowForExercise(exerciseId: string) {
    const existing = rows.filter((r) => r.exerciseId === exerciseId);
    const last = lastByExercise[exerciseId];
    setRows((rs) => [
      ...rs,
      newRow({
        exerciseId,
        setNumber: existing.length + 1,
        weight: last ? String(last.weight) : "",
        reps: last ? String(last.reps) : "",
      }),
    ]);
  }

  function removeRow(key: number) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }

  function submit() {
    setError(null);
    const sets = rows
      .filter((r) => r.exerciseId && r.weight && r.reps)
      .map((r) => ({
        exerciseId: r.exerciseId,
        setNumber: r.setNumber,
        weight: Number(r.weight),
        reps: Number(r.reps),
        rpe: r.rpe ? Number(r.rpe) : null,
      }));
    if (sets.length === 0) {
      setError("Preencha ao menos uma série com carga e repetições.");
      return;
    }
    startTransition(async () => {
      const res = await createSession({
        routineDayId: dayId || null,
        date,
        notes,
        sets,
      });
      if (!res.ok) {
        setError(res.error ?? "Erro ao salvar.");
        return;
      }
      setRows([]);
      setNotes("");
      router.push("/");
    });
  }

  // Agrupa linhas por exercício para exibir organizado
  const grouped = useMemo(() => {
    const groups = new Map<string, Row[]>();
    for (const r of rows) {
      if (!groups.has(r.exerciseId)) groups.set(r.exerciseId, []);
      groups.get(r.exerciseId)!.push(r);
    }
    return Array.from(groups.entries());
  }, [rows]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <SectionTitle>Dados do treino</SectionTitle>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Carregar treino da rotina
            </label>
            <select
              value={dayId}
              onChange={(e) => loadDay(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Treino avulso</option>
              {routineDays.map((d) => (
                <option key={d.id} value={d.id}>
                  {WEEKDAY_LABELS[d.weekday]} · {d.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted">
              Preenche as séries e sugere sua última carga.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Como foi o treino?"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Adicionar exercício
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addRowForExercise(e.target.value);
              }}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">Escolher exercício...</option>
              {allExercises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            onClick={submit}
            disabled={pending || rows.length === 0}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-900 hover:bg-accent/90 disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Salvar treino"}
          </button>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Card>
          <SectionTitle>Séries</SectionTitle>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              Carregue um treino da rotina ou adicione um exercício para
              começar.
            </p>
          ) : (
            <div className="space-y-5">
              {grouped.map(([exId, exRows]) => (
                <div key={exId}>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">{exerciseName(exId)}</h4>
                    <button
                      onClick={() => addRowForExercise(exId)}
                      className="text-xs text-accent hover:underline"
                    >
                      + série
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] gap-2 px-1 text-xs text-muted">
                      <span>#</span>
                      <span>Carga (kg)</span>
                      <span>Reps</span>
                      <span>RPE</span>
                      <span></span>
                    </div>
                    {exRows.map((r) => (
                      <div
                        key={r.key}
                        className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem] items-center gap-2"
                      >
                        <span className="text-center text-sm text-muted">
                          {r.setNumber}
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          value={r.weight}
                          onChange={(e) =>
                            updateRow(r.key, { weight: e.target.value })
                          }
                          className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <input
                          type="number"
                          value={r.reps}
                          onChange={(e) =>
                            updateRow(r.key, { reps: e.target.value })
                          }
                          className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <input
                          type="number"
                          step="0.5"
                          value={r.rpe}
                          placeholder="-"
                          onChange={(e) =>
                            updateRow(r.key, { rpe: e.target.value })
                          }
                          className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <button
                          onClick={() => removeRow(r.key)}
                          className="text-center text-rose-400 hover:text-rose-300"
                          title="Remover série"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
