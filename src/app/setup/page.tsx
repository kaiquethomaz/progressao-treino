import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasPasswordConfigured } from "@/lib/auth";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  // Setup é só na primeira vez: se já há senha, vai para o login.
  const configured = await hasPasswordConfigured();
  if (configured) redirect("/login");

  // Pré-preenche com o usuário do seed, se existir.
  const existing = await prisma.user.findFirst({
    select: { email: true, name: true },
  });

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="mb-6 text-center">
        <div className="text-3xl">🏋️</div>
        <h1 className="mt-2 text-2xl font-bold">Bem-vindo!</h1>
        <p className="mt-1 text-sm text-muted">
          Crie sua senha para proteger o app.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <SetupForm
          defaultEmail={existing?.email}
          defaultName={existing?.name}
        />
      </div>
    </div>
  );
}
