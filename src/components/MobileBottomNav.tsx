"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "KAI", icon: "⚡" },
  { href: "/board", label: "Board", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[70] border-t border-[rgba(201,168,76,0.2)] bg-[#0A0A0A] pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
        {tabs.map(({ href, label, icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5"
              aria-current={active ? "page" : undefined}
            >
              <div className="flex h-3 w-full items-end justify-center">
                <span
                  className={`mb-0.5 h-1 w-1 rounded-full shadow-[0_0_8px_rgba(201,168,76,0.45)] ${
                    active ? "bg-[#C9A84C]" : "bg-transparent"
                  }`}
                  aria-hidden
                />
              </div>
              <span
                className={`text-2xl leading-none ${active ? "" : "opacity-50"}`}
                aria-hidden
              >
                {icon}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  active ? "text-[#C9A84C]" : "text-white/50"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
