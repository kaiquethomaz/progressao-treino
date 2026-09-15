"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; success?: string } | undefined;

/** Login com email + senha. Usado com useActionState no formulário. */
export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { error: "Email ou senha inválidos." };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { error: "Email ou senha inválidos." };
  }

  await createSession(user.id);
  redirect("/");
}

/** Troca a senha do usuário logado (exige a senha atual). */
export async function changePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser(); // exige login
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("new") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.passwordHash) {
    return { error: "Sua conta ainda não tem senha definida." };
  }

  const ok = await verifyPassword(current, dbUser.passwordHash);
  if (!ok) return { error: "Senha atual incorreta." };
  if (next.length < 6) {
    return { error: "A nova senha precisa ter ao menos 6 caracteres." };
  }
  if (next !== confirm) return { error: "As senhas novas não conferem." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { success: "Senha alterada com sucesso." };
}

/** Logout. */
export async function logout() {
  await destroySession();
  redirect("/login");
}

/** Primeira configuração: define a senha do usuário (ou o cria, se não existir). */
export async function setupPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || "Atleta";
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter ao menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não conferem." };
  }

  // Bloqueia se já houver senha configurada (setup é só na primeira vez).
  const alreadyConfigured = await prisma.user.count({
    where: { passwordHash: { not: null } },
  });
  if (alreadyConfigured > 0) {
    redirect("/login");
  }

  const passwordHash = await hashPassword(password);

  // Reaproveita o usuário existente (do seed) ou cria um novo.
  const existing = await prisma.user.findFirst();
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, email, name },
      })
    : await prisma.user.create({ data: { email, name, passwordHash } });

  await createSession(user.id);
  redirect("/");
}
