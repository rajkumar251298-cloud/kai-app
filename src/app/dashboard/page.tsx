import { DashboardView } from "@/components/dashboard/DashboardView";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen flex-col bg-black"
          aria-busy="true"
          aria-label="Loading dashboard"
        />
      }
    >
      <DashboardView />
    </Suspense>
  );
}
