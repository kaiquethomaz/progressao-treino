"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import type { Weekday } from "@/generated/prisma/enums";

/** Garante que exista uma rotina ativa e a retorna. */
export async function getOrCreateActiveRoutine() {
  const user = await getCurrentUser();
  let routine = await prisma.routine.findFirst({
    where: { userId: user.id, isActive: true },
  });
  if (!routine) {
    routine = await prisma.routine.create({
      data: { name: "Minha rotina", isActive: true, userId: user.id },
    });
  }
  return routine;
}

export async function addRoutineDay(input: { weekday: Weekday; label: string }) {
  const routine = await getOrCreateActiveRoutine();
  const label = input.label.trim() || "Treino";
  try {
    await prisma.routineDay.create({
      data: { weekday: input.weekday, label, routineId: routine.id },
    });
  } catch {
    return { ok: false, error: "Esse dia da semana já existe na rotina." };
  }
  revalidatePath("/rotina");
  revalidatePath("/registrar");
  return { ok: true };
}

export async function updateRoutineDay(input: { id: string; label: string }) {
  await prisma.routineDay.update({
    where: { id: input.id },
    data: { label: input.label.trim() || "Treino" },
  });
  revalidatePath("/rotina");
  return { ok: true };
}

export async function deleteRoutineDay(id: string) {
  await prisma.routineDay.delete({ where: { id } });
  revalidatePath("/rotina");
  revalidatePath("/registrar");
  return { ok: true };
}

export async function addExerciseToDay(input: {
  routineDayId: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
}) {
  const count = await prisma.routineDayExercise.count({
    where: { routineDayId: input.routineDayId },
  });
  try {
    await prisma.routineDayExercise.create({
      data: {
        routineDayId: input.routineDayId,
        exerciseId: input.exerciseId,
        order: count,
        targetSets: input.targetSets ?? 3,
        targetReps: input.targetReps ?? 10,
      },
    });
  } catch {
    return { ok: false, error: "Esse exercício já está nesse dia." };
  }
  revalidatePath("/rotina");
  revalidatePath("/registrar");
  return { ok: true };
}

export async function updateRoutineDayExercise(input: {
  id: string;
  targetSets: number;
  targetReps: number;
}) {
  await prisma.routineDayExercise.update({
    where: { id: input.id },
    data: {
      targetSets: Math.max(1, input.targetSets),
      targetReps: Math.max(1, input.targetReps),
    },
  });
  revalidatePath("/rotina");
  return { ok: true };
}

export async function removeExerciseFromDay(id: string) {
  await prisma.routineDayExercise.delete({ where: { id } });
  revalidatePath("/rotina");
  revalidatePath("/registrar");
  return { ok: true };
}
