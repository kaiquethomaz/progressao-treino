import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, hasPasswordConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  // Se ninguém definiu senha ainda, manda para a configuração inicial.
  const configured = await hasPasswordConfigured();
  if (!configured) redirect("/setup");

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent text-2xl text-accent-contrast">
          🏋️
        </div>
        <h1 className="mt-3 text-2xl font-extrabold uppercase tracking-tight">
          Progressão
        </h1>
        <p className="mt-1 text-sm text-muted">Entre para ver seus treinos.</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Primeira vez?{" "}
        <Link href="/setup" className="text-accent hover:underline">
          Configurar senha
        </Link>
      </p>
    </div>
  );
}
