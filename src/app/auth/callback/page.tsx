"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
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

      const hasName = localStorage.getItem("userName")?.trim();
      const next = safeNextPath(sessionStorage.getItem("kaiAuthNext"));
      sessionStorage.removeItem("kaiAuthNext");
      router.replace(hasName ? next : "/onboarding");
    };

    void run();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-sm text-[#E8DCC8]">
      {message}
    </div>
  );
}
