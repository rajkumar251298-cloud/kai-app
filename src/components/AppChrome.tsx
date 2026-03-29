"use client";

import { AppBootstrap } from "@/components/AppBootstrap";
import {
  DesktopQuickNav,
  desktopQuickNavActivePath,
} from "@/components/DesktopQuickNav";
import { KaiProgressBubble } from "@/components/KaiProgressBubble";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { usePathname } from "next/navigation";

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

  const padDesktopQuick = desktopQuickNavActivePath(pathname);

  return (
    <>
      <div className={padDesktopQuick ? "md:pb-[52px]" : undefined}>
        {children}
      </div>
      <MobileBottomNav />
      <DesktopQuickNav />
      <KaiProgressBubble />
      <AppBootstrap />
    </>
  );
}
