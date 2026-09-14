import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "treino_session";
const SESSION_DAYS = 30;

// --- Senha ---
export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// --- Token de sessão ---
// Guardamos só o hash do token no banco; o valor bruto vive no cookie.
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Cria uma sessão para o usuário e grava o cookie httpOnly. (Server Action) */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Encerra a sessão atual: apaga do banco e remove o cookie. (Server Action) */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    store.delete(COOKIE_NAME);
  }
}

/**
 * Lê o usuário logado a partir do cookie de sessão (ou null).
 * Memoizado por render com cache() do React para não repetir a query.
 */
export const getSessionUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
});

/** Exige login. Redireciona para /login se não houver sessão válida. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Já existe alguma senha configurada? (define se mostramos /setup ou /login) */
export async function hasPasswordConfigured() {
  const count = await prisma.user.count({
    where: { passwordHash: { not: null } },
  });
  return count > 0;
}
