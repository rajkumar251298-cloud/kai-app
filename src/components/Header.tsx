"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/board", label: "Team Board", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-md"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-lg leading-none shadow-sm"
            aria-hidden
          >
            ⚡
          </div>
          <div className="min-w-0">
            <p
              className="text-[18px] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
            >
              KAI
            </p>
            <p
              className="text-[10px] leading-tight text-[#9CA3AF]"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Keep At It
            </p>
          </div>
        </div>

        <nav
          className="flex shrink-0 items-center gap-2 sm:gap-3"
          aria-label="Main"
        >
          <Link
            href="/onboarding"
            className={
              pathname === "/onboarding"
                ? "rounded-lg border border-[#7C3AED] bg-[#7C3AED]/15 px-3 py-1.5 text-sm font-medium text-white transition-colors"
                : "rounded-lg border border-transparent bg-[#12121C] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
            }
            aria-current={pathname === "/onboarding" ? "page" : undefined}
          >
            Start
          </Link>
          {nav.map(({ href, label, icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex h-10 w-10 items-center justify-center rounded-lg border border-[#7C3AED] bg-[#7C3AED]/15 text-lg transition-colors"
                    : "flex h-10 w-10 items-center justify-center rounded-lg border border-transparent bg-[#12121C] text-lg text-white transition-colors hover:bg-white/[0.06]"
                }
              >
                <span aria-hidden>{icon}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
