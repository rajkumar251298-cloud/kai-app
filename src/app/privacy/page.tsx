import { Header } from "@/components/Header";
import { RouterBackButton } from "@/components/RouterBackButton";

const sectionTitle = "kai-heading mb-3 text-lg font-semibold tracking-[0.06em] text-[#F5F0E8]";
const body = "text-sm leading-relaxed text-[#E8DCC8]/90";
const list = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#E8DCC8]/90";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-0 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <RouterBackButton />
        <h1 className="kai-heading mt-4 text-3xl font-semibold tracking-[0.04em] text-[#F5F0E8] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#C9A84C]/85">
          Last updated: March 29, 2026
        </p>

        <div className="mt-8 space-y-10">
          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 1 — Introduction</h2>
            <p className={body}>
              KAI (Keep At It) is a personal accountability coaching application
              built to help individuals and teams achieve their goals through
              daily AI-powered check-ins, progress tracking, and habit building.
              This Privacy Policy explains how we collect, use, and protect your
              personal information when you use KAI.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 2 — Information We Collect</h2>
            <ul className={list}>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Account information:
                </span>{" "}
                Your name, email address, and Google account details when you
                sign in with Google OAuth
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Goal and progress data:
                </span>{" "}
                Your personal goals, daily check-in responses, task completions,
                and streak information
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Usage data:
                </span>{" "}
                How you interact with KAI including which features you use, game
                scores, quiz responses, and session frequency
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Device information:
                </span>{" "}
                Browser type, device type, and approximate location for
                personalising your experience
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Conversation data:
                </span>{" "}
                Your chat messages with KAI are processed to generate AI
                responses. These are not stored permanently beyond your active
                session unless you explicitly save them.
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">Game data:</span>{" "}
                Your daily puzzle completions, memory card scores, logic puzzle
                results, and habit quiz responses
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Level and badge data:
                </span>{" "}
                Your KAI level, earned badges, and streak points
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Notification preferences:
                </span>{" "}
                Whether you have enabled smart nudges and your preferred
                check-in time
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Age group and goal type:
                </span>{" "}
                Your selected user category and primary goal focus area to
                personalise your KAI experience
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 3 — How We Use Your Information</h2>
            <ul className={list}>
              <li>
                To provide personalised accountability coaching through
                KAI&apos;s AI system
              </li>
              <li>
                To track your goal progress and display your streaks and
                achievements
              </li>
              <li>To improve KAI&apos;s responses and coaching quality</li>
              <li>
                To send you daily check-in reminders at your chosen time (only if
                you enable notifications)
              </li>
              <li>To maintain your account and provide customer support</li>
              <li>We do NOT sell your personal data to third parties</li>
              <li>We do NOT use your data for advertising purposes</li>
              <li>
                We do NOT share your goals or conversations with other users or
                employers
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 4A — Games and Quiz Data</h2>
            <p className={body}>
              Your game scores, habit quiz responses, and daily reflection
              answers are stored locally on your device using browser
              localStorage. This data is not transmitted to our servers unless
              you are signed in with Google, in which case it may be synced to
              your account for backup purposes. You can clear this data at any
              time by clearing your browser&apos;s local storage or by deleting
              your account.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 4 — Data Storage and Security</h2>
            <ul className={list}>
              <li>
                Your data is stored securely using Supabase, a SOC 2 compliant
                database platform
              </li>
              <li>All data is encrypted in transit using TLS/SSL</li>
              <li>
                Your conversation data with KAI is processed through
                Anthropic&apos;s Claude API, which has its own privacy
                protections
              </li>
              <li>
                We retain your account data for as long as your account is
                active
              </li>
              <li>
                You can request deletion of all your data at any time by
                contacting{" "}
                <a
                  href="mailto:contactkai26@gmail.com"
                  className="text-[#C9A84C] underline hover:text-[#F5E6B3]"
                >
                  contactkai26@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 5 — Google Sign In</h2>
            <ul className={list}>
              <li>
                When you sign in with Google we receive your name, email address,
                and profile picture
              </li>
              <li>
                We do not receive your Google passwords or access to other Google
                services
              </li>
              <li>
                You can revoke KAI&apos;s access to your Google account at any
                time through your Google account settings
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 6 — Your Rights</h2>
            <ul className={list}>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Right to access:
                </span>{" "}
                Request a copy of all data we hold about you
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Right to correction:
                </span>{" "}
                Update or correct your personal information
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Right to deletion:
                </span>{" "}
                Request complete deletion of your account and data
              </li>
              <li>
                <span className="font-medium text-[#E8DCC8]">
                  Right to portability:
                </span>{" "}
                Export your goal and progress data
              </li>
              <li>
                To exercise any of these rights email us at{" "}
                <a
                  href="mailto:contactkai26@gmail.com"
                  className="text-[#C9A84C] underline hover:text-[#F5E6B3]"
                >
                  contactkai26@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 7 — Children&apos;s Privacy</h2>
            <p className={body}>
              KAI welcomes users from age 16 and above. For users aged 16-18, we
              recommend parental awareness of the app&apos;s goal-tracking and AI
              coaching features. KAI does not knowingly collect data from users
              under 16.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 8 — Changes to This Policy</h2>
            <p className={body}>
              We may update this Privacy Policy from time to time. We will notify
              you of significant changes by email or through a notice in the app.
              Continued use of KAI after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 9 — Contact</h2>
            <p className={body}>
              For any privacy related questions or requests:
            </p>
            <p className={`${body} mt-3`}>
              Email:{" "}
              <a
                href="mailto:contactkai26@gmail.com"
                className="font-medium text-[#C9A84C] underline hover:text-[#F5E6B3]"
              >
                contactkai26@gmail.com
              </a>
            </p>
            <p className={`${body} mt-2`}>
              App:{" "}
              <a
                href="https://kai-app-beige.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#C9A84C] underline hover:text-[#F5E6B3]"
              >
                kai-app-beige.vercel.app
              </a>
            </p>
            <p className={`${body} mt-2`}>Response time: Within 48 hours</p>
          </section>
        </div>
      </main>
    </div>
  );
}
