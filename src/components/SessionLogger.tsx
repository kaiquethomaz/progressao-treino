"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MuscleGroup, Weekday } from "@/generated/prisma/enums";
import { WEEKDAY_LABELS } from "@/lib/labels";
import { Card, SectionTitle } from "@/components/ui";
import { createSession, updateSession } from "@/lib/actions/sessions";

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

export type EditInitial = {
  sessionId: string;
  date: string;
  dayId: string | null;
  notes: string;
  rows: {
    exerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
    rpe: number | null;
  }[];
};

export function SessionLogger({
  routineDays,
  allExercises,
  lastByExercise,
  prByExercise = {},
  initial,
}: {
  routineDays: RoutineDayView[];
  allExercises: ExerciseLite[];
  lastByExercise: Record<string, { weight: number; reps: number }>;
  prByExercise?: Record<string, number>;
  initial?: EditInitial;
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const editing = Boolean(initial);
  const [date, setDate] = useState(initial?.date ?? today);
  const [dayId, setDayId] = useState(initial?.dayId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [rows, setRows] = useState<Row[]>(
    initial
      ? initial.rows.map((r) =>
          newRow({
            exerciseId: r.exerciseId,
            setNumber: r.setNumber,
            weight: String(r.weight),
            reps: String(r.reps),
            rpe: r.rpe != null ? String(r.rpe) : "",
          }),
        )
      : [],
  );
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
      const res =
        editing && initial
          ? await updateSession({
              sessionId: initial.sessionId,
              routineDayId: dayId || null,
              date,
              notes,
              sets,
            })
          : await createSession({
              routineDayId: dayId || null,
              date,
              notes,
              sets,
            });
      if (!res.ok) {
        setError(res.error ?? "Erro ao salvar.");
        return;
      }
      if (editing && initial) {
        router.push(`/treino/${initial.sessionId}`);
      } else {
        setRows([]);
        setNotes("");
        router.push("/");
      }
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

  // Detecta recordes pessoais: maior carga digitada > maior carga já registrada.
  // Só vale quando existe histórico anterior (evita "recorde" na estreia do exercício).
  const prHits = useMemo(() => {
    if (editing) return [];
    const maxByEx = new Map<string, number>();
    for (const r of rows) {
      if (!r.exerciseId || !r.weight) continue;
      const w = Number(r.weight);
      if (!Number.isFinite(w) || w <= 0) continue;
      maxByEx.set(r.exerciseId, Math.max(maxByEx.get(r.exerciseId) ?? 0, w));
    }
    const hits: { exerciseId: string; weight: number; pr: number }[] = [];
    for (const [exId, w] of maxByEx) {
      const pr = prByExercise[exId] ?? 0;
      if (pr > 0 && w > pr) hits.push({ exerciseId: exId, weight: w, pr });
    }
    return hits;
  }, [rows, prByExercise, editing]);

  const prHitIds = useMemo(
    () => new Set(prHits.map((h) => h.exerciseId)),
    [prHits],
  );

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
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={submit}
            disabled={pending || rows.length === 0}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {pending
              ? "Salvando..."
              : editing
                ? "Salvar alterações"
                : "Salvar treino"}
          </button>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Card>
          <SectionTitle>Séries</SectionTitle>
          {prHits.length > 0 && (
            <div className="rise mb-4 rounded-xl border border-accent/40 bg-accent/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                <span className="text-lg leading-none">🎉</span>
                Novo recorde pessoal!
              </p>
              <ul className="mt-1.5 space-y-0.5 pl-7 text-xs text-muted">
                {prHits.map((h) => (
                  <li key={h.exerciseId}>
                    <span className="font-medium text-foreground">
                      {exerciseName(h.exerciseId)}
                    </span>{" "}
                    <span className="tabular">{h.weight} kg</span>{" "}
                    <span className="text-muted/70">
                      (recorde anterior: {h.pr} kg)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rows.length === 0 ? (
            <div className="mx-auto max-w-md py-8 text-center">
              <div className="mb-2 text-3xl opacity-80">📋</div>
              <p className="font-semibold">Comece seu treino</p>
              <p className="mt-1 text-sm text-muted">
                Toque num treino da sua rotina para carregar os exercícios com a
                última carga — ou adicione um exercício avulso.
              </p>
              {routineDays.length > 0 && (
                <div className="mt-5 space-y-2 text-left">
                  {routineDays.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => loadDay(d.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-150 ${
                        dayId === d.id
                          ? "border-accent bg-accent/5"
                          : "border-border bg-surface-2 hover:border-accent hover:bg-accent/5"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-xs font-bold text-accent">
                        {WEEKDAY_LABELS[d.weekday].slice(0, 3)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium group-hover:text-accent">
                          {d.label}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {d.exercises.length > 0
                            ? d.exercises.map((e) => e.exercise.name).join(" · ")
                            : "Sem exercícios neste dia"}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="text-muted transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(([exId, exRows]) => {
                const last = lastByExercise[exId];
                return (
                <div key={exId}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{exerciseName(exId)}</h4>
                        {prHitIds.has(exId) && (
                          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-accent">
                            Recorde
                          </span>
                        )}
                      </div>
                      {last && (
                        <p className="mt-0.5 text-xs text-muted">
                          Último: {last.weight} kg × {last.reps}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => addRowForExercise(exId)}
                      className="shrink-0 text-xs text-accent hover:underline"
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
                          placeholder={last ? String(last.weight) : "kg"}
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
                          className="text-center text-muted transition-colors hover:text-danger"
                          title="Remover série"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
