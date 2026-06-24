"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Fades the page content in on arrival. Keyed by the top-level path segment so
 * the fade replays on client-side navigation between sections, while NOT
 * remounting on intra-section URL changes — which would break Clerk's
 * path-routed multi-step SignIn/SignUp flows (e.g. /login -> /login/factor-one,
 * /signup -> /signup/verify-email-address). Reduced-motion safe (CSS).
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  return (
    <div key={segment} className={`page-fade ${className ?? ""}`}>
      {children}
    </div>
  );
}
