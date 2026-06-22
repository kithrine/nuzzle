"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Fades the page content in on arrival. Keyed by pathname so the fade replays
 * on every client-side navigation (not just hard loads), since the layout
 * itself stays mounted across route changes. Reduced-motion safe (CSS).
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <div key={pathname} className={`page-fade ${className ?? ""}`}>
      {children}
    </div>
  );
}
