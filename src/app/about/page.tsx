import { Header } from "@/components/Header";
import Link from "next/link";

const CARD =
  "rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)]";

export default function AboutPage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-black"
      style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 space-y-10 px-6 pb-16 pt-8 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <h1
          className="kai-heading text-center text-3xl font-semibold tracking-[0.05em] text-[#F5F0E8] sm:text-4xl"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Who is KAI for?
        </h1>

        <section className="space-y-4 text-[15px] leading-relaxed text-[#E8DCC8]">
          <h2 className="kai-heading text-lg font-semibold text-[#C9A84C]">
            The short answer
          </h2>
          <p>
            KAI is for anyone who keeps saying they&apos;ll start tomorrow.
            Anyone who sets goals and loses steam. Anyone who knows what they
            need to do but keeps not doing it.
          </p>
          <p className="font-medium text-[#F5F0E8]">
            If that&apos;s you — KAI is for you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="kai-heading text-lg font-semibold text-[#C9A84C]">
            Built for real seasons of life
          </h2>
          <div className="space-y-4">
            <article className={CARD}>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                🎓 Students (16-22)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E8DCC8]">
                You&apos;re preparing for exams, building skills, or starting
                your career. KAI helps you study consistently, stay focused during
                exam season, and build the habits that will define your 20s.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[#E8DCC8]/45">
                Best for
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/85">
                Board exams, entrance tests, college projects, skill building
              </p>
            </article>

            <article className={CARD}>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                💼 Young Professionals (22-30)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E8DCC8]">
                You&apos;re in the early stages of your career, maybe building a
                side project, trying to get promoted, or figuring out your
                direction. KAI keeps you accountable to the version of yourself
                you&apos;re trying to become.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[#E8DCC8]/45">
                Best for
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/85">
                Career growth, skill development, side hustles, fitness goals
              </p>
            </article>

            <article className={CARD}>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                🚀 Entrepreneurs &amp; Founders
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E8DCC8]">
                You&apos;re building something. There is no boss, no structure,
                no one holding you to your deadlines except you. KAI becomes that
                accountability layer — showing up every morning asking what
                you&apos;re shipping today.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[#E8DCC8]/45">
                Best for
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/85">
                Startups, freelancers, product builders, creators
              </p>
            </article>

            <article className={CARD}>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                👔 Senior Professionals (30+)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E8DCC8]">
                You have experience, you know what to do, but you&apos;re pulled
                in every direction. KAI helps you protect your most important
                priorities and stay focused on what actually matters.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[#E8DCC8]/45">
                Best for
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/85">
                Leadership goals, team building, work-life balance, major
                career transitions
              </p>
            </article>

            <article className={CARD}>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                👥 Teams
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#E8DCC8]">
                KAI&apos;s team board gives managers visibility into who is
                stuck, who is moving, and who needs support — without
                micromanaging. Daily check-ins become a culture, not a chore.
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-[#E8DCC8]/45">
                Best for
              </p>
              <p className="mt-1 text-sm text-[#E8DCC8]/85">
                Remote teams, startup teams, project groups, study groups
              </p>
            </article>
          </div>
        </section>

        <section className={`${CARD} border-[rgba(180,80,80,0.25)]`}>
          <h2 className="kai-heading text-lg font-semibold text-[#F5F0E8]">
            KAI is NOT for
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#E8DCC8]">
            KAI is not a task manager. It will not organise your calendar. It
            is not a therapist or medical tool. It will not do the work for you.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#E8DCC8]">
            KAI is a coach. Coaches push. They ask hard questions. They hold
            you to what you said.
          </p>
          <p className="mt-4 text-sm font-medium text-[#F5F0E8]">
            If you want to be comfortable — there are better apps.
          </p>
          <p className="mt-2 text-sm font-medium text-[#C9A84C]">
            If you want to grow — KAI is ready when you are. ⚡
          </p>
        </section>

        <Link
          href="/onboarding"
          className="kai-btn-shimmer flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[rgba(201,168,76,0.45)] bg-gradient-to-br from-[#C9A84C] to-[#F5E6B3] text-sm font-semibold text-black/90"
        >
          Start with KAI →
        </Link>
      </main>
    </div>
  );
}
