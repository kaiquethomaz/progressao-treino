import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { ExerciseManager } from "@/components/ExerciseManager";

export const dynamic = "force-dynamic";

export default async function ExerciciosPage() {
  const user = await getCurrentUser();
  const exercises = await prisma.exercise.findMany({
    where: { userId: user.id },
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    include: { _count: { select: { setEntries: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exercícios</h1>
        <p className="mt-1 text-muted">
          Seu catálogo de exercícios. Eles alimentam a rotina e os registros.
        </p>
      </div>
      <ExerciseManager exercises={exercises} />
    </div>
  );
}
