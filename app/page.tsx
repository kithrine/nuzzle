import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { NuzzleLogo } from "@/components/layout/NuzzleLogo";

// ─── Icons ────────────────────────────────────────────────────────────────────

function PawIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="6" r="2.5" />
      <circle cx="16" cy="6" r="2.5" />
      <circle cx="5" cy="11" r="2" />
      <circle cx="19" cy="11" r="2" />
      <path d="M12 13c-3.5 0-6 2-6 4.5S8 22 12 22s6-2 6-4.5S15.5 13 12 13z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21h6M9 18h6M12 2a7 7 0 0 1 7 7 7 7 0 0 1-4 6.32V18H9v-2.68A7 7 0 0 1 5 9a7 7 0 0 1 7-7z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.33-6.34V8.96a8.27 8.27 0 0 0 4.83 1.54V7.06a4.85 4.85 0 0 1-1.06-.37z" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ValueProp({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex-1 flex items-start gap-3">
      <div className="text-primary flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        <p className="text-text-secondary text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type MatchTier = "high" | "medium" | "low";

const featuredDogs: { name: string; breed: string; age: string; match: number; tier: MatchTier }[] = [
  { name: "Charlie", breed: "Labrador Mix", age: "Young", match: 91, tier: "high" },
  { name: "Bella", breed: "German Shepherd", age: "Adult", match: 68, tier: "medium" },
  { name: "Luna", breed: "Husky Mix", age: "Young", match: 96, tier: "high" },
  { name: "Milo", breed: "Shiba Inu", age: "Adult", match: 87, tier: "high" },
  { name: "Daisy", breed: "Pomeranian", age: "Adult", match: 82, tier: "high" },
];

const matchBadge: Record<MatchTier, string> = {
  high: "bg-match-high-bg text-match-high-text",
  medium: "bg-match-medium-bg text-match-medium-text",
  low: "bg-match-low-bg text-match-low-text",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-hero-bg relative overflow-hidden px-6 py-16 md:px-12 md:py-24">
        {/* Left botanical decoration */}
        <svg
          className="absolute left-0 top-0 h-full opacity-50 hidden lg:block pointer-events-none"
          width="90"
          viewBox="0 0 90 300"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <ellipse cx="20" cy="120" rx="18" ry="80" transform="rotate(-20 20 120)" fill="#A8D5A2" />
          <ellipse cx="55" cy="200" rx="14" ry="55" transform="rotate(15 55 200)" fill="#FFB3C6" />
          <ellipse cx="10" cy="230" rx="10" ry="40" transform="rotate(-35 10 230)" fill="#A8D5A2" opacity="0.7" />
        </svg>

        <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:items-center gap-12 relative z-10">
          {/* Left: headline + CTAs */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-text-primary">
              Find a dog that fits your{" "}
              <span className="text-primary">lifestyle.</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-md mx-auto md:mx-0">
              Browse adoptable dogs and receive personalized compatibility matching.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/search"
                className="bg-primary text-white rounded-button-full px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <PawIcon />
                Browse Dogs
              </Link>
              <Link
                href="/questionnaire"
                className="border-2 border-primary text-primary rounded-button-full px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-light transition-colors"
              >
                <PersonIcon />
                Create Compatibility Profile
              </Link>
            </div>
          </div>

          {/* Right: hero dog photo */}
          <div className="hidden md:block relative h-80 lg:h-96">
            <Image
              src="/images/homepage-hero-bg.png"
              alt="Happy golden retriever"
              fill
              className="object-contain object-center"
              priority
            />
          </div>
        </div>

        {/* Right botanical decoration */}
        <svg
          className="absolute right-0 bottom-0 opacity-50 hidden lg:block pointer-events-none"
          width="80"
          height="200"
          viewBox="0 0 80 200"
          fill="none"
          aria-hidden="true"
        >
          <ellipse cx="65" cy="100" rx="16" ry="70" transform="rotate(25 65 100)" fill="#FFB3C6" />
          <ellipse cx="45" cy="160" rx="12" ry="50" transform="rotate(-10 45 160)" fill="#A8D5A2" opacity="0.8" />
        </svg>
      </section>

      {/* ── Value Propositions ───────────────────────────────────────── */}
      <section className="bg-surface py-10 px-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-8">
          <ValueProp
            icon={<StarIcon />}
            title="Better Matches"
            desc="We score compatibility to help you find the right fit."
          />
          <ValueProp
            icon={<LightbulbIcon />}
            title="Honest Insights"
            desc="Get clear, personalized insights about each dog."
          />
          <ValueProp
            icon={<HeartIcon />}
            title="Fewer Returns"
            desc="Stronger matches lead to happier, lasting adoptions."
          />
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-background py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="bg-surface rounded-card p-6 text-center shadow-sm flex-1 w-full">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold text-text-primary">Create Profile</p>
              <p className="text-text-secondary text-sm mt-2">
                Tell us about your lifestyle, home, and preferences.
              </p>
            </div>

            <div className="hidden md:flex items-center text-primary text-2xl mt-14 flex-shrink-0 px-1">
              →
            </div>

            <div className="bg-surface rounded-card p-6 text-center shadow-sm flex-1 w-full">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <div className="text-4xl mb-3">📊</div>
              <p className="font-semibold text-text-primary">Get Match Scores</p>
              <p className="text-text-secondary text-sm mt-2">
                We calculate compatibility scores for each dog.
              </p>
            </div>

            <div className="hidden md:flex items-center text-primary text-2xl mt-14 flex-shrink-0 px-1">
              →
            </div>

            <div className="bg-surface rounded-card p-6 text-center shadow-sm flex-1 w-full">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <div className="text-4xl mb-3">🐾</div>
              <p className="font-semibold text-text-primary">Find Your Dog</p>
              <p className="text-text-secondary text-sm mt-2">
                Discover dogs that fit your lifestyle and heart.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Dogs ─────────────────────────────────────────────── */}
      <section className="bg-background py-12">
        <div className="max-w-5xl mx-auto px-6 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Featured Dogs</h2>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 px-6 w-max">
            {featuredDogs.map((dog) => (
              <div
                key={dog.name}
                className="bg-surface rounded-card shadow-sm flex-shrink-0 w-44 overflow-hidden"
              >
                <div className="relative h-36">
                  <Image
                    src="/images/homepage-hero-bg.png"
                    alt={dog.name}
                    fill
                    className="object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-badge ${matchBadge[dog.tier]}`}
                  >
                    {dog.match}%
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-text-primary text-sm">{dog.name}</p>
                  <p className="text-text-secondary text-xs">
                    {dog.breed} · {dog.age}
                  </p>
                  <Link
                    href="/search"
                    className="text-primary text-xs font-medium mt-2 block hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Profile Prompt Banner ─────────────────────────────────────── */}
      <section className="px-4 md:px-6 mb-12">
        <div className="bg-primary-light border border-border rounded-card max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-primary font-medium text-sm md:text-base text-center md:text-left">
            Complete your profile to unlock full match scores and personalized insights!
          </p>
          <Link
            href="/questionnaire"
            className="bg-primary text-white rounded-button-full px-5 py-2 text-sm font-semibold flex-shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Create Your Profile →
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
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

          <div className="flex gap-4 text-text-secondary">
            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-primary transition-colors">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="TikTok" className="hover:text-primary transition-colors">
              <TikTokIcon />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
