import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { getOrCreateActiveRoutine } from "@/lib/actions/routine";
import { SessionLogger, type EditInitial } from "@/components/SessionLogger";

export const dynamic = "force-dynamic";

export default async function EditarTreinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const routine = await getOrCreateActiveRoutine();

  const [session, routineDays, allExercises, recentSets] = await Promise.all([
    prisma.workoutSession.findUnique({
      where: { id },
      include: {
        setEntries: {
          orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
          select: {
            exerciseId: true,
            setNumber: true,
            weight: true,
            reps: true,
            rpe: true,
          },
        },
      },
    }),
    prisma.routineDay.findMany({
      where: { routineId: routine.id },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: { select: { id: true, name: true, muscleGroup: true } },
          },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, muscleGroup: true },
    }),
    prisma.setEntry.findMany({
      where: { session: { userId: user.id } },
      orderBy: { session: { date: "desc" } },
      take: 400,
      select: { exerciseId: true, weight: true, reps: true },
    }),
  ]);

  if (!session || session.userId !== user.id) notFound();

  const lastByExercise: Record<string, { weight: number; reps: number }> = {};
  for (const s of recentSets) {
    if (!lastByExercise[s.exerciseId]) {
      lastByExercise[s.exerciseId] = { weight: s.weight, reps: s.reps };
    }
  }

  const initial: EditInitial = {
    sessionId: session.id,
    date: session.date.toISOString().slice(0, 10),
    dayId: session.routineDayId,
    notes: session.notes ?? "",
    rows: session.setEntries,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/treino/${session.id}`}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Cancelar
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Editar treino</h1>
        <p className="mt-1 text-muted">
          Ajuste as cargas, séries, data ou observações.
        </p>
      </div>
      <SessionLogger
        routineDays={routineDays}
        allExercises={allExercises}
        lastByExercise={lastByExercise}
        initial={initial}
      />
    </div>
  );
}
