"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/board", label: "Team Board", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
] as const;

const goldBorder = "border-[rgba(201,168,76,0.15)]";
const baseNav =
  "inline-flex origin-center rounded-xl border transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out";

export function Header() {
  const pathname = usePathname();

  return (
    <header
      className={`sticky top-0 z-50 border-b ${goldBorder} bg-black/80 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.28)] bg-black text-lg leading-none text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.18)]"
            aria-hidden
          >
            ⚡
          </div>
          <div className="min-w-0">
            <p className="kai-heading text-[18px] font-semibold leading-tight">
              KAI
            </p>
            <p className="text-[10px] leading-tight text-[#E8DCC8]/75">
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
                ? `${baseNav} kai-btn kai-btn-shimmer kai-nav-active scale-105 border-[rgba(201,168,76,0.4)] px-3 py-1.5 text-sm font-medium text-[#F5F0E8]`
                : `${baseNav} kai-btn kai-btn-shimmer scale-100 border-transparent bg-[#111111] px-3 py-1.5 text-sm font-medium text-[#E8DCC8] hover:border-[rgba(201,168,76,0.2)]`
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
                    ? `${baseNav} kai-btn kai-btn-shimmer kai-nav-active scale-105 flex h-10 w-10 items-center justify-center border-[rgba(201,168,76,0.4)]`
                    : `${baseNav} kai-btn kai-btn-shimmer flex h-10 w-10 scale-100 items-center justify-center border-transparent bg-[#111111] hover:border-[rgba(201,168,76,0.15)]`
                }
              >
                <span
                  aria-hidden
                  className={
                    active
                      ? "text-lg opacity-100 drop-shadow-[0_0_10px_rgba(201,168,76,0.35)]"
                      : "text-lg opacity-[0.7]"
                  }
                >
                  {icon}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
