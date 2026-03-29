"use client";

import { safeNextPath } from "@/lib/authPaths";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { syncUserProfileToSupabase } from "@/lib/syncUserProfileToSupabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Setting things up…");

  useEffect(() => {
    const handleLogin = async () => {
      if (!isSupabaseConfigured) {
        setMessage("Auth isn’t configured yet.");
        router.replace("/login");
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          router.replace("/login");
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr || !data.user) {
        router.replace("/login");
        return;
      }

      await syncUserProfileToSupabase(data.user);

      // Keep userName / userGoal / checkInTime in localStorage — KAI reads them on home, chat, profile.

      const hasName = localStorage.getItem("userName")?.trim();
      const next = safeNextPath(sessionStorage.getItem("kaiAuthNext"));
      sessionStorage.removeItem("kaiAuthNext");
      router.replace(hasName ? next : "/onboarding");
    };

    void handleLogin();
  }, [router]);

  return (
    <div className="flex h-screen min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-sm text-[#C9A84C]">{message}</p>
    </div>
  );
}
