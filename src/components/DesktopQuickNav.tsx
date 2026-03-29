"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function showDesktopQuickNav(pathname: string) {
  if (
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms")
  ) {
    return false;
  }
  return (
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/board") ||
    pathname.startsWith("/profile")
  );
}

/** Text links for md+; gold when route matches, white/50 when not. */
export function DesktopQuickNav() {
  const pathname = usePathname();
  if (!showDesktopQuickNav(pathname)) return null;

  const linkClass = (active: boolean) =>
    `transition-colors duration-200 ${
      active
        ? "text-[#C9A84C]"
        : "text-white/50 hover:text-[#C9A84C]/80"
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] hidden h-[52px] items-center justify-center gap-x-8 border-t border-[rgba(201,168,76,0.2)] bg-[#0A0A0A] pb-[env(safe-area-inset-bottom,0px)] text-xs font-medium md:flex"
      aria-label="Quick navigation"
    >
      <Link
        href="/dashboard"
        className={linkClass(
          pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/board"
        className={linkClass(
          pathname === "/board" || pathname.startsWith("/board/"),
        )}
      >
        Team Board
      </Link>
      <Link
        href="/profile"
        className={linkClass(
          pathname === "/profile" || pathname.startsWith("/profile/"),
        )}
      >
        Profile
      </Link>
    </nav>
  );
}

export function desktopQuickNavActivePath(pathname: string): boolean {
  return showDesktopQuickNav(pathname);
}
