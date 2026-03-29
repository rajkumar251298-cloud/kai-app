"use client";

import { getStoredUserName } from "@/lib/kaiLocalProfile";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function postLoginRoute(): string {
  const hasName = getStoredUserName()?.trim();
  return hasName ? "/" : "/onboarding";
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.53 39.5 48 32.42 48 24c0-.79-.04-1.57-.1-2.35z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextDefault = safeNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rememberNext = useCallback(() => {
    sessionStorage.setItem("kaiAuthNext", nextDefault);
  }, [nextDefault]);

  const handleGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Auth coming soon — finish Supabase setup in .env.local");
      return;
    }
    setBusy(true);
    rememberNext();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (err) setError(err.message);
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicSent(false);
    if (!isSupabaseConfigured) {
      setError("Auth coming soon — finish Supabase setup in .env.local");
      return;
    }
    const em = email.trim();
    if (!em) {
      setError("Enter your email");
      return;
    }
    setBusy(true);
    rememberNext();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: em,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMagicSent(true);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Auth coming soon — finish Supabase setup in .env.local");
      return;
    }
    const em = email.trim();
    if (!em) {
      setError("Enter your email");
      return;
    }
    if (!showPassword) {
      setShowPassword(true);
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    rememberNext();
    const { data, error: err } = await supabase.auth.signUp({
      email: em,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      router.replace(postLoginRoute());
    } else {
      setMagicSent(true);
      setError(null);
    }
  };

  const inputClass =
    "min-h-[48px] w-full rounded-xl border border-[rgba(201,168,76,0.28)] bg-black px-4 py-3 text-[15px] text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.55)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.12)]";

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <section className="flex min-h-[40vh] flex-col items-center justify-center px-6 pt-10 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#5c4a22] shadow-[0_0_40px_rgba(201,168,76,0.25)]">
          <span className="text-3xl text-black" aria-hidden>
            ⚡
          </span>
        </div>
        <h1 className="kai-heading mt-6 text-5xl font-bold tracking-[0.04em] text-white">
          KAI
        </h1>
        <p className="mt-1 text-sm font-medium tracking-[0.25em] text-[#C9A84C]">
          Keep At It
        </p>
        <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-[#E8DCC8]/80">
          Your personal accountability coach
        </p>
      </section>

      <motion.section
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="flex min-h-[60vh] flex-1 flex-col rounded-t-[28px] border border-b-0 border-[rgba(201,168,76,0.2)] bg-[#111111] px-5 pb-10 pt-8"
      >
        <h2 className="text-center text-xl font-semibold text-white">
          Continue to KAI
        </h2>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-xl border border-[rgba(201,168,76,0.35)] bg-black/60 px-4 py-3 text-center text-sm text-[#C9A84C]/95">
            Auth coming soon — finish Supabase setup (NEXT_PUBLIC_SUPABASE_URL
            and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local).
          </p>
        )}

        {magicSent && (
          <p
            className="mt-4 text-center text-sm font-medium text-[#C9A84C]"
            role="status"
          >
            Check your inbox — link sent ✉️
          </p>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-400/90" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="kai-btn-shimmer flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-[rgba(201,168,76,0.45)] bg-black px-4 text-[15px] font-medium text-white transition hover:border-[rgba(201,168,76,0.65)] disabled:opacity-50"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[rgba(201,168,76,0.15)]" />
            <span className="text-xs font-medium uppercase tracking-wider text-[#E8DCC8]/45">
              or
            </span>
            <div className="h-px flex-1 bg-[rgba(201,168,76,0.15)]" />
          </div>

          <input
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          {showPassword && (
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          )}

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={busy}
            className="kai-btn-shimmer flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.2)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-[15px] font-semibold text-black/90 disabled:opacity-50"
          >
            Send me a magic link
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={busy}
            className="kai-btn-shimmer flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-black text-[15px] font-medium text-[#C9A84C] disabled:opacity-50"
          >
            Create account
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-[#E8DCC8]/40">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-[#C9A84C]/80 underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#C9A84C]/80 underline">
            Privacy Policy
          </Link>
          .
        </p>

        <Link
          href="/"
          className="mt-6 text-center text-sm text-[#E8DCC8]/55 hover:text-[#C9A84C]"
        >
          ← Back to home
        </Link>
      </motion.section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-[#E8DCC8]/50">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
