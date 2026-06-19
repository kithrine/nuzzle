"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { NuzzleLogo } from "./NuzzleLogo";

export function TopNav() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <NuzzleLogo size={32} />
          <span className="text-xl font-semibold text-text-primary">Nuzzle</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="hidden md:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Browse Dogs
          </Link>

          {isLoaded && (
            isSignedIn ? (
              <UserButton />
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Log In
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
