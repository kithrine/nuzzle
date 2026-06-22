import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TopNav } from "@/components/layout/TopNav";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { PageTransition } from "@/components/layout/PageTransition";
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
  title: "Nuzzle",
  description: "Find a dog that fits your lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body className="min-h-screen flex flex-col bg-background text-text-primary antialiased">
          <TopNav />
          <PageTransition className="flex-1 pb-16 md:pb-0">{children}</PageTransition>
          <ConditionalFooter />
          <BottomTabBar />
        </body>
      </html>
    </ClerkProvider>
  );
}
