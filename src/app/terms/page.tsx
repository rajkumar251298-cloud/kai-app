import { Header } from "@/components/Header";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-4 px-4 pb-10 pt-6 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <Link
          href="/profile"
          className="text-sm font-medium text-[#C9A84C]/90 hover:text-[#F5E6B3]"
        >
          ← Back to profile
        </Link>
        <h1 className="kai-heading text-2xl font-semibold text-[#F5F0E8]">
          Terms of Service
        </h1>
        <div className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 text-sm leading-relaxed text-[#E8DCC8]/85">
          <p>
            This is a placeholder terms of service for KAI. Final terms will
            outline acceptable use, disclaimers, and limitations of liability.
          </p>
          <p className="mt-4 text-[#E8DCC8]/55">
            Last updated: March 2026
          </p>
        </div>
      </main>
    </div>
  );
}
