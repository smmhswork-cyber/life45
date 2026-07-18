import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { NavSidebar } from "@/components/nav-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { GoogleAuthProvider } from "@/components/auth/google-auth-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life45 — A personal management app",
  description:
    "Life45 is a personal management app for tasks, habits, goals, journaling, your calendar, and class-period-tagged assignments. Local-first, calm, fast.",
  applicationName: "Life45",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1612" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Google OAuth context lives entirely client-side; this thin wrapper
            preserves the server-component boundary on the root layout. */}
        <GoogleAuthProvider>
          <div className="min-h-screen flex">
            <NavSidebar />
            <div className="flex-1 min-w-0 flex flex-col">
              <MobileNav />
              <main className="flex-1 px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14 max-w-6xl w-full mx-auto">
                {children}
              </main>
              <footer className="px-6 py-6 text-center text-[11px] tracking-[0.18em] uppercase text-[var(--color-muted-foreground)]">
                Life45 · Made for the things that matter
              </footer>
            </div>
          </div>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
