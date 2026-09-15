import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import { Card, EmptyState, SectionTitle, StatCard } from "@/components/ui";
import { Icon } from "@/components/nav-icons";
import { WeeklyVolumeChart } from "@/components/charts/WeeklyVolumeChart";
import { formatDate, formatDateShort, setVolume } from "@/lib/calc";
import { WEEKDAY_LABELS } from "@/lib/labels";
import type { Weekday } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const WEEKS = 8;
const DAY = 24 * 60 * 60 * 1000;

// getDay(): 0=domingo ... 6=sábado → enum Weekday
const JS_DAY_TO_WEEKDAY: Weekday[] = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
];

function pctTrend(current: number, previous: number) {
  if (previous <= 0) return undefined;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: `${pct >= 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const rangeStart = new Date(Date.now() - 60 * DAY); // 60 dias p/ comparar tendências
  const weekStart = new Date(Date.now() - WEEKS * 7 * DAY);
  const now = Date.now();

  const todayWeekday = JS_DAY_TO_WEEKDAY[new Date().getDay()];

  const [totalSessions, totalSets, entries, sessions30d, sessionsPrev30d, recentSessions, todayDay] =
    await Promise.all([
      prisma.workoutSession.count({ where: { userId: user.id } }),
      prisma.setEntry.count({ where: { session: { userId: user.id } } }),
      prisma.setEntry.findMany({
        where: { session: { userId: user.id, date: { gte: rangeStart } } },
        select: { weight: true, reps: true, session: { select: { date: true } } },
      }),
      prisma.workoutSession.count({
        where: { userId: user.id, date: { gte: new Date(now - 30 * DAY) } },
      }),
      prisma.workoutSession.count({
        where: {
          userId: user.id,
          date: { gte: new Date(now - 60 * DAY), lt: new Date(now - 30 * DAY) },
        },
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
      prisma.routineDay.findFirst({
        where: {
          routine: { userId: user.id, isActive: true },
          weekday: todayWeekday,
        },
        select: { label: true, _count: { select: { exercises: true } } },
      }),
    ]);

  // Volume por semana (últimas 8 semanas)
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(weekStart.getTime() + i * 7 * DAY);
    return { start, end: new Date(start.getTime() + 7 * DAY), volume: 0 };
  });
  let volume30d = 0;
  let volumePrev30d = 0;
  const t30 = now - 30 * DAY;
  const t60 = now - 60 * DAY;
  for (const e of entries) {
    const t = e.session.date.getTime();
    const v = setVolume(e.weight, e.reps);
    const bucket = buckets.find((b) => t >= b.start.getTime() && t < b.end.getTime());
    if (bucket) bucket.volume += v;
    if (t >= t30) volume30d += v;
    else if (t >= t60) volumePrev30d += v;
  }
  const weeklyData = buckets.map((b) => ({
    label: formatDateShort(b.start),
    volume: Math.round(b.volume),
  }));

  const hasData = totalSessions > 0;

  return (
    <div className="space-y-8">
      {/* Herói */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Painel</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Olá, {user.name}.
          </h1>
          <p className="mt-2 text-muted">
            Constância vence intensidade. Bora pro próximo treino.
          </p>
        </div>
        <Link
          href="/registrar"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors duration-150 hover:bg-accent-hover"
        >
          + Registrar treino
        </Link>
      </div>

      {/* Treino de hoje */}
      {todayDay ? (
        <Link
          href="/registrar"
          className="group flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/5 p-4 transition-colors duration-150 hover:border-accent/60 hover:bg-accent/10"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <Icon name="dumbbell" size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-accent">Treino de hoje</p>
            <p className="truncate text-lg font-bold">
              Hoje é dia de: {todayDay.label}
            </p>
            <p className="text-xs text-muted">
              {todayDay._count.exercises}{" "}
              {todayDay._count.exercises === 1 ? "exercício" : "exercícios"} ·
              toque para registrar
            </p>
          </div>
          <span
            aria-hidden
            className="text-accent transition-transform duration-150 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
            <Icon name="calendar" size={22} />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Treino de hoje</p>
            <p className="text-sm text-muted">
              Nenhum treino marcado para {WEEKDAY_LABELS[todayWeekday].toLowerCase()}.
              Dia de descanso ou treino avulso.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4">
        <StatCard
          label="Treinos totais"
          value={String(totalSessions)}
          icon={<Icon name="calendar" size={18} />}
          accent
        />
        <StatCard
          label="Séries registradas"
          value={String(totalSets)}
          icon={<Icon name="layers" size={18} />}
        />
        <StatCard
          label="Volume · 30 dias"
          value={`${Math.round(volume30d).toLocaleString("pt-BR")} kg`}
          hint="Peso × repetições"
          trend={pctTrend(volume30d, volumePrev30d)}
          icon={<Icon name="dumbbell" size={18} />}
        />
        <StatCard
          label="Treinos · 30 dias"
          value={String(sessions30d)}
          trend={pctTrend(sessions30d, sessionsPrev30d)}
          icon={<Icon name="activity" size={18} />}
        />
      </div>

      {/* Gráfico + recentes */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionTitle
            action={
              <Link
                href="/progresso"
                className="text-sm font-medium text-accent hover:text-accent-hover"
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
          <SectionTitle>Treinos recentes</SectionTitle>
          {recentSessions.length === 0 ? (
            <EmptyState
              title="Nenhum treino ainda"
              description="Registre seu primeiro treino para começar a acompanhar a evolução."
              action={
                <Link
                  href="/registrar"
                  className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast hover:bg-accent-hover"
                >
                  Registrar treino
                </Link>
              }
            />
          ) : (
            <ul className="-mx-2 divide-y divide-border">
              {recentSessions.map((s) => {
                const vol = s.setEntries.reduce(
                  (acc, e) => acc + setVolume(e.weight, e.reps),
                  0,
                );
                return (
                  <li key={s.id}>
                    <Link
                      href={`/treino/${s.id}`}
                      className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors duration-150 hover:bg-surface-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {s.routineDay?.label ?? "Treino avulso"}
                        </p>
                        <p className="text-xs text-muted">{formatDate(s.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="stat-number text-sm text-accent">
                          {Math.round(vol).toLocaleString("pt-BR")} kg
                        </p>
                        <p className="text-xs text-muted">
                          {s.setEntries.length} séries
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-muted transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Atalhos */}
      {!hasData && (
        <Card>
          <SectionTitle>Comece por aqui</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLink href="/exercicios" title="Exercícios" desc="Cadastre seu catálogo" />
            <QuickLink href="/rotina" title="Minha rotina" desc="Monte sua semana" />
            <QuickLink href="/progresso" title="Progresso" desc="Veja a evolução" />
          </div>
        </Card>
      )}
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
      className="group rounded-xl border border-border bg-surface-2 p-4 transition-colors duration-150 hover:border-accent/50"
    >
      <p className="font-semibold group-hover:text-accent">{title}</p>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </Link>
  );
}
