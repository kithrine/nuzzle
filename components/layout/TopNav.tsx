"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { NuzzleLogo } from "./NuzzleLogo";

export function TopNav() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();

  // Home matches only "/"; other links match their path or sub-paths.
  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  function linkClass(href: string): string {
    return `hidden md:block text-sm font-medium transition-colors ${
      isActive(href) ? "text-primary" : "text-text-secondary hover:text-text-primary"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <NuzzleLogo size={40} />
          <span className="text-xl font-semibold text-text-primary">Nuzzle</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>
          <Link href="/search" className={linkClass("/search")}>
            Browse Dogs
          </Link>
          {isLoaded && isSignedIn && (
            <Link href="/favorites" className={linkClass("/favorites")}>
              Dashboard
            </Link>
          )}

          {isLoaded &&
            (isSignedIn ? (
              <UserButton />
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity hover-press"
              >
                Log In
              </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
