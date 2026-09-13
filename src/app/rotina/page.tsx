import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { getOrCreateActiveRoutine } from "@/lib/actions/routine";
import { RoutineManager } from "@/components/RoutineManager";

export const dynamic = "force-dynamic";

export default async function RotinaPage() {
  const user = await getCurrentUser();
  const routine = await getOrCreateActiveRoutine();

  const [days, allExercises] = await Promise.all([
    prisma.routineDay.findMany({
      where: { routineId: routine.id },
      include: {
        exercises: {
          orderBy: { order: "asc" },
          include: {
            exercise: {
              select: { id: true, name: true, muscleGroup: true },
            },
          },
        },
      },
    }),
    prisma.exercise.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, muscleGroup: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha rotina</h1>
        <p className="mt-1 text-muted">
          {routine.name} · monte seus dias e defina metas de séries × reps.
        </p>
      </div>
      <RoutineManager days={days} allExercises={allExercises} />
    </div>
  );
}
