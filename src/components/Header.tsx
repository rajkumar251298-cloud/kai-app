"use client";

import { useAuth } from "@/components/AuthProvider";
import { getDisplayedStreak, ensureStreakProcessed } from "@/lib/streakSystem";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/board", label: "Team Board", icon: "👥" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
] as const;

const goldBorder = "border-[rgba(201,168,76,0.15)]";
const baseNav =
  "inline-flex origin-center rounded-xl border transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out";

const signInBtnClass =
  "kai-btn-shimmer inline-flex shrink-0 items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-black px-4 py-2 text-sm font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.65)] hover:text-[#F5F0E8]";

const MENU_ITEM =
  "flex min-h-[44px] w-full items-center px-4 py-2.5 text-left text-sm text-[#E8DCC8] transition hover:bg-[rgba(201,168,76,0.08)] hover:text-[#F5F0E8]";

function HeaderProfileAvatar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="h-10 w-10 shrink-0 rounded-full border border-transparent" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || "/")}`}
        className={signInBtnClass}
      >
        Sign in
      </Link>
    );
  }

  const meta = user.user_metadata as
    | { avatar_url?: string; picture?: string }
    | undefined;
  const avatarUrl = meta?.avatar_url ?? meta?.picture ?? null;
  const initial = user.email?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <Link
      href="/profile"
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgba(201,168,76,0.4)] bg-[#111111] text-sm font-semibold text-[#C9A84C] shadow-[0_0_16px_rgba(201,168,76,0.15)] transition hover:border-[rgba(201,168,76,0.55)]"
      aria-label="Profile"
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </Link>
  );
}

function KaiBrandMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={wrapRef} className="relative flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2.5 rounded-xl pr-1 outline-none ring-[rgba(201,168,76,0.35)] transition hover:opacity-95 focus-visible:ring-2 sm:gap-3 sm:pr-2"
        aria-label="KAI home"
        onClick={close}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.28)] bg-black text-lg leading-none text-[#C9A84C] shadow-[0_0_20px_rgba(201,168,76,0.18)]"
          aria-hidden
        >
          ⚡
        </div>
        <div className="min-w-0 text-left">
          <p className="kai-heading text-[18px] font-semibold leading-tight">
            KAI
          </p>
          <p className="text-[10px] leading-tight text-[#E8DCC8]/75">
            Keep At It
          </p>
        </div>
      </Link>

      <button
        type="button"
        className="flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-[#C9A84C]/90 transition hover:border-[rgba(201,168,76,0.22)] hover:bg-[rgba(201,168,76,0.06)]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="KAI menu: check-in, settings, contact"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-lg leading-none" aria-hidden>
          ⋮
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[60] w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.28)] bg-[#111111] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.75),0_0_24px_rgba(201,168,76,0.1)]"
          role="menu"
        >
          <Link
            href="/chat?mode=checkin"
            role="menuitem"
            className={MENU_ITEM}
            onClick={close}
          >
            <span className="mr-2" aria-hidden>
              ☀️
            </span>
            Daily check-in
          </Link>
          <Link
            href="/profile#account"
            role="menuitem"
            className={MENU_ITEM}
            onClick={close}
          >
            <span className="mr-2" aria-hidden>
              ⚙️
            </span>
            Profile &amp; settings
          </Link>
          <Link
            href="/profile#support"
            role="menuitem"
            className={MENU_ITEM}
            onClick={close}
          >
            <span className="mr-2" aria-hidden>
              ✉️
            </span>
            Contact us
          </Link>
          <div className="my-1 border-t border-[rgba(201,168,76,0.12)]" />
          <Link
            href="/privacy"
            role="menuitem"
            className={`${MENU_ITEM} text-[#E8DCC8]/85`}
            onClick={close}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            role="menuitem"
            className={`${MENU_ITEM} text-[#E8DCC8]/85`}
            onClick={close}
          >
            Terms of Service
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const read = () => {
      ensureStreakProcessed();
      setStreak(getDisplayedStreak());
    };
    queueMicrotask(read);
    const onUp = () => queueMicrotask(read);
    window.addEventListener("kai-streak-updated", onUp);
    window.addEventListener("focus", onUp);
    return () => {
      window.removeEventListener("kai-streak-updated", onUp);
      window.removeEventListener("focus", onUp);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b ${goldBorder} bg-black/80 backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <KaiBrandMenu />

        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <span
            className="hidden items-center gap-1 rounded-full border border-[rgba(201,168,76,0.28)] bg-[#111111] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#C9A84C] sm:inline-flex"
            title="Check-in streak"
          >
            <span aria-hidden>🔥</span>
            {streak}
          </span>
          <HeaderProfileAvatar />

          <nav
            className="hidden items-center gap-2 sm:gap-3 md:flex"
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
      </div>
    </header>
  );
}
