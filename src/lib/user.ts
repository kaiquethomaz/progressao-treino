import { requireUser } from "@/lib/auth";

// App com login único. Todas as páginas e server actions chamam getCurrentUser(),
// que agora exige uma sessão válida — se não houver, redireciona para /login.
export async function getCurrentUser() {
  return requireUser();
}
