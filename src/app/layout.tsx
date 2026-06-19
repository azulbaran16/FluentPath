import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluentPath — Speak English for real life",
  description:
    "Practice every real-life English scenario — social, work, travel — with an AI tutor that talks, listens and corrects you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} h-full`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
