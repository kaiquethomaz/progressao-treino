"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export type SetInput = {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number | null;
};

export async function createSession(input: {
  routineDayId?: string | null;
  date: string; // ISO (yyyy-mm-dd)
  notes?: string;
  sets: SetInput[];
}) {
  const user = await getCurrentUser();

  const validSets = input.sets.filter(
    (s) => s.exerciseId && s.weight > 0 && s.reps > 0,
  );
  if (validSets.length === 0) {
    return { ok: false, error: "Adicione ao menos uma série válida." };
  }

  const date = input.date ? new Date(input.date + "T12:00:00") : new Date();

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      routineDayId: input.routineDayId || null,
      date,
      notes: input.notes?.trim() || null,
      setEntries: {
        create: validSets.map((s) => ({
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe ?? null,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/progresso");
  revalidatePath("/registrar");
  return { ok: true, id: session.id };
}

export async function updateSession(input: {
  sessionId: string;
  routineDayId?: string | null;
  date: string;
  notes?: string;
  sets: SetInput[];
}) {
  const user = await getCurrentUser();

  const existing = await prisma.workoutSession.findUnique({
    where: { id: input.sessionId },
    select: { userId: true },
  });
  if (!existing || existing.userId !== user.id) {
    return { ok: false, error: "Treino não encontrado." };
  }

  const validSets = input.sets.filter(
    (s) => s.exerciseId && s.weight > 0 && s.reps > 0,
  );
  if (validSets.length === 0) {
    return { ok: false, error: "Adicione ao menos uma série válida." };
  }

  const date = input.date ? new Date(input.date + "T12:00:00") : new Date();

  // Substitui as séries do treino (mais simples e previsível que fazer diff)
  await prisma.$transaction([
    prisma.setEntry.deleteMany({ where: { sessionId: input.sessionId } }),
    prisma.workoutSession.update({
      where: { id: input.sessionId },
      data: {
        routineDayId: input.routineDayId || null,
        date,
        notes: input.notes?.trim() || null,
        setEntries: {
          create: validSets.map((s) => ({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe ?? null,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/progresso");
  revalidatePath(`/treino/${input.sessionId}`);
  return { ok: true, id: input.sessionId };
}

export async function deleteSession(id: string) {
  await prisma.workoutSession.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/progresso");
  return { ok: true };
}
