"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import type { MuscleGroup } from "@/generated/prisma/enums";

export async function createExercise(input: {
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
}) {
  const user = await getCurrentUser();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "O nome é obrigatório." };

  try {
    await prisma.exercise.create({
      data: {
        name,
        muscleGroup: input.muscleGroup,
        notes: input.notes?.trim() || null,
        userId: user.id,
      },
    });
  } catch {
    return { ok: false, error: "Já existe um exercício com esse nome." };
  }

  revalidatePath("/exercicios");
  revalidatePath("/rotina");
  return { ok: true };
}

export async function updateExercise(input: {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  notes?: string;
}) {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "O nome é obrigatório." };

  try {
    await prisma.exercise.update({
      where: { id: input.id },
      data: {
        name,
        muscleGroup: input.muscleGroup,
        notes: input.notes?.trim() || null,
      },
    });
  } catch {
    return { ok: false, error: "Não foi possível atualizar (nome duplicado?)." };
  }

  revalidatePath("/exercicios");
  revalidatePath("/rotina");
  return { ok: true };
}

export async function deleteExercise(id: string) {
  await prisma.exercise.delete({ where: { id } });
  revalidatePath("/exercicios");
  revalidatePath("/rotina");
  return { ok: true };
}
