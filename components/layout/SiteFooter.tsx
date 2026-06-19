import type { ReactNode } from "react";
import { NuzzleLogo } from "@/components/layout/NuzzleLogo";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.33-6.34V8.96a8.27 8.27 0 0 0 4.83 1.54V7.06a4.85 4.85 0 0 1-1.06-.37z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-surface border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <NuzzleLogo size={24} />
            <span className="font-semibold text-text-primary">Nuzzle</span>
          </div>
          <p className="text-text-secondary text-xs">Better matches. Happier tails.</p>
        </div>

        <nav aria-label="Footer" className="flex gap-4 md:gap-6 flex-wrap justify-center">
          {["About", "Contact", "Privacy", "Terms"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex gap-3">
          {(
            [
              { label: "Instagram", icon: <InstagramIcon /> },
              { label: "Facebook", icon: <FacebookIcon /> },
              { label: "TikTok", icon: <TikTokIcon /> },
            ] as { label: string; icon: ReactNode }[]
          ).map(({ label, icon }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="bg-text-primary text-white rounded-full p-2 hover:bg-primary transition-colors flex items-center justify-center"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
