"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword, type AuthState } from "@/lib/actions/auth";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    changePassword,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={action} className="max-w-sm space-y-4">
      <div>
        <label className="mb-1 block text-xs text-muted">Senha atual</label>
        <input
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">Nova senha</label>
        <input
          name="new"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted">
          Confirmar nova senha
        </label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-accent">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
