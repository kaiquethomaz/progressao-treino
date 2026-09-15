"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const AUTH_ROUTES = ["/login", "/setup"];

export function Shell({
  children,
  topbar,
}: {
  children: ReactNode;
  topbar: ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.includes(pathname);

  return (
    <div className={`flex min-h-full flex-col ${isAuth ? "" : "md:pl-60"}`}>
      {topbar}
      <main
        className={`mx-auto w-full max-w-6xl flex-1 px-4 pt-8 ${
          isAuth ? "" : "pb-24 md:pb-8 md:pt-10"
        }`}
      >
        {children}
      </main>
      {!isAuth && (
        <footer className="border-t border-border py-6 pb-24 text-center text-xs text-muted md:pb-6">
          Progressão de Treino · feito com Next.js, Prisma e PostgreSQL
        </footer>
      )}
    </div>
  );
}
