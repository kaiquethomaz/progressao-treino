import { prisma } from "@/lib/prisma";

// App pessoal: por enquanto sem login. Usamos um único usuário.
// Quando quiser multi-usuário, troque isto por autenticação de verdade.
export const DEFAULT_USER_EMAIL = "kaiqueaguiar3@gmail.com";
export const DEFAULT_USER_NAME = "Kaique";

/** Retorna o usuário atual, criando-o na primeira vez se ainda não existir. */
export async function getCurrentUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: DEFAULT_USER_EMAIL, name: DEFAULT_USER_NAME },
    });
  }
  return user;
}
