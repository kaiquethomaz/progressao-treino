import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { Card, SectionTitle, StatCard } from "@/components/ui";
import { WeeklyVolumeChart } from "@/components/charts/WeeklyVolumeChart";
import { formatDate, formatDateShort, setVolume } from "@/lib/calc";

export const dynamic = "force-dynamic";

const WEEKS = 8;
const DAY = 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const rangeStart = new Date(Date.now() - WEEKS * 7 * DAY);

  const [totalSessions, totalSets, entries, recentSessions] = await Promise.all([
    prisma.workoutSession.count({ where: { userId: user.id } }),
    prisma.setEntry.count({ where: { session: { userId: user.id } } }),
    prisma.setEntry.findMany({
      where: { session: { userId: user.id, date: { gte: rangeStart } } },
      select: { weight: true, reps: true, session: { select: { date: true } } },
    }),
    prisma.workoutSession.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 6,
      include: {
        routineDay: true,
        setEntries: { select: { weight: true, reps: true } },
      },
    }),
  ]);

  // Volume por semana (últimas 8 semanas)
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(rangeStart.getTime() + i * 7 * DAY);
    return { start, end: new Date(start.getTime() + 7 * DAY), volume: 0 };
  });
  let volume30d = 0;
  const thirtyDaysAgo = Date.now() - 30 * DAY;
  for (const e of entries) {
    const t = e.session.date.getTime();
    const v = setVolume(e.weight, e.reps);
    const bucket = buckets.find((b) => t >= b.start.getTime() && t < b.end.getTime());
    if (bucket) bucket.volume += v;
    if (t >= thirtyDaysAgo) volume30d += v;
  }
  const weeklyData = buckets.map((b) => ({
    label: formatDateShort(b.start),
    volume: Math.round(b.volume),
  }));

  const sessions30d = new Set(
    entries.filter((e) => e.session.date.getTime() >= thirtyDaysAgo).map((e) => e.session.date.getTime()),
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user.name} 👋</h1>
        <p className="mt-1 text-muted">
          Acompanhe sua evolução e mantenha a constância.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Treinos totais" value={String(totalSessions)} />
        <StatCard label="Séries registradas" value={String(totalSets)} />
        <StatCard
          label="Volume (30 dias)"
          value={`${Math.round(volume30d).toLocaleString("pt-BR")} kg`}
          hint="Peso × repetições somados"
        />
        <StatCard label="Treinos (30 dias)" value={String(sessions30d)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionTitle
            action={
              <Link
                href="/progresso"
                className="text-sm text-accent hover:underline"
              >
                Ver progresso →
              </Link>
            }
          >
            Volume por semana
          </SectionTitle>
          <WeeklyVolumeChart data={weeklyData} />
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle
            action={
              <Link
                href="/registrar"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-accent/90"
              >
                + Registrar
              </Link>
            }
          >
            Treinos recentes
          </SectionTitle>
          {recentSessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Nenhum treino registrado ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentSessions.map((s) => {
                const vol = s.setEntries.reduce(
                  (acc, e) => acc + setVolume(e.weight, e.reps),
                  0,
                );
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {s.routineDay?.label ?? "Treino avulso"}
                      </p>
                      <p className="text-xs text-muted">{formatDate(s.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent">
                        {Math.round(vol).toLocaleString("pt-BR")} kg
                      </p>
                      <p className="text-xs text-muted">
                        {s.setEntries.length} séries
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle>Comece por aqui</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink
            href="/exercicios"
            title="Exercícios"
            desc="Cadastre e organize seu catálogo"
          />
          <QuickLink
            href="/rotina"
            title="Minha rotina"
            desc="Monte sua semana de treinos"
          />
          <QuickLink
            href="/progresso"
            title="Progresso"
            desc="Veja a evolução das cargas"
          />
        </div>
      </Card>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface-2 p-4 transition-colors hover:border-accent/50"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </Link>
  );
}
