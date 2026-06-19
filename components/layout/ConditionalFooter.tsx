"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";

// The footer appears on every page except the auth (login/signup) screens,
// which are kept clean per the UX spec.
export function ConditionalFooter() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }
  return <SiteFooter />;
}
