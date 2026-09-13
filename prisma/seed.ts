import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { MuscleGroup, Weekday } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Exercícios do catálogo
const EXERCISES: { name: string; muscleGroup: MuscleGroup; base: number; inc: number }[] = [
  { name: "Supino reto", muscleGroup: "PEITO", base: 40, inc: 2.5 },
  { name: "Supino inclinado", muscleGroup: "PEITO", base: 30, inc: 2.5 },
  { name: "Tríceps corda", muscleGroup: "TRICEPS", base: 20, inc: 1.5 },
  { name: "Levantamento terra", muscleGroup: "COSTAS", base: 60, inc: 5 },
  { name: "Puxada frontal", muscleGroup: "COSTAS", base: 45, inc: 2.5 },
  { name: "Remada curvada", muscleGroup: "COSTAS", base: 40, inc: 2.5 },
  { name: "Rosca direta", muscleGroup: "BICEPS", base: 20, inc: 1.5 },
  { name: "Agachamento livre", muscleGroup: "PERNAS", base: 50, inc: 5 },
  { name: "Leg press", muscleGroup: "PERNAS", base: 120, inc: 10 },
  { name: "Desenvolvimento militar", muscleGroup: "OMBROS", base: 25, inc: 2 },
];

// Estrutura da rotina: dia -> rótulo -> exercícios
const ROUTINE: { weekday: Weekday; label: string; exercises: string[] }[] = [
  { weekday: "SEGUNDA", label: "Peito e Tríceps", exercises: ["Supino reto", "Supino inclinado", "Tríceps corda"] },
  {
    weekday: "QUARTA",
    label: "Costas e Bíceps",
    exercises: ["Levantamento terra", "Puxada frontal", "Remada curvada", "Rosca direta"],
  },
  {
    weekday: "SEXTA",
    label: "Pernas e Ombros",
    exercises: ["Agachamento livre", "Leg press", "Desenvolvimento militar"],
  },
];

const WEEKS = 8; // quantas semanas de histórico gerar

async function main() {
  console.log("Limpando dados antigos...");
  await prisma.setEntry.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.routineDayExercise.deleteMany();
  await prisma.routineDay.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuário...");
  const user = await prisma.user.create({
    data: { email: "kaiqueaguiar3@gmail.com", name: "Kaique" },
  });

  console.log("Criando exercícios...");
  const exByName = new Map<string, string>(); // nome -> id
  for (const e of EXERCISES) {
    const created = await prisma.exercise.create({
      data: { name: e.name, muscleGroup: e.muscleGroup, userId: user.id },
    });
    exByName.set(e.name, created.id);
  }

  console.log("Criando rotina...");
  const routine = await prisma.routine.create({
    data: { name: "Treino ABC 2026", isActive: true, userId: user.id },
  });

  const dayIdByWeekday = new Map<Weekday, string>();
  for (const day of ROUTINE) {
    const rd = await prisma.routineDay.create({
      data: { weekday: day.weekday, label: day.label, routineId: routine.id },
    });
    dayIdByWeekday.set(day.weekday, rd.id);
    for (let i = 0; i < day.exercises.length; i++) {
      await prisma.routineDayExercise.create({
        data: {
          routineDayId: rd.id,
          exerciseId: exByName.get(day.exercises[i])!,
          order: i,
          targetSets: 3,
          targetReps: 10,
        },
      });
    }
  }

  console.log("Gerando histórico de treinos e cargas...");
  const incByName = new Map(EXERCISES.map((e) => [e.name, e.inc]));
  const baseByName = new Map(EXERCISES.map((e) => [e.name, e.base]));

  // Mapa weekday -> deslocamento de dias dentro da semana (seg=0, qua=2, sex=4)
  const dayOffset: Record<string, number> = { SEGUNDA: 0, QUARTA: 2, SEXTA: 4 };

  const now = new Date();
  for (let week = 0; week < WEEKS; week++) {
    // week 0 = mais antigo, WEEKS-1 = mais recente
    const weeksAgo = WEEKS - 1 - week;
    for (const day of ROUTINE) {
      const sessionDate = new Date(now);
      sessionDate.setDate(now.getDate() - weeksAgo * 7 + dayOffset[day.weekday] - 6);
      sessionDate.setHours(19, 0, 0, 0);

      const session = await prisma.workoutSession.create({
        data: {
          userId: user.id,
          routineDayId: dayIdByWeekday.get(day.weekday)!,
          date: sessionDate,
        },
      });

      for (const exName of day.exercises) {
        const base = baseByName.get(exName)!;
        const inc = incByName.get(exName)!;
        // Pequena variação para parecer real (nem toda semana sobe igual)
        const noise = week > 0 && Math.random() < 0.25 ? -inc : 0;
        const weight = base + inc * week + noise;
        const exerciseId = exByName.get(exName)!;
        for (let s = 1; s <= 3; s++) {
          const reps = 12 - s; // 11, 10, 9
          await prisma.setEntry.create({
            data: {
              sessionId: session.id,
              exerciseId,
              setNumber: s,
              weight: Math.max(base, weight),
              reps,
              rpe: 7 + s * 0.5,
            },
          });
        }
      }
    }
  }

  const sessions = await prisma.workoutSession.count();
  const sets = await prisma.setEntry.count();
  console.log(`Pronto! ${EXERCISES.length} exercícios, ${sessions} sessões, ${sets} séries registradas.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
