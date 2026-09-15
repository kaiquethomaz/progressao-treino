"use client";

import { useActionState } from "react";
import { setupPassword, type AuthState } from "@/lib/actions/auth";

export function SetupForm({
  defaultEmail,
  defaultName,
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    setupPassword,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-muted">Nome</label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Email</label>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="username"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Senha</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Confirmar senha</label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Criar senha e entrar"}
      </button>
    </form>
  );
}
