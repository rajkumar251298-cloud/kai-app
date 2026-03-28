"use client";

import { usePathname } from "next/navigation";

/**
 * Subtle fade + slide-up on route change (keyed by pathname).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="kai-page-enter">
      {children}
    </div>
  );
}
