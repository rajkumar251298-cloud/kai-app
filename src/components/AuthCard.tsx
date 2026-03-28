"use client";

import { supabase } from "@/lib/supabase";
import { FormEvent, useState } from "react";

export default function AuthCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  const signInWithGoogle = async () => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: origin ? `${origin}/` : undefined,
      },
    });
    if (error) setErrorMessage(error.message);
  };

  const signInWithEmail = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setErrorMessage(null);
    setStatus("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: origin ? `${origin}/` : undefined,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  };

  const onEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    void signInWithEmail(email);
  };

  return (
    <div className="kai-card mt-6 p-6">
      <p className="mb-4 text-sm leading-relaxed text-[#E8DCC8]">
        Before we go further — I want to remember this properly.
      </p>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="kai-btn kai-btn-shimmer mb-3 w-full rounded-xl border border-[rgba(201,168,76,0.38)] py-3 text-[15px] font-medium text-[#F5F0E8] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
      >
        Continue with Google
      </button>

      <form onSubmit={onEmailSubmit} className="space-y-2">
        <label htmlFor="auth-email" className="sr-only">
          Email
        </label>
        <input
          id="auth-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          className="w-full rounded-xl border border-[rgba(201,168,76,0.22)] bg-black p-3 text-[15px] text-[#F5F0E8] placeholder:text-[#E8DCC8]/35 focus:border-[rgba(201,168,76,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(201,168,76,0.12)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="kai-btn-shimmer w-full rounded-xl border border-[rgba(201,168,76,0.35)] bg-black py-2.5 text-sm font-medium text-[#C9A84C] transition hover:border-[rgba(201,168,76,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "Sending…" : "Email me a login link"}
        </button>
      </form>

      {status === "sent" && (
        <p className="mt-3 text-sm text-[#C9A84C]/90" role="status">
          Check your email for the login link.
        </p>
      )}

      {errorMessage && (
        <p className="mt-3 text-sm text-[#E8DCC8]/75" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
