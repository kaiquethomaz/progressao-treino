import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { getOrCreateActiveRoutine } from "@/lib/actions/routine";
import { SessionLogger } from "@/components/SessionLogger";

export const dynamic = "force-dynamic";

export default async function RegistrarPage() {
  const user = await getCurrentUser();
  const routine = await getOrCreateActiveRoutine();

  const [routineDays, allExercises, recentSets, prRows] = await Promise.all([
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
    // Últimas séries para sugerir a carga anterior de cada exercício
    prisma.setEntry.findMany({
      where: { session: { userId: user.id } },
      orderBy: { session: { date: "desc" } },
      take: 400,
      select: { exerciseId: true, weight: true, reps: true },
    }),
    // Recorde (maior carga já registrada) por exercício — para comemorar PRs
    prisma.setEntry.groupBy({
      by: ["exerciseId"],
      where: { session: { userId: user.id } },
      _max: { weight: true },
    }),
  ]);

  const lastByExercise: Record<string, { weight: number; reps: number }> = {};
  for (const s of recentSets) {
    if (!lastByExercise[s.exerciseId]) {
      lastByExercise[s.exerciseId] = { weight: s.weight, reps: s.reps };
    }
  }

  const prByExercise: Record<string, number> = {};
  for (const r of prRows) {
    if (r._max.weight != null) prByExercise[r.exerciseId] = r._max.weight;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar treino</h1>
        <p className="mt-1 text-muted">
          Registre as cargas de hoje. A evolução aparece no progresso.
        </p>
      </div>
      <SessionLogger
        routineDays={routineDays}
        allExercises={allExercises}
        lastByExercise={lastByExercise}
        prByExercise={prByExercise}
      />
    </div>
  );
}
