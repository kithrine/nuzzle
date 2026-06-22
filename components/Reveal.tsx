"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + slides its children in when they scroll into view and back out when
 * they leave — both directions, because IntersectionObserver fires on enter and
 * exit. Honors `prefers-reduced-motion` (renders visible immediately, no
 * observer). Used for the homepage scroll reveals.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    // Degrade gracefully where the observer is unavailable (reduced motion,
    // older browsers, or the test/SSR environment): just show the content.
    // A one-time mount fallback; not a cascading-render concern.
    if (reduce || typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-in" : ""} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
