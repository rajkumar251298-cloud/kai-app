import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { AppChrome } from "@/components/AppChrome";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/components/AuthProvider";
import { SplashGate } from "@/components/SplashGate";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KAI — Keep At It",
  description: "Your personal accountability coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-black font-[family-name:var(--font-dm-sans)] text-[#E8DCC8] antialiased"
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <Suspense
          fallback={<div className="min-h-screen bg-black" aria-hidden />}
        >
          <SplashGate>
            <AuthProvider>
              <AuthGate>
                <AppChrome>{children}</AppChrome>
              </AuthGate>
            </AuthProvider>
          </SplashGate>
        </Suspense>
      </body>
    </html>
  );
}
