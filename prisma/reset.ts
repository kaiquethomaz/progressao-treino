import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Limpa os dados de treino para "começar do zero", SEM apagar a conta de login.
//
// Uso:
//   npm run db:reset            -> apaga só o histórico (sessões + séries)
//   npm run db:reset -- --all   -> apaga também exercícios e rotina
//
// Rode apontando para o banco desejado. Em produção (Neon), defina a
// DATABASE_URL antes de rodar, ex. (PowerShell):
//   $env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
//   npm run db:reset -- --all

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ALL = process.argv.includes("--all");

function maskedHost() {
  const m = (process.env.DATABASE_URL ?? "").match(/@([^/:?]+)/);
  return m ? m[1] : "(host desconhecido)";
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida — nada foi apagado.");
  }

  console.log(`Banco alvo: ${maskedHost()}`);
  console.log(ALL ? "Modo: TUDO (menos login)" : "Modo: só histórico");

  console.log("Apagando histórico de treinos...");
  const sets = await prisma.setEntry.deleteMany();
  const sessions = await prisma.workoutSession.deleteMany();
  console.log(`  → ${sessions.count} sessões e ${sets.count} séries removidas.`);

  if (ALL) {
    console.log("Apagando rotina e catálogo de exercícios...");
    await prisma.routineDayExercise.deleteMany();
    await prisma.routineDay.deleteMany();
    const routines = await prisma.routine.deleteMany();
    const exercises = await prisma.exercise.deleteMany();
    console.log(
      `  → ${routines.count} rotina(s) e ${exercises.count} exercícios removidos.`,
    );
  }

  const users = await prisma.user.count();
  console.log(`Conta(s) de login mantida(s): ${users}.`);
  console.log("Pronto! Banco limpo para começar do zero.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
