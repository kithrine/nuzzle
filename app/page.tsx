import type { ReactNode } from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, MessageCircleHeart, ShieldCheck, PawPrint, Heart } from "lucide-react";
import { FeaturedDogs } from "@/components/FeaturedDogs";
import { Reveal } from "@/components/Reveal";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";

// Regenerate the homepage every 5 hours (complementary full-route cache). The
// real guarantee that the RescueGroups call runs at most once per window is the
// data-layer cache in lib/homepage/featured-data.ts (unstable_cache), which
// holds regardless of whether this route renders statically or dynamically.
// (Must stay a literal — Next reads `revalidate` statically.)
export const revalidate = 18000;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeaturedDogsSkeleton() {
  return (
    <div className="flex gap-4 w-max">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-card shadow-sm flex-shrink-0 w-48 overflow-hidden"
        >
          <div className="h-36 bg-primary-light animate-pulse" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-4 w-24 bg-border rounded animate-pulse" />
            <div className="h-3 w-32 bg-border rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ValueProp({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex-1 flex items-start gap-3 px-6 py-5">
      <div className="bg-primary-light rounded-full p-3 flex-shrink-0 text-primary">{icon}</div>
      <div>
        <p className="font-semibold text-primary text-sm">{title}</p>
        <p className="text-text-secondary text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[450px] lg:min-h-[575px] px-6 py-16 md:px-12 md:py-24 flex items-center">
        {/* Full-width background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/homepage-hero.png"
            alt=""
            fill
            className="object-cover object-hero hero-parallax"
            priority
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        {/* Text content on top */}
        <div className="relative z-20 max-w-6xl mx-auto w-full">
          <div className="max-w-[55%] sm:max-w-xl text-left sm:text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-text-primary">
              Find a dog that fits your{" "}
              <span className="text-primary">lifestyle.</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-md md:mx-0">
              Browse adoptable dogs and receive personalized compatibility matching.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/search"
              className="bg-primary text-white rounded-button-full px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity hover-press"
            >
              <PawPrint size={18} fill="currentColor" />
              Browse Dogs
            </Link>
            <Link
              href="/questionnaire"
              className="border-2 border-primary text-primary rounded-button-full px-6 py-3 font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-light transition-colors bg-white/70 hover-press"
            >
              <Heart size={18} fill="currentColor" />
              Create Compatibility Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ── Value Propositions ───────────────────────────────────────── */}
      <section className="bg-surface py-5 px-4">
        <Reveal>
        <div className="max-w-5xl mx-auto bg-surface rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center">
          <ValueProp
            icon={<Sparkles size={22} />}
            title="Better Matches"
            desc="We score compatibility to help you find the right fit."
          />
          <div className="hidden sm:block w-px h-12 bg-border flex-shrink-0" />
          <ValueProp
            icon={<MessageCircleHeart size={22} />}
            title="Honest Insights"
            desc="Get clear, personalized insights about each dog."
          />
          <div className="hidden sm:block w-px h-12 bg-border flex-shrink-0" />
          <ValueProp
            icon={<ShieldCheck size={22} />}
            title="Fewer Returns"
            desc="Stronger matches lead to happier, lasting adoptions."
          />
        </div>
        </Reveal>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="bg-surface py-14 px-6">
        <Reveal>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-0">

            {/* Step 1 — teal */}
            <div className="flex flex-col items-center text-center md:flex-1 max-w-xs mx-auto md:mx-0">
              <div className="relative w-48 h-44 mx-auto mb-4">
                <Image
                  src="/images/step1.png"
                  alt="Husky puppy with clipboard illustration"
                  fill
                  className="object-contain"
                />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm z-10">
                  1
                </div>
              </div>
              <p className="font-semibold text-primary">Create Profile</p>
              <p className="text-text-secondary text-sm mt-2 max-w-[180px]">
                Tell us about your lifestyle, home, and preferences.
              </p>
            </div>

            {/* Arrow 1→2 */}
            <div className="hidden md:flex items-center mt-[78px] px-1 flex-shrink-0">
              <Image
                src="/images/homepage-step-arrow.png"
                alt=""
                width={48}
                height={20}
                aria-hidden="true"
              />
            </div>

            {/* Step 2 — purple */}
            <div className="flex flex-col items-center text-center md:flex-1 max-w-xs mx-auto md:mx-0">
              <div className="relative w-48 h-44 mx-auto mb-4">
                <Image
                  src="/images/step2.png"
                  alt="Laptop showing match score dashboard illustration"
                  fill
                  className="object-contain"
                />
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-secondary-cta text-white font-bold text-xs flex items-center justify-center shadow-sm z-10">
                  2
                </div>
              </div>
              <p className="font-semibold text-secondary-cta">Get Match Scores</p>
              <p className="text-text-secondary text-sm mt-2 max-w-[180px]">
                We calculate compatibility scores for each dog.
              </p>
            </div>

            {/* Arrow 2→3 */}
            <div className="hidden md:flex items-center mt-[78px] px-1 flex-shrink-0">
              <Image
                src="/images/homepage-step-arrow.png"
                alt=""
                width={48}
                height={20}
                aria-hidden="true"
              />
            </div>

            {/* Step 3 — pink */}
            <div className="flex flex-col items-center text-center md:flex-1 max-w-xs mx-auto md:mx-0">
              <div className="relative w-48 h-44 mx-auto mb-4">
                <Image
                  src="/images/step3.png"
                  alt="Shiba Inu with hearts and flowers illustration"
                  fill
                  className="object-contain"
                />
                <div
                  className="absolute top-2 left-2 w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-sm z-10"
                  style={{ backgroundColor: "#EC4899" }}
                >
                  3
                </div>
              </div>
              <p className="font-semibold" style={{ color: "#EC4899" }}>Find Your Dog</p>
              <p className="text-text-secondary text-sm mt-2 max-w-[180px]">
                Discover dogs that fit your lifestyle and heart.
              </p>
            </div>

          </div>
        </div>
        </Reveal>
      </section>

      {/* ── Featured Dogs ─────────────────────────────────────────────── */}
      <section className="bg-background py-12">
        <Reveal>
        <div className="max-w-5xl mx-auto px-6 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Featured Dogs</h2>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>
        <FeaturedCarousel>
          <Suspense fallback={<FeaturedDogsSkeleton />}>
            <FeaturedDogs />
          </Suspense>
        </FeaturedCarousel>
        </Reveal>
      </section>

      {/* ── Profile Prompt Banner ─────────────────────────────────────── */}
      <section className="bg-surface pt-20 px-4 md:px-6 pb-12">
        <Reveal>
        <div className="relative bg-primary-light rounded-card max-w-5xl mx-auto overflow-visible">

          {/* Husky + plants: bigger, anchored bottom-left, overflows top + bottom + left */}
          <div className="absolute -top-16 -bottom-6 -left-4 w-72 hidden md:block">
            <Image
              src="/images/husky-plants.png"
              alt=""
              fill
              className="object-contain object-bottom"
              aria-hidden="true"
            />
          </div>

          {/* Flowers: taller, anchored bottom-right, overflows bottom + right */}
          <div className="absolute -top-10 -bottom-11 -right-6 w-52 hidden md:block">
            <Image
              src="/images/flowers.png"
              alt=""
              fill
              className="object-contain object-bottom object-right"
              aria-hidden="true"
            />
          </div>

          {/* Content — padded on desktop to clear the enlarged images */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-5 px-6 md:pl-60 md:pr-44">
            <p className="text-text-primary font-semibold text-sm md:text-base text-center md:text-left flex-1">
              Complete your profile to unlock full match scores and personalized insights!
            </p>
            <Link
              href="/questionnaire"
              className="bg-primary text-white rounded-button-full px-6 py-3 text-sm font-semibold flex-shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap hover-press"
            >
              Create Your Profile →
            </Link>
          </div>

        </div>
        </Reveal>
      </section>

    </main>
  );
}
