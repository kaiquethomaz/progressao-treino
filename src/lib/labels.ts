import type { MuscleGroup, Weekday } from "@/generated/prisma/enums";

// Rótulos amigáveis em português para os enums do banco.

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  PEITO: "Peito",
  COSTAS: "Costas",
  PERNAS: "Pernas",
  OMBROS: "Ombros",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  ABDOMEN: "Abdômen",
  GLUTEOS: "Glúteos",
  PANTURRILHA: "Panturrilha",
  ANTEBRACO: "Antebraço",
  CARDIO: "Cardio",
  OUTRO: "Outro",
};

export const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  SEGUNDA: "Segunda",
  TERCA: "Terça",
  QUARTA: "Quarta",
  QUINTA: "Quinta",
  SEXTA: "Sexta",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

// Ordem canônica da semana (para exibir os dias na sequência certa)
export const WEEKDAY_ORDER: Weekday[] = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];
