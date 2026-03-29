"use client";

import { usePathname } from "next/navigation";
import { KaiProgressBubble } from "@/components/KaiProgressBubble";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome =
    pathname === "/splash" ||
    pathname.startsWith("/splash/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/auth/callback" ||
    pathname.startsWith("/auth/callback/");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <MobileBottomNav />
      <KaiProgressBubble />
    </>
  );
}
