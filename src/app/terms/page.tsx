import { Header } from "@/components/Header";
import { RouterBackButton } from "@/components/RouterBackButton";

const sectionTitle = "kai-heading mb-3 text-lg font-semibold tracking-[0.06em] text-[#F5F0E8]";
const body = "text-sm leading-relaxed text-[#E8DCC8]/90";
const list = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#E8DCC8]/90";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-0 max-md:pb-[calc(80px+env(safe-area-inset-bottom,0px))] max-md:text-[15px]">
        <RouterBackButton />
        <h1 className="kai-heading mt-4 text-3xl font-semibold tracking-[0.04em] text-[#F5F0E8] sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[#C9A84C]/85">Last updated: March 2026</p>

        <div className="mt-8 space-y-10">
          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 1 — Acceptance of Terms</h2>
            <p className={body}>
              By creating an account or using KAI you agree to these Terms of
              Service. If you do not agree please do not use KAI. These terms
              apply to all users including individuals and team accounts.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 2 — Description of Service</h2>
            <p className={`${body} mb-3`}>
              KAI is an AI-powered personal accountability coaching application
              that provides:
            </p>
            <ul className={list}>
              <li>Daily check-in conversations powered by AI</li>
              <li>Goal setting and progress tracking</li>
              <li>Team accountability boards</li>
              <li>Mind games and habit quizzes</li>
              <li>Personal dashboard and streak tracking</li>
            </ul>
            <p className={`${body} mt-4`}>
              KAI is a productivity and coaching tool. It is not a substitute for
              professional mental health support, medical advice, or professional
              coaching.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 3 — User Accounts</h2>
            <ul className={list}>
              <li>You must be 16 years or older to use KAI</li>
              <li>
                You are responsible for maintaining the security of your account
                credentials
              </li>
              <li>
                You must provide accurate information when creating your account
              </li>
              <li>One person may not maintain multiple accounts</li>
              <li>
                You are responsible for all activity that occurs under your
                account
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 4 — Acceptable Use</h2>
            <p className={`${body} mb-2`}>You agree NOT to:</p>
            <ul className={list}>
              <li>Use KAI for any unlawful purpose</li>
              <li>
                Attempt to hack, reverse engineer, or disrupt the KAI service
              </li>
              <li>Share your account with others</li>
              <li>Use KAI to harass, abuse, or harm others</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to access other users data</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 5 — Subscription and Payments</h2>
            <ul className={list}>
              <li>KAI offers a free tier with limited features</li>
              <li>Premium plans are available at published rates</li>
              <li>Payments are processed securely through Stripe</li>
              <li>
                Subscriptions auto-renew unless cancelled before the renewal date
              </li>
              <li>
                Refunds are available within 7 days of payment if you are not
                satisfied
              </li>
              <li>
                To cancel or request a refund contact{" "}
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
            <h2 className={sectionTitle}>SECTION 6 — AI Coaching Disclaimer</h2>
            <ul className={list}>
              <li>
                KAI&apos;s coaching responses are generated by artificial
                intelligence
              </li>
              <li>
                KAI is not a licensed therapist, counsellor, or professional
                coach
              </li>
              <li>
                KAI&apos;s responses are for motivational and productivity
                purposes only
              </li>
              <li>
                Do not rely on KAI for medical, legal, financial, or mental health
                decisions
              </li>
              <li>
                If you are experiencing a mental health crisis please contact a
                qualified professional
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 7 — Intellectual Property</h2>
            <ul className={list}>
              <li>
                KAI and all its content, features, and functionality are owned by
                KAI and protected by copyright law
              </li>
              <li>
                You may not copy, modify, distribute, or create derivative works
                from KAI
              </li>
              <li>Your personal data and goals remain your own property</li>
              <li>Feedback you provide to KAI may be used to improve the service</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 8 — Termination</h2>
            <ul className={list}>
              <li>
                You may delete your account at any time through the profile page
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that
                violate these terms
              </li>
              <li>
                Upon termination your data will be deleted within 30 days unless
                legally required to retain it
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 9 — Limitation of Liability</h2>
            <p className={body}>
              KAI is provided on an as-is basis. We do not guarantee that KAI
              will help you achieve your goals. Results depend entirely on your
              own actions and commitment. KAI shall not be liable for any
              indirect, incidental, or consequential damages arising from your use
              of the service.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 10 — Governing Law</h2>
            <p className={body}>
              These terms are governed by the laws of India. Any disputes shall
              be resolved through arbitration in Chennai, Tamil Nadu.
            </p>
          </section>

          <section className="rounded-2xl border border-[rgba(201,168,76,0.18)] bg-[#111111] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.55)] sm:p-6">
            <h2 className={sectionTitle}>SECTION 11 — Contact</h2>
            <p className={body}>For any questions about these Terms of Service:</p>
            <p className={`${body} mt-3`}>
              Email:{" "}
              <a
                href="mailto:contactkai26@gmail.com"
                className="font-medium text-[#C9A84C] underline hover:text-[#F5E6B3]"
              >
                contactkai26@gmail.com
              </a>
            </p>
            <p className={`${body} mt-2`}>Response time: Within 48 hours</p>
          </section>
        </div>
      </main>
    </div>
  );
}
