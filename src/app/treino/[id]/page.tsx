import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { Card, MuscleBadge, StatCard } from "@/components/ui";
import { formatDate, formatKg, setVolume, estimate1RM } from "@/lib/calc";
import { WEEKDAY_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function TreinoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const session = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      routineDay: true,
      setEntries: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
        include: {
          exercise: { select: { name: true, muscleGroup: true } },
        },
      },
    },
  });

  // Proteção: existe e pertence ao usuário logado
  if (!session || session.userId !== user.id) notFound();

  // Agrupa séries por exercício
  const groups = new Map<
    string,
    {
      name: string;
      muscleGroup: (typeof session.setEntries)[number]["exercise"]["muscleGroup"];
      sets: (typeof session.setEntries)[number][];
    }
  >();
  for (const s of session.setEntries) {
    let g = groups.get(s.exerciseId);
    if (!g) {
      g = { name: s.exercise.name, muscleGroup: s.exercise.muscleGroup, sets: [] };
      groups.set(s.exerciseId, g);
    }
    g.sets.push(s);
  }

  const totalVolume = session.setEntries.reduce(
    (acc, s) => acc + setVolume(s.weight, s.reps),
    0,
  );
  const topWeight = session.setEntries.reduce(
    (acc, s) => Math.max(acc, s.weight),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Voltar ao painel
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              {session.routineDay
                ? WEEKDAY_LABELS[session.routineDay.weekday]
                : "Treino avulso"}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              {session.routineDay?.label ?? "Treino avulso"}
            </h1>
            <p className="mt-1 text-muted">{formatDate(session.date)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Volume total" value={formatKg(totalVolume)} accent />
        <StatCard label="Séries" value={String(session.setEntries.length)} />
        <StatCard label="Exercícios" value={String(groups.size)} />
        <StatCard label="Maior carga" value={formatKg(topWeight)} />
      </div>

      {session.notes && (
        <Card>
          <p className="eyebrow mb-1">Observações</p>
          <p className="text-sm text-muted-strong">{session.notes}</p>
        </Card>
      )}

      <div className="space-y-4">
        {Array.from(groups.values()).map((g, i) => (
          <Card key={i}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-base font-bold">{g.name}</h2>
              <MuscleBadge group={g.muscleGroup} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="pb-2 font-medium">Série</th>
                    <th className="pb-2 font-medium">Carga</th>
                    <th className="pb-2 font-medium">Reps</th>
                    <th className="pb-2 font-medium">RPE</th>
                    <th className="pb-2 text-right font-medium">1RM est.</th>
                  </tr>
                </thead>
                <tbody className="tabular">
                  {g.sets.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 text-muted">{s.setNumber}</td>
                      <td className="py-2 font-medium">{formatKg(s.weight)}</td>
                      <td className="py-2">{s.reps}</td>
                      <td className="py-2 text-muted">{s.rpe ?? "—"}</td>
                      <td className="py-2 text-right text-accent">
                        {formatKg(estimate1RM(s.weight, s.reps))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
