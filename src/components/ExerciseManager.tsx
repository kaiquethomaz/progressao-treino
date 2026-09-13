"use client";

import { useState, useTransition } from "react";
import type { MuscleGroup } from "@/generated/prisma/enums";
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS } from "@/lib/labels";
import { MuscleBadge, Card } from "@/components/ui";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "@/lib/actions/exercises";

export type ExerciseRow = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  notes: string | null;
  _count: { setEntries: number };
};

export function ExerciseManager({ exercises }: { exercises: ExerciseRow[] }) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<MuscleGroup>("PEITO");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await createExercise({ name, muscleGroup: group, notes });
      if (!res.ok) setError(res.error ?? "Erro ao salvar.");
      else {
        setName("");
        setNotes("");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Formulário */}
      <Card className="lg:col-span-1 h-fit">
        <h2 className="mb-4 text-lg font-semibold">Novo exercício</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Supino reto"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Grupo muscular
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as MuscleGroup)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {MUSCLE_GROUP_LABELS[g]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              Observações (opcional)
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: pegada fechada"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={pending || !name.trim()}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-slate-900 hover:bg-accent/90 disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Adicionar exercício"}
          </button>
        </div>
      </Card>

      {/* Lista */}
      <div className="lg:col-span-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">
            Meus exercícios ({exercises.length})
          </h2>
          {exercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Nenhum exercício cadastrado. Adicione o primeiro ao lado.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {exercises.map((ex) =>
                editingId === ex.id ? (
                  <EditRow
                    key={ex.id}
                    exercise={ex}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{ex.name}</span>
                        <MuscleBadge group={ex.muscleGroup} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {ex._count.setEntries} séries registradas
                        {ex.notes ? ` · ${ex.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => setEditingId(ex.id)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted hover:text-foreground"
                      >
                        Editar
                      </button>
                      <DeleteButton id={ex.id} count={ex._count.setEntries} />
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function EditRow({
  exercise,
  onDone,
}: {
  exercise: ExerciseRow;
  onDone: () => void;
}) {
  const [name, setName] = useState(exercise.name);
  const [group, setGroup] = useState<MuscleGroup>(exercise.muscleGroup);
  const [notes, setNotes] = useState(exercise.notes ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await updateExercise({ id: exercise.id, name, muscleGroup: group, notes });
      onDone();
    });
  }

  return (
    <li className="space-y-2 py-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value as MuscleGroup)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {MUSCLE_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Observações"
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-slate-900 disabled:opacity-50"
        >
          Salvar
        </button>
        <button
          onClick={onDone}
          className="rounded-lg border border-border px-3 py-1 text-xs text-muted"
        >
          Cancelar
        </button>
      </div>
    </li>
  );
}

function DeleteButton({ id, count }: { id: string; count: number }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    const msg =
      count > 0
        ? `Este exercício tem ${count} séries registradas que também serão apagadas. Continuar?`
        : "Apagar este exercício?";
    if (!confirm(msg)) return;
    startTransition(async () => {
      await deleteExercise(id);
    });
  }

  return (
    <button
      onClick={remove}
      disabled={pending}
      className="rounded-lg border border-border px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
    >
      {pending ? "..." : "Excluir"}
    </button>
  );
}
