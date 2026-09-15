"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteSession } from "@/lib/actions/sessions";

export function SessionActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm("Excluir este treino? Esta ação não pode ser desfeita.")) {
      return;
    }
    startTransition(async () => {
      await deleteSession(sessionId);
      router.push("/");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/treino/${sessionId}/editar`}
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground"
      >
        Editar
      </Link>
      <button
        onClick={remove}
        disabled={pending}
        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:border-danger/40 hover:text-danger disabled:opacity-50"
      >
        {pending ? "Excluindo..." : "Excluir"}
      </button>
    </div>
  );
}
