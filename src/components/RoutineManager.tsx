"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MuscleGroup, Weekday } from "@/generated/prisma/enums";
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from "@/lib/labels";
import { Card, MuscleBadge, SectionTitle } from "@/components/ui";
import {
  addExerciseToDay,
  addRoutineDay,
  deleteRoutineDay,
  removeExerciseFromDay,
  reorderDayExercises,
  updateRoutineDayExercise,
} from "@/lib/actions/routine";

type ExerciseLite = { id: string; name: string; muscleGroup: MuscleGroup };

export type RoutineDayView = {
  id: string;
  weekday: Weekday;
  label: string;
  exercises: {
    id: string; // routineDayExercise id
    targetSets: number;
    targetReps: number;
    exercise: ExerciseLite;
  }[];
};

export function RoutineManager({
  days,
  allExercises,
}: {
  days: RoutineDayView[];
  allExercises: ExerciseLite[];
}) {
  const usedWeekdays = new Set(days.map((d) => d.weekday));
  const availableWeekdays = WEEKDAY_ORDER.filter((w) => !usedWeekdays.has(w));

  const ordered = [...days].sort(
    (a, b) =>
      WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday),
  );

  return (
    <div className="space-y-6">
      {availableWeekdays.length > 0 && (
        <AddDayForm weekdays={availableWeekdays} />
      )}

      {ordered.length === 0 ? (
        <Card>
          <p className="py-8 text-center text-sm text-muted">
            Sua rotina está vazia. Adicione um dia de treino acima.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ordered.map((day) => (
            <DayCard key={day.id} day={day} allExercises={allExercises} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddDayForm({ weekdays }: { weekdays: Weekday[] }) {
  const [weekday, setWeekday] = useState<Weekday>(weekdays[0]);
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      await addRoutineDay({ weekday, label });
      setLabel("");
    });
  }

  return (
    <Card>
      <SectionTitle>Adicionar dia de treino</SectionTitle>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Dia</label>
          <select
            value={weekday}
            onChange={(e) => setWeekday(e.target.value as Weekday)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {weekdays.map((w) => (
              <option key={w} value={w}>
                {WEEKDAY_LABELS[w]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="mb-1 block text-xs text-muted">
            Nome do treino
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Peito e Tríceps"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={add}
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </Card>
  );
}

function DayCard({
  day,
  allExercises,
}: {
  day: RoutineDayView;
  allExercises: ExerciseLite[];
}) {
  const [pending, startTransition] = useTransition();
  const usedIds = new Set(day.exercises.map((e) => e.exercise.id));
  const available = allExercises.filter((e) => !usedIds.has(e.id));
  const [toAdd, setToAdd] = useState(available[0]?.id ?? "");

  // Ordem local (otimista) dos exercícios, para o drag-and-drop
  const [items, setItems] = useState(day.exercises);
  useEffect(() => {
    setItems(day.exercises);
  }, [day.exercises]);

  // Só habilita o drag após montar no cliente (evita mismatch de hidratação do dnd-kit)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSets = items.reduce((sum, e) => sum + e.targetSets, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // otimista
    startTransition(async () => {
      await reorderDayExercises(next.map((i) => i.id));
    });
  }

  function add() {
    if (!toAdd) return;
    startTransition(async () => {
      await addExerciseToDay({ routineDayId: day.id, exerciseId: toAdd });
      setToAdd("");
    });
  }

  function removeDay() {
    if (!confirm(`Remover o dia "${day.label}" da rotina?`)) return;
    startTransition(async () => {
      await deleteRoutineDay(day.id);
    });
  }

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            {WEEKDAY_LABELS[day.weekday]}
          </p>
          <h3 className="text-lg font-semibold">{day.label}</h3>
          {items.length > 0 && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[0.7rem] font-medium text-muted tabular">
              {items.length} {items.length === 1 ? "exercício" : "exercícios"}
              <span aria-hidden className="text-muted/40">•</span>
              {totalSets} {totalSets === 1 ? "série total" : "séries totais"}
            </span>
          )}
        </div>
        <button
          onClick={removeDay}
          disabled={pending}
          className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger"
        >
          Remover dia
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-3 text-sm text-muted">Nenhum exercício neste dia.</p>
      ) : !mounted ? (
        <ul className="mb-3 space-y-2">
          {items.map((e) => (
            <StaticRow key={e.id} item={e} />
          ))}
        </ul>
      ) : (
        <DndContext
          id={`dnd-${day.id}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="mb-3 space-y-2">
              {items.map((e) => (
                <SortableRow key={e.id} item={e} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {available.length > 0 ? (
        <div className="flex gap-2 border-t border-border pt-3">
          <select
            value={toAdd}
            onChange={(e) => setToAdd(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Escolher exercício...</option>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            onClick={add}
            disabled={pending || !toAdd}
            className="rounded-lg border border-accent px-3 py-2 text-sm text-accent hover:bg-accent/10 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </div>
      ) : (
        <p className="border-t border-border pt-3 text-xs text-muted">
          Todos os exercícios já estão neste dia.
        </p>
      )}
    </Card>
  );
}

type RowItem = RoutineDayView["exercises"][number];

const ROW_CLASS =
  "flex items-center justify-between gap-2 rounded-lg bg-surface-2 px-2 py-2";

function RowBody({ item, handle }: { item: RowItem; handle: ReactNode }) {
  const [sets, setSets] = useState(item.targetSets);
  const [reps, setReps] = useState(item.targetReps);
  const [pending, startTransition] = useTransition();

  function saveTargets(nextSets: number, nextReps: number) {
    startTransition(async () => {
      await updateRoutineDayExercise({
        id: item.id,
        targetSets: nextSets,
        targetReps: nextReps,
      });
    });
  }

  function remove() {
    startTransition(async () => {
      await removeExerciseFromDay(item.id);
    });
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5">
        {handle}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {item.exercise.name}
            </span>
            <MuscleBadge group={item.exercise.muscleGroup} />
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-xs text-muted">
        <NumberBox
          value={sets}
          onChange={(v) => {
            setSets(v);
            saveTargets(v, reps);
          }}
        />
        <span>×</span>
        <NumberBox
          value={reps}
          onChange={(v) => {
            setReps(v);
            saveTargets(sets, v);
          }}
        />
        <button
          onClick={remove}
          disabled={pending}
          className="ml-1 rounded px-1.5 py-0.5 text-muted transition-colors hover:text-danger"
          title="Remover"
        >
          ✕
        </button>
      </div>
    </>
  );
}

// Versão estática (SSR / antes de montar no cliente) — sem drag, sem mismatch
function StaticRow({ item }: { item: RowItem }) {
  return (
    <li className={ROW_CLASS}>
      <RowBody item={item} handle={<span className="px-1 text-muted/40">⠿</span>} />
    </li>
  );
}

// Versão arrastável (após montar no cliente)
function SortableRow({ item }: { item: RowItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${ROW_CLASS} ${isDragging ? "ring-1 ring-accent/50" : ""}`}
    >
      <RowBody
        item={item}
        handle={
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded px-1 text-muted hover:text-foreground active:cursor-grabbing"
            title="Arrastar para reordenar"
            aria-label="Arrastar para reordenar"
          >
            ⠿
          </button>
        }
      />
    </li>
  );
}

function NumberBox({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      className="w-12 rounded border border-border bg-background px-1.5 py-1 text-center text-foreground outline-none focus:border-accent"
    />
  );
}
