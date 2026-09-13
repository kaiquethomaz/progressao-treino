// Cálculos de progressão de treino.

/**
 * Estima o 1RM (repetição máxima) pela fórmula de Epley.
 * 1RM = peso * (1 + reps/30). Para reps = 1, retorna o próprio peso.
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

/** Volume de uma série = peso * repetições (kg movimentados). */
export function setVolume(weight: number, reps: number): number {
  return weight * reps;
}

/** Formata um número de kg de forma limpa (sem casas desnecessárias). */
export function formatKg(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} kg`;
}

/** Formata uma data para o padrão brasileiro (dd/mm/aaaa). */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Formato curto de data para eixos de gráfico (dd/mm). */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
