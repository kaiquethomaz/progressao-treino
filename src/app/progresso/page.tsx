import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { estimate1RM, formatDateShort } from "@/lib/calc";
import { ProgressExplorer, type ExProgress } from "@/components/ProgressExplorer";

export const dynamic = "force-dynamic";

export default async function ProgressoPage() {
  const user = await getCurrentUser();

  const entries = await prisma.setEntry.findMany({
    where: { session: { userId: user.id } },
    select: {
      weight: true,
      reps: true,
      exerciseId: true,
      exercise: { select: { name: true, muscleGroup: true } },
      session: { select: { id: true, date: true } },
    },
    orderBy: { session: { date: "asc" } },
  });

  // Agrupa por exercício -> por sessão
  type SessionAgg = { date: Date; maxWeight: number; est1RM: number };
  const byExercise = new Map<
    string,
    {
      name: string;
      muscleGroup: ExProgress["muscleGroup"];
      sessions: Map<string, SessionAgg>;
    }
  >();

  for (const e of entries) {
    let ex = byExercise.get(e.exerciseId);
    if (!ex) {
      ex = {
        name: e.exercise.name,
        muscleGroup: e.exercise.muscleGroup,
        sessions: new Map(),
      };
      byExercise.set(e.exerciseId, ex);
    }
    const sid = e.session.id;
    let agg = ex.sessions.get(sid);
    if (!agg) {
      agg = { date: e.session.date, maxWeight: 0, est1RM: 0 };
      ex.sessions.set(sid, agg);
    }
    agg.maxWeight = Math.max(agg.maxWeight, e.weight);
    agg.est1RM = Math.max(agg.est1RM, estimate1RM(e.weight, e.reps));
  }

  const exercises: ExProgress[] = Array.from(byExercise.entries())
    .map(([id, ex]) => {
      const points = Array.from(ex.sessions.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((s) => ({
          label: formatDateShort(s.date),
          maxWeight: Math.round(s.maxWeight * 10) / 10,
          est1RM: Math.round(s.est1RM * 10) / 10,
        }));
      const prWeight = Math.max(...points.map((p) => p.maxWeight));
      const first = points[0]?.maxWeight ?? 0;
      const last = points[points.length - 1]?.maxWeight ?? 0;
      return {
        id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        points,
        prWeight,
        deltaKg: Math.round((last - first) * 10) / 10,
        deltaPct: first > 0 ? Math.round(((last - first) / first) * 100) : 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progresso</h1>
        <p className="mt-1 text-muted">
          Escolha um exercício e veja a evolução da carga ao longo do tempo.
        </p>
      </div>
      {exercises.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-muted">
          Ainda não há registros. Registre alguns treinos para ver seus
          gráficos.
        </p>
      ) : (
        <ProgressExplorer exercises={exercises} />
      )}
    </div>
  );
}
