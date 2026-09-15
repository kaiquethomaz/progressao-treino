"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, NAV } from "@/components/nav-icons";

const HIDDEN_ON = ["/login", "/setup"];

export function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 py-1.5">
        {NAV.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          if (link.primary) {
            return (
              <li key={link.href} className="flex justify-center">
                <Link
                  href={link.href}
                  aria-label={link.short}
                  className="-mt-5 flex flex-col items-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-contrast shadow-lg shadow-accent/20">
                    <Icon name={link.icon} />
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[0.65rem] font-medium transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon name={link.icon} />
                {link.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
