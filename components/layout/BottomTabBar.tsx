"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill={active ? "currentColor" : "none"} strokeWidth={active ? 0 : 2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const tabs = [
  { label: "Home", basePath: "/", icon: HomeIcon, anonHref: "/", authHref: "/" },
  { label: "Browse", basePath: "/search", icon: SearchIcon, anonHref: "/search", authHref: "/search" },
  { label: "Favorites", basePath: "/favorites", icon: HeartIcon, anonHref: "/login", authHref: "/favorites" },
  { label: "Profile", basePath: "/questionnaire", icon: PersonIcon, anonHref: "/login", authHref: "/questionnaire" },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-border">
      <div className="flex items-stretch">
        {tabs.map(({ label, basePath, icon: Icon, anonHref, authHref }) => {
          const isActive =
            basePath === "/"
              ? pathname === "/"
              : pathname === basePath || pathname.startsWith(basePath + "/");
          const href = isSignedIn ? authHref : anonHref;

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <Icon active={isActive} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
