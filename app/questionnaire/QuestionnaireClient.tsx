"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  Building2,
  Home,
  Building,
  Baby,
  Cat,
  Dog,
  Trees,
  Fence,
  Heart,
  Leaf,
  Footprints,
  Zap,
  Award,
  PawPrint,
  ShieldCheck,
  Brush,
  Scissors,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CircleHelp,
  CircleCheck,
  Pencil,
  Lightbulb,
  MapPin,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  savePendingProfile,
  loadPendingProfile,
  clearPendingProfile,
} from "@/lib/questionnaire/pending-profile";

export type EditProfileData = {
  homeType: string;
  hasChildren: boolean;
  hasCats: boolean;
  hasOtherDogs: boolean;
  activityLevel: string;
  experienceLevel: string;
  groomingTolerance: string | null;
  hasFence: boolean | null;
  hasYard: boolean | null;
  specialNeedsWilling: boolean | null;
  maxDistance: number | null;
  sizePreference: string | null;
  agePreference: string | null;
  sexPreference: string | null;
  hoursAlone: string | null;
  firstName: string | null;
  lastName: string | null;
  profileVersion: number;
  updatedAt: string;
};

type Phase1Answers = {
  homeType: "Apartment" | "House" | "Other" | "";
  hasChildren: boolean | null;
  hasCats: boolean | null;
  hasOtherDogs: boolean | null;
  activityLevel: "Low" | "Moderate" | "High" | "";
  experienceLevel: "None" | "Species" | "Breed" | "";
};

type Phase2Answers = {
  hasYard: boolean | null;
  hasFence: boolean | null;
  groomingTolerance: "Low" | "Moderate" | "High" | "";
  sizePreference: "Small" | "Medium" | "Large" | "X-Large" | "No Preference" | "";
  agePreference: "Baby" | "Young" | "Adult" | "Senior" | "No Preference" | "";
  sexPreference: "Male" | "Female" | "No Preference" | "";
  specialNeedsWilling: boolean | null;
  hoursAlone: "Under 4h" | "4-8h" | "8h+" | "";
  maxDistance: string;
};

// Allowed search-radius values for the distance slider (the slider snaps to
// these; an index-based range avoids the old "shows 10mi for any in-between" bug).
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100] as const;

type UIPhase = "name" | 0 | 1 | 2 | 3 | 4 | 5 | "phase1-done" | "phase2" | "done";

export function QuestionnaireClient({
  initialProfile = null,
  firstName = "there",
}: {
  initialProfile?: EditProfileData | null;
  firstName?: string;
} = {}) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  // Creation flow starts by asking the user's name (onboarding), then Phase 1.
  const [step, setStep] = useState<UIPhase>("name");
  const [p2step, setP2step] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [resuming, setResuming] = useState(false);
  const resumedRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");

  const [p1, setP1] = useState<Phase1Answers>({
    homeType: "",
    hasChildren: null,
    hasCats: null,
    hasOtherDogs: null,
    activityLevel: "",
    experienceLevel: "",
  });

  const [p2, setP2] = useState<Phase2Answers>({
    hasYard: null,
    hasFence: null,
    groomingTolerance: "",
    sizePreference: "",
    agePreference: "",
    sexPreference: "",
    specialNeedsWilling: null,
    hoursAlone: "",
    maxDistance: "25",
  });
  const [specialNeedsChoice, setSpecialNeedsChoice] = useState<"" | "Yes" | "No" | "Maybe">("");

  // Questionnaire-first flow: a user who answered while anonymous, then created
  // an account, returns here signed-in with their answers in localStorage.
  // Create the profile from those answers and send them straight to matches.
  useEffect(() => {
    if (initialProfile) return;
    if (!isLoaded || !isSignedIn || resumedRef.current) return;
    const pending = loadPendingProfile();
    if (!pending) return;
    resumedRef.current = true;
    // setState lives inside the async task (not the synchronous effect body) so
    // it doesn't trigger a cascading render on mount — react-hooks/set-state-in-effect.
    (async () => {
      setResuming(true);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pending),
        });
        clearPendingProfile();
        if (res.ok) {
          router.replace("/search?source=questionnaire");
          return;
        }
      } catch {
        // fall through to the normal questionnaire below
      }
      setResuming(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, initialProfile]);

  // Authenticated user with an existing profile → edit mode (Screen 11).
  if (initialProfile) {
    return <EditProfileView initialProfile={initialProfile} firstName={firstName} />;
  }

  if (resuming) {
    return (
      <Shell>
        <div className="bg-surface rounded-card shadow-sm p-8 text-center w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-text-primary">Setting up your matches…</h1>
          <p className="text-text-secondary text-sm mt-2">
            Creating your profile from your answers.
          </p>
        </div>
      </Shell>
    );
  }

  const skipToBrowse = () => router.push("/search");

  async function submitPhase1() {
    const name = {
      firstName: firstNameInput.trim() || undefined,
      lastName: lastNameInput.trim() || undefined,
    };
    // Anonymous: stash the answers (incl. name) and send them to create an
    // account first; the resume flow POSTs this once they're signed in.
    if (!isSignedIn) {
      savePendingProfile({
        ...name,
        homeType: p1.homeType as string,
        hasChildren: p1.hasChildren as boolean,
        hasCats: p1.hasCats as boolean,
        hasOtherDogs: p1.hasOtherDogs as boolean,
        activityLevel: p1.activityLevel as string,
        experienceLevel: p1.experienceLevel as string,
      });
      router.push("/signup");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...name,
          homeType: p1.homeType,
          hasChildren: p1.hasChildren,
          hasCats: p1.hasCats,
          hasOtherDogs: p1.hasOtherDogs,
          activityLevel: p1.activityLevel,
          experienceLevel: p1.experienceLevel,
        }),
      });
      if (res.status === 401) {
        setErrorMsg("Please log in to save your profile.");
        return;
      }
      if (!res.ok) {
        setErrorMsg("Something went wrong. Please try again.");
        return;
      }
      setStep("phase1-done");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitPhase2() {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const body: Record<string, unknown> = {};
      if (p2.hasYard !== null) body.hasYard = p2.hasYard;
      if (p2.hasFence !== null) body.hasFence = p2.hasFence;
      if (p2.groomingTolerance) body.groomingTolerance = p2.groomingTolerance;
      if (p2.sizePreference) body.sizePreference = p2.sizePreference;
      if (p2.agePreference) body.agePreference = p2.agePreference;
      if (p2.sexPreference) body.sexPreference = p2.sexPreference;
      if (p2.specialNeedsWilling !== null) body.specialNeedsWilling = p2.specialNeedsWilling;
      if (p2.hoursAlone) body.hoursAlone = p2.hoursAlone;
      if (p2.maxDistance) body.maxDistance = Number(p2.maxDistance);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setErrorMsg("Something went wrong. Please try again.");
        return;
      }
      router.push("/search?source=questionnaire");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Phase 1: step 0 — Home Type ─────────────────────────────────────────
  // ─── Onboarding: name ────────────────────────────────────────────────────
  if (step === "name") {
    return (
      <Shell>
        <div className="w-full">
          <div className="bg-surface rounded-card shadow-sm w-full p-6">
            <h1 className="text-2xl font-bold text-text-primary text-center">
              Welcome! What should we call you?
            </h1>
            <p className="text-text-secondary text-sm text-center mt-2">
              We&apos;ll use your name to personalize your dashboard. You can change it anytime.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                First name
                <input
                  type="text"
                  value={firstNameInput}
                  onChange={(e) => setFirstNameInput(e.target.value)}
                  placeholder="First name"
                  className="border border-border rounded-button-inline px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-text-secondary">
                Last name
                <input
                  type="text"
                  value={lastNameInput}
                  onChange={(e) => setLastNameInput(e.target.value)}
                  placeholder="Last name"
                  className="border border-border rounded-button-inline px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="mt-6 w-full bg-primary text-white rounded-button-full py-3 font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Continue
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={skipToBrowse}
              className="block mx-auto mt-3 text-primary text-sm underline underline-offset-2 hover:opacity-75"
            >
              Skip for now
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (step === 0) {
    return (
      <Shell>
        <QuestionCard
          current={1}
          title="What's your home like?"
          subtitle="This helps us understand the best environment for your future dog."
          onBack={() => setStep("name")}
          onNext={() => setStep(1)}
          nextDisabled={!p1.homeType}
          onSkip={skipToBrowse}
        >
          <OptionButton icon={<Building2 size={20} />} label="Apartment" selected={p1.homeType === "Apartment"} onClick={() => setP1((p) => ({ ...p, homeType: "Apartment" }))} />
          <OptionButton icon={<Home size={20} />} label="House" selected={p1.homeType === "House"} onClick={() => setP1((p) => ({ ...p, homeType: "House" }))} />
          <OptionButton icon={<Building size={20} />} label="Other" selected={p1.homeType === "Other"} onClick={() => setP1((p) => ({ ...p, homeType: "Other" }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Phase 1: step 1 — Children ──────────────────────────────────────────
  if (step === 1) {
    return (
      <Shell>
        <QuestionCard
          current={2}
          title="Are there children in your home?"
          subtitle="This helps us match dogs with the right temperament."
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          nextDisabled={p1.hasChildren === null}
          onSkip={skipToBrowse}
        >
          <YesNo icon={<Baby size={20} />} value={p1.hasChildren} onChange={(v) => setP1((p) => ({ ...p, hasChildren: v }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Phase 1: step 2 — Cats ──────────────────────────────────────────────
  if (step === 2) {
    return (
      <Shell>
        <QuestionCard
          current={3}
          title="Do you have any cats in your home?"
          subtitle="This helps us find dogs who are good with cats."
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          nextDisabled={p1.hasCats === null}
          onSkip={skipToBrowse}
        >
          <YesNo icon={<Cat size={20} />} value={p1.hasCats} onChange={(v) => setP1((p) => ({ ...p, hasCats: v }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Phase 1: step 3 — Other Dogs ────────────────────────────────────────
  if (step === 3) {
    return (
      <Shell>
        <QuestionCard
          current={4}
          title="Do you have other dogs?"
          subtitle="This helps us find dogs who will get along great."
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          nextDisabled={p1.hasOtherDogs === null}
          onSkip={skipToBrowse}
        >
          <YesNo icon={<Dog size={20} />} value={p1.hasOtherDogs} onChange={(v) => setP1((p) => ({ ...p, hasOtherDogs: v }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Phase 1: step 4 — Activity Level ────────────────────────────────────
  if (step === 4) {
    return (
      <Shell>
        <QuestionCard
          current={5}
          title="What's your preferred activity level?"
          subtitle="This helps us match your energy levels."
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
          nextDisabled={!p1.activityLevel}
          onSkip={skipToBrowse}
        >
          <OptionButton icon={<Leaf size={20} />} label="Low" description="I prefer relaxed walks and quiet time at home." selected={p1.activityLevel === "Low"} onClick={() => setP1((p) => ({ ...p, activityLevel: "Low" }))} />
          <OptionButton icon={<Footprints size={20} />} label="Moderate" description="I enjoy daily walks and some playtime." selected={p1.activityLevel === "Moderate"} onClick={() => setP1((p) => ({ ...p, activityLevel: "Moderate" }))} />
          <OptionButton icon={<Zap size={20} />} label="High" description="I love outdoor adventures, hikes, and lots of play!" selected={p1.activityLevel === "High"} onClick={() => setP1((p) => ({ ...p, activityLevel: "High" }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Phase 1: step 5 — Experience Level ──────────────────────────────────
  if (step === 5) {
    return (
      <Shell>
        <QuestionCard
          current={6}
          title="What best describes your experience?"
          subtitle="This helps us find a dog that's the right fit for your experience level."
          onBack={() => setStep(4)}
          onNext={submitPhase1}
          nextDisabled={!p1.experienceLevel || isLoading}
          nextLabel={isLoading ? "Saving..." : "Generate My Matches"}
          nextIcon={<Search size={18} />}
          onSkip={skipToBrowse}
          error={errorMsg}
        >
          <OptionButton icon={<Award size={20} />} label="First-time owner" description="This will be my first dog." selected={p1.experienceLevel === "None"} onClick={() => setP1((p) => ({ ...p, experienceLevel: "None" }))} />
          <OptionButton icon={<PawPrint size={20} />} label="I've owned dogs before" description="I've cared for dogs in the past." selected={p1.experienceLevel === "Species"} onClick={() => setP1((p) => ({ ...p, experienceLevel: "Species" }))} />
          <OptionButton icon={<ShieldCheck size={20} />} label="Experience with specific breeds" description="I'm experienced with certain breeds." selected={p1.experienceLevel === "Breed"} onClick={() => setP1((p) => ({ ...p, experienceLevel: "Breed" }))} />
        </QuestionCard>
      </Shell>
    );
  }

  // ─── Post-Phase 1 prompt ──────────────────────────────────────────────────
  if (step === "phase1-done") {
    return (
      <Shell>
        <div className="bg-surface rounded-card shadow-sm p-8 text-center w-full max-w-md mx-auto">
          <div className="relative w-full h-40 rounded-card overflow-hidden mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/homepage-hero.png" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Your matches are ready!</h1>
          <p className="text-text-secondary text-sm mt-2">
            We used your answers to find dogs who are the best fit for you.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push("/search?source=questionnaire")}
              className="w-full bg-primary text-white rounded-button-full py-3 font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Search size={18} />
              See My Matches
            </button>
            <button
              onClick={() => { setP2step(0); setStep("phase2"); }}
              className="w-full border-2 border-primary text-primary rounded-button-full py-3 font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-light transition-colors"
            >
              <Sparkles size={18} />
              Answer 8 more questions to improve accuracy
            </button>
          </div>
          <p className="text-text-secondary text-sm mt-4">You can always update your profile later.</p>
        </div>
      </Shell>
    );
  }

  // ─── Phase 2: Improve Accuracy (8 stepped cards) ─────────────────────────
  if (step === "phase2") {
    const LAST = 7;
    const back = p2step === 0 ? () => setStep("phase1-done") : () => setP2step((s) => s - 1);
    const advance = p2step === LAST ? submitPhase2 : () => setP2step((s) => s + 1);

    let body: ReactNode = null;
    let title = "";
    let subtitle = "";

    if (p2step === 0) {
      title = "What's your grooming commitment?";
      subtitle = "We'll match you with a dog whose coat-care needs fit your lifestyle.";
      body = (
        <>
          <OptionButton icon={<Sparkles size={20} />} label="Low" description="I'd prefer a low-maintenance coat." selected={p2.groomingTolerance === "Low"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "Low" }))} />
          <OptionButton icon={<Brush size={20} />} label="Moderate" description="Regular brushing and upkeep is fine." selected={p2.groomingTolerance === "Moderate"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "Moderate" }))} />
          <OptionButton icon={<Scissors size={20} />} label="High" description="I don't mind frequent grooming." selected={p2.groomingTolerance === "High"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "High" }))} />
        </>
      );
    } else if (p2step === 1) {
      title = "Do you have a yard?";
      subtitle = "This helps us match dogs whose space and fencing needs fit your home.";
      const yardSel = (yard: boolean, fence: boolean) =>
        p2.hasYard === yard && p2.hasFence === fence;
      body = (
        <>
          <OptionButton icon={<Fence size={20} />} label="Fenced yard" selected={yardSel(true, true)} onClick={() => setP2((p) => ({ ...p, hasYard: true, hasFence: true }))} />
          <OptionButton icon={<Trees size={20} />} label="Unfenced yard" selected={yardSel(true, false)} onClick={() => setP2((p) => ({ ...p, hasYard: true, hasFence: false }))} />
          <OptionButton icon={<Building2 size={20} />} label="No yard" selected={yardSel(false, false)} onClick={() => setP2((p) => ({ ...p, hasYard: false, hasFence: false }))} />
        </>
      );
    } else if (p2step === 2) {
      title = "Are you open to a dog with special needs?";
      subtitle = "Some dogs may need extra care, training, or ongoing support.";
      body = (
        <>
          <OptionButton icon={<Heart size={20} />} label="Yes" selected={specialNeedsChoice === "Yes"} onClick={() => { setSpecialNeedsChoice("Yes"); setP2((p) => ({ ...p, specialNeedsWilling: true })); }} />
          <OptionButton icon={<CircleHelp size={20} />} label="Maybe" selected={specialNeedsChoice === "Maybe"} onClick={() => { setSpecialNeedsChoice("Maybe"); setP2((p) => ({ ...p, specialNeedsWilling: true })); }} />
          <OptionButton icon={<X size={20} />} label="No" selected={specialNeedsChoice === "No"} onClick={() => { setSpecialNeedsChoice("No"); setP2((p) => ({ ...p, specialNeedsWilling: false })); }} />
        </>
      );
    } else if (p2step === 3) {
      title = "Any age preference?";
      subtitle = "We'll prioritize dogs in the life stage you're looking for.";
      const ages: Array<{ v: Phase2Answers["agePreference"]; label: string }> = [
        { v: "Baby", label: "Puppy" },
        { v: "Young", label: "Young" },
        { v: "Adult", label: "Adult" },
        { v: "Senior", label: "Senior" },
        { v: "No Preference", label: "No preference" },
      ];
      body = (
        <>
          {ages.map(({ v, label }) => (
            <OptionButton key={v} icon={<PawPrint size={20} />} label={label} selected={p2.agePreference === v} onClick={() => setP2((p) => ({ ...p, agePreference: v }))} />
          ))}
        </>
      );
    } else if (p2step === 4) {
      title = "Any sex preference?";
      subtitle = "Totally optional — pick “No preference” if it doesn't matter to you.";
      const sexes: Array<{ v: Phase2Answers["sexPreference"]; label: string }> = [
        { v: "Male", label: "Male" },
        { v: "Female", label: "Female" },
        { v: "No Preference", label: "No preference" },
      ];
      body = (
        <>
          {sexes.map(({ v, label }) => (
            <OptionButton key={v} icon={v === "No Preference" ? <Heart size={20} /> : <Dog size={20} />} label={label} selected={p2.sexPreference === v} onClick={() => setP2((p) => ({ ...p, sexPreference: v }))} />
          ))}
        </>
      );
    } else if (p2step === 5) {
      title = "What size dog do you prefer?";
      subtitle = "Choose the size you're most open to welcoming into your home.";
      const sizes: Array<{ v: Phase2Answers["sizePreference"]; label: string }> = [
        { v: "Small", label: "Small (up to 20 lbs)" },
        { v: "Medium", label: "Medium (21–50 lbs)" },
        { v: "Large", label: "Large (51–90 lbs)" },
        { v: "X-Large", label: "X-Large (91+ lbs)" },
        { v: "No Preference", label: "No Preference" },
      ];
      body = (
        <>
          {sizes.map(({ v, label }) => (
            <OptionButton
              key={v}
              icon={v === "No Preference" ? <Heart size={20} /> : <Dog size={20} />}
              label={label}
              selected={p2.sizePreference === v}
              onClick={() => setP2((p) => ({ ...p, sizePreference: v }))}
            />
          ))}
        </>
      );
    } else if (p2step === 6) {
      title = "How long is your dog alone on a typical day?";
      subtitle = "This helps us flag dogs who may need more company or training.";
      const hours: Array<{ v: Phase2Answers["hoursAlone"]; label: string }> = [
        { v: "Under 4h", label: "Under 4 hours" },
        { v: "4-8h", label: "4–8 hours" },
        { v: "8h+", label: "8+ hours" },
      ];
      body = (
        <>
          {hours.map(({ v, label }) => (
            <OptionButton key={v} icon={<Footprints size={20} />} label={label} selected={p2.hoursAlone === v} onClick={() => setP2((p) => ({ ...p, hoursAlone: v }))} />
          ))}
        </>
      );
    } else {
      title = "What's your preferred adoption distance?";
      subtitle = "We'll prioritize dogs within this range from your location.";
      body = (
        <DistanceSlider
          value={p2.maxDistance}
          onChange={(v) => setP2((p) => ({ ...p, maxDistance: v }))}
        />
      );
    }

    return (
      <Shell>
        <QuestionCard
          current={p2step + 1}
          total={8}
          title={title}
          subtitle={subtitle}
          onBack={back}
          onNext={advance}
          nextLabel={p2step === LAST ? (isLoading ? "Saving..." : "Improve My Matches") : "Next"}
          nextIcon={p2step === LAST ? <Sparkles size={18} /> : undefined}
          nextDisabled={isLoading}
          onSkip={advance}
          error={errorMsg}
        >
          {body}
        </QuestionCard>
      </Shell>
    );
  }

  return null;
}

// Discrete distance slider that snaps to the allowed radius values with a live
// readout (replaces the old select+range that showed "10 mi" for any in-between).
function DistanceSlider({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const found = DISTANCE_OPTIONS.indexOf(Number(value) as (typeof DISTANCE_OPTIONS)[number]);
  const idx = found >= 0 ? found : 1;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-2xl font-bold text-primary">
        {DISTANCE_OPTIONS[idx]} miles
      </p>
      <input
        type="range"
        min={0}
        max={DISTANCE_OPTIONS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(String(DISTANCE_OPTIONS[Number(e.target.value)]))}
        className="w-full accent-primary"
        aria-label="Maximum distance in miles"
      />
      <div className="flex justify-between text-text-secondary text-xs">
        {DISTANCE_OPTIONS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="relative overflow-hidden bg-background min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flowers-bottom.png"
          alt=""
          className="w-full h-auto select-none"
        />
      </div>
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">{children}</div>
    </main>
  );
}

function Stepper({ current, total = 6 }: { current: number; total?: number }) {
  return (
    <div className="flex items-center justify-center w-full max-w-xs mx-auto mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const reached = n <= current;
        return (
          <div key={n} className={n < total ? "flex items-center flex-1" : "flex items-center"}>
            <div
              className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 ${
                reached ? "bg-primary text-white" : "bg-border text-text-secondary"
              }`}
            >
              {n}
            </div>
            {n < total && (
              <div className={`h-0.5 flex-1 ${n < current ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OptionButton({
  selected,
  icon,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  icon?: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full border rounded-button-inline px-4 py-3 text-left flex items-center gap-3 transition-colors ${
        selected
          ? "border-primary bg-primary-light text-primary font-medium"
          : "border-border text-text-primary hover:border-primary hover:bg-primary-light"
      }`}
    >
      {icon && <span className="text-primary flex-shrink-0">{icon}</span>}
      <span className="flex flex-col">
        <span>{label}</span>
        {description && <span className="text-text-secondary text-sm font-normal">{description}</span>}
      </span>
    </button>
  );
}

function YesNo({
  value,
  onChange,
  icon,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  icon?: ReactNode;
}) {
  return (
    <>
      <OptionButton icon={icon} label="Yes" selected={value === true} onClick={() => onChange(true)} />
      <OptionButton icon={icon} label="No" selected={value === false} onClick={() => onChange(false)} />
    </>
  );
}

function QuestionCard({
  current,
  total = 6,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Next",
  nextIcon,
  nextDisabled,
  onSkip,
  error,
}: {
  current: number;
  total?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextIcon?: ReactNode;
  nextDisabled?: boolean;
  onSkip?: () => void;
  error?: string;
}) {
  return (
    <div className="w-full">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-3"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      )}

      <Stepper current={current} total={total} />

      <div className="bg-surface rounded-card shadow-sm w-full p-6">
        <h1 className="text-2xl font-bold text-text-primary text-center">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm text-center mt-2">{subtitle}</p>}

        <div className="mt-6 flex flex-col gap-3">{children}</div>

        {error && (
          <p role="alert" className="text-match-low-text text-sm mt-4 text-center">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="mt-6 w-full bg-primary text-white rounded-button-full py-3 font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {nextIcon}
          {nextLabel}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="block mx-auto mt-3 text-primary text-sm underline underline-offset-2 hover:opacity-75"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Edit mode (Screen 11) ────────────────────────────────────────────────────

const SELECT_CLS =
  "border border-border rounded-button-inline px-3 py-1.5 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

const ACTIVITY_DESC: Record<string, string> = {
  Low: "I prefer relaxed walks and quiet time at home.",
  Moderate: "Daily walks and some playtime.",
  High: "Outdoor adventures, hikes, and lots of play!",
};

const EXPERIENCE_OPTS = [
  { v: "None", label: "First-time owner" },
  { v: "Species", label: "I've owned dogs before" },
  { v: "Breed", label: "I have experience with specific breeds" },
];

const EXPERIENCE_SUMMARY: Record<string, { label: string; desc: string }> = {
  None: { label: "First-time owner", desc: "This will be my first dog." },
  Species: { label: "I've owned dogs before", desc: "I've cared for dogs in the past." },
  Breed: { label: "Experience with specific breeds", desc: "I'm experienced with certain breeds." },
};

function EditProfileView({
  initialProfile,
  firstName,
}: {
  initialProfile: EditProfileData;
  firstName: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"summary" | "form">("summary");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [version, setVersion] = useState(initialProfile.profileVersion);

  const [firstNameInput, setFirstNameInput] = useState(initialProfile.firstName ?? "");
  const [lastNameInput, setLastNameInput] = useState(initialProfile.lastName ?? "");

  const [p1, setP1] = useState<Phase1Answers>({
    homeType: initialProfile.homeType as Phase1Answers["homeType"],
    hasChildren: initialProfile.hasChildren,
    hasCats: initialProfile.hasCats,
    hasOtherDogs: initialProfile.hasOtherDogs,
    activityLevel: initialProfile.activityLevel as Phase1Answers["activityLevel"],
    experienceLevel: initialProfile.experienceLevel as Phase1Answers["experienceLevel"],
  });
  const [p2, setP2] = useState<Phase2Answers>({
    hasYard: initialProfile.hasYard,
    hasFence: initialProfile.hasFence,
    groomingTolerance: (initialProfile.groomingTolerance ?? "") as Phase2Answers["groomingTolerance"],
    sizePreference: (initialProfile.sizePreference ?? "") as Phase2Answers["sizePreference"],
    agePreference: (initialProfile.agePreference ?? "") as Phase2Answers["agePreference"],
    sexPreference: (initialProfile.sexPreference ?? "") as Phase2Answers["sexPreference"],
    specialNeedsWilling: initialProfile.specialNeedsWilling,
    hoursAlone: (initialProfile.hoursAlone ?? "") as Phase2Answers["hoursAlone"],
    maxDistance: initialProfile.maxDistance != null ? String(initialProfile.maxDistance) : "25",
  });

  const lastUpdated = new Date(initialProfile.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const p1Complete = Boolean(
    p1.homeType &&
      p1.hasChildren !== null &&
      p1.hasCats !== null &&
      p1.hasOtherDogs !== null &&
      p1.activityLevel &&
      p1.experienceLevel,
  );
  const p2Complete = Boolean(
    p2.groomingTolerance &&
      p2.hasFence !== null &&
      p2.hasYard !== null &&
      p2.specialNeedsWilling !== null &&
      p2.maxDistance &&
      p2.sizePreference,
  );

  async function save() {
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstNameInput.trim() || null,
          lastName: lastNameInput.trim() || null,
          homeType: p1.homeType,
          hasChildren: p1.hasChildren,
          hasCats: p1.hasCats,
          hasOtherDogs: p1.hasOtherDogs,
          activityLevel: p1.activityLevel,
          experienceLevel: p1.experienceLevel,
          groomingTolerance: p2.groomingTolerance || null,
          hasFence: p2.hasFence,
          hasYard: p2.hasYard,
          specialNeedsWilling: p2.specialNeedsWilling,
          hoursAlone: p2.hoursAlone || null,
          maxDistance: p2.maxDistance ? Number(p2.maxDistance) : null,
          sizePreference: p2.sizePreference || null,
          agePreference: p2.agePreference || null,
          sexPreference: p2.sexPreference || null,
        }),
      });
      if (!res.ok) {
        setErrorMsg("Something went wrong. Please try again.");
        return;
      }
      const data = (await res.json().catch(() => null)) as { profileVersion?: number } | null;
      if (data?.profileVersion) setVersion(data.profileVersion);
      setSaved(true);
      router.refresh();
      setView("summary");
    } finally {
      setSaving(false);
    }
  }

  const openForm = (scrollToPhase2 = false) => {
    setSaved(false);
    setView("form");
    if (scrollToPhase2) {
      requestAnimationFrame(() =>
        document
          .getElementById("phase2-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  return (
    <main className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="flex gap-8 max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <DashboardSidebar firstName={firstName} active="profile" />
        <section className="flex-1 min-w-0 max-w-3xl">
          {view === "summary" ? (
            <ProfileSummary
              p1={p1}
              p2={p2}
              version={version}
              lastUpdated={lastUpdated}
              saved={saved}
              onEdit={() => openForm(false)}
              onImprove={() => openForm(true)}
            />
          ) : (
            <EditForm
              firstNameInput={firstNameInput}
              setFirstNameInput={setFirstNameInput}
              lastNameInput={lastNameInput}
              setLastNameInput={setLastNameInput}
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              p1Complete={p1Complete}
              p2Complete={p2Complete}
              version={version}
              saving={saving}
              errorMsg={errorMsg}
              onSave={save}
              onCancel={() => setView("summary")}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileSummary({
  p1,
  p2,
  version,
  lastUpdated,
  saved,
  onEdit,
  onImprove,
}: {
  p1: Phase1Answers;
  p2: Phase2Answers;
  version: number;
  lastUpdated: string;
  saved: boolean;
  onEdit: () => void;
  onImprove: () => void;
}) {
  const yesNo = (v: boolean | null) => (v === true ? "Yes" : v === false ? "No" : "—");
  const exp = p1.experienceLevel ? EXPERIENCE_SUMMARY[p1.experienceLevel] : null;

  return (
    <div>
      <Link
        href="/favorites"
        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-3"
      >
        <ChevronLeft size={16} /> Back to Saved Dogs
      </Link>
      <h1 className="text-3xl font-bold text-text-primary">Your Profile</h1>
      <p className="text-text-secondary text-sm mt-1">
        Your answers help us find the best matches for you.
      </p>

      {saved && (
        <p
          role="status"
          className="mt-4 flex items-center gap-2 text-match-high-text text-sm font-medium bg-match-high-bg rounded-button-inline px-3 py-2"
        >
          <CircleCheck size={16} /> Saved!
        </p>
      )}

      {/* Status card */}
      <div className="relative overflow-hidden bg-primary-light/40 border border-border rounded-card p-4 mt-5 flex items-center gap-3">
        <span className="bg-match-high-bg rounded-full p-2 flex-shrink-0">
          <CircleCheck size={20} className="text-match-high-text" />
        </span>
        <div className="relative z-10">
          <p className="font-semibold text-primary">Profile Complete</p>
          <p className="text-text-secondary text-sm">
            Last updated: {lastUpdated} &bull; Version {version}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flowers-about.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-0 right-0 w-24 h-auto opacity-90"
        />
      </div>

      <h2 className="text-lg font-bold text-text-primary mt-8">Current Profile Summary</h2>
      <p className="text-text-secondary text-sm mb-4">Here&apos;s a quick look at your current answers.</p>
      <div className="flex flex-col gap-3">
        <SummaryRow icon={<Home size={18} />} label="Home Type" value={p1.homeType || "—"} />
        <SummaryRow icon={<Baby size={18} />} label="Children in Home" value={yesNo(p1.hasChildren)} />
        <SummaryRow icon={<Cat size={18} />} label="Cats in Home" value={yesNo(p1.hasCats)} />
        <SummaryRow icon={<Dog size={18} />} label="Other Dogs in Home" value={yesNo(p1.hasOtherDogs)} />
        <SummaryRow
          icon={<Footprints size={18} />}
          label="Activity Level"
          value={p1.activityLevel || "—"}
          description={p1.activityLevel ? ACTIVITY_DESC[p1.activityLevel] : undefined}
        />
        <SummaryRow
          icon={<Award size={18} />}
          label="Experience Level"
          value={exp?.label ?? "—"}
          description={exp?.desc}
        />
        {p2.groomingTolerance && (
          <SummaryRow icon={<Brush size={18} />} label="Grooming Commitment" value={p2.groomingTolerance} />
        )}
        {p2.hasYard !== null && (
          <SummaryRow
            icon={<Fence size={18} />}
            label="Yard"
            value={p2.hasYard ? (p2.hasFence ? "Fenced yard" : "Unfenced yard") : "No yard"}
          />
        )}
        {p2.agePreference && (
          <SummaryRow
            icon={<PawPrint size={18} />}
            label="Age Preference"
            value={p2.agePreference === "Baby" ? "Puppy" : p2.agePreference}
          />
        )}
        {p2.sexPreference && (
          <SummaryRow icon={<Dog size={18} />} label="Sex Preference" value={p2.sexPreference} />
        )}
        {p2.specialNeedsWilling !== null && (
          <SummaryRow
            icon={<Heart size={18} />}
            label="Open to Special Needs"
            value={yesNo(p2.specialNeedsWilling)}
          />
        )}
        {p2.hoursAlone && (
          <SummaryRow icon={<Footprints size={18} />} label="Hours Alone / Day" value={p2.hoursAlone} />
        )}
        {p2.maxDistance && (
          <SummaryRow icon={<MapPin size={18} />} label="Max Distance" value={`${p2.maxDistance} miles`} />
        )}
        {p2.sizePreference && (
          <SummaryRow icon={<Dog size={18} />} label="Size Preference" value={p2.sizePreference} />
        )}
      </div>

      {/* Tip banner */}
      <div className="relative overflow-hidden bg-secondary-cta/10 border border-border rounded-card p-4 mt-6 flex items-start gap-3">
        <span className="bg-secondary-cta/15 rounded-full p-2 flex-shrink-0">
          <Lightbulb size={18} className="text-secondary-cta" />
        </span>
        <div className="relative z-10">
          <p className="font-semibold text-text-primary text-sm">
            The more we know, the better the match.
          </p>
          <p className="text-text-secondary text-sm">
            Answer a few more questions to increase your confidence scores and get even better
            recommendations.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flowers-about.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-0 right-0 w-24 h-auto opacity-90 hidden sm:block"
        />
      </div>

      <h2 className="text-lg font-bold text-text-primary mt-8 mb-3">What would you like to do?</h2>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="bg-surface border border-border rounded-card p-4 flex items-center justify-between gap-3 text-left hover:border-primary transition-colors"
        >
          <span className="flex items-center gap-3">
            <span className="text-primary">
              <Pencil size={20} />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold text-primary">Edit Profile</span>
              <span className="text-text-secondary text-sm">Update your current answers</span>
            </span>
          </span>
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
        <button
          type="button"
          onClick={onImprove}
          className="bg-surface border border-border rounded-card p-4 flex items-center justify-between gap-3 text-left hover:border-primary transition-colors"
        >
          <span className="flex items-center gap-3">
            <span className="text-primary">
              <Sparkles size={20} />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold text-primary">Improve Accuracy</span>
              <span className="text-text-secondary text-sm">
                Answer 8 more questions to improve your matches
              </span>
            </span>
          </span>
          <ChevronRight size={18} className="text-text-secondary" />
        </button>
      </div>

      {/* Bottom banner */}
      <div className="relative overflow-hidden bg-primary-light/40 border border-border rounded-card p-4 mt-6">
        <div className="relative z-10">
          <p className="font-semibold text-text-primary text-sm">You can update your profile anytime.</p>
          <p className="text-text-secondary text-sm">Your matches will update as your needs change.</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flowers-about.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute bottom-0 right-0 w-28 h-auto opacity-90"
        />
      </div>
    </div>
  );
}

function EditForm({
  firstNameInput,
  setFirstNameInput,
  lastNameInput,
  setLastNameInput,
  p1,
  setP1,
  p2,
  setP2,
  p1Complete,
  p2Complete,
  version,
  saving,
  errorMsg,
  onSave,
  onCancel,
}: {
  firstNameInput: string;
  setFirstNameInput: Dispatch<SetStateAction<string>>;
  lastNameInput: string;
  setLastNameInput: Dispatch<SetStateAction<string>>;
  p1: Phase1Answers;
  setP1: Dispatch<SetStateAction<Phase1Answers>>;
  p2: Phase2Answers;
  setP2: Dispatch<SetStateAction<Phase2Answers>>;
  p1Complete: boolean;
  p2Complete: boolean;
  version: number;
  saving: boolean;
  errorMsg: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [snChoice, setSnChoice] = useState<string>(
    p2.specialNeedsWilling === true ? "Yes" : p2.specialNeedsWilling === false ? "No" : "",
  );

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline mb-3"
      >
        <ChevronLeft size={16} /> Cancel
      </button>
      <h1 className="text-3xl font-bold text-text-primary">Edit Your Profile</h1>
      <p className="text-text-secondary text-sm mt-1 mb-6">Update your answers below.</p>

      {/* 2-step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <StepBadge n={1} label="Phase 1" sub="Quick Match (6)" />
        <div className="h-0.5 flex-1 bg-primary/40" />
        <StepBadge n={2} label="Additional" sub="(8)" />
      </div>

      {/* Your name */}
      <div className="bg-surface border border-border rounded-card p-6 mb-6">
        <h2 className="text-lg font-bold text-text-primary mb-1">Your Name</h2>
        <p className="text-text-secondary text-sm mb-4">Shown on your dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            aria-label="First name"
            placeholder="First name"
            value={firstNameInput}
            onChange={(e) => setFirstNameInput(e.target.value)}
            className="flex-1 border border-border rounded-button-inline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text"
            aria-label="Last name"
            placeholder="Last name"
            value={lastNameInput}
            onChange={(e) => setLastNameInput(e.target.value)}
            className="flex-1 border border-border rounded-button-inline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Section 1 */}
      <div className="bg-surface border border-border rounded-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-text-primary">Phase 1: Quick Match</h2>
          {p1Complete && <CircleCheck size={18} className="text-match-high-text" />}
        </div>
        <p className="text-text-secondary text-sm mb-4">These answers help us find your best matches.</p>
        <div className="flex flex-col gap-3">
          <FieldRow icon={<Home size={18} />} label="Home Type">
            <select
              className={SELECT_CLS}
              value={p1.homeType}
              onChange={(e) =>
                setP1((p) => ({ ...p, homeType: e.target.value as Phase1Answers["homeType"] }))
              }
            >
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Other">Other</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Baby size={18} />} label="Children in Home">
            <BoolSelect value={p1.hasChildren} onChange={(v) => setP1((p) => ({ ...p, hasChildren: v }))} />
          </FieldRow>
          <FieldRow icon={<Cat size={18} />} label="Cats in Home">
            <BoolSelect value={p1.hasCats} onChange={(v) => setP1((p) => ({ ...p, hasCats: v }))} />
          </FieldRow>
          <FieldRow icon={<Dog size={18} />} label="Other Dogs in Home">
            <BoolSelect value={p1.hasOtherDogs} onChange={(v) => setP1((p) => ({ ...p, hasOtherDogs: v }))} />
          </FieldRow>

          {/* Activity — segmented */}
          <div className="bg-surface border border-border rounded-card px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-text-primary font-medium">
                <span className="text-primary flex-shrink-0">
                  <Footprints size={18} />
                </span>{" "}
                Activity Level
              </span>
              <div className="flex gap-2">
                {(["Low", "Moderate", "High"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setP1((p) => ({ ...p, activityLevel: v }))}
                    className={`px-3 py-1.5 rounded-button-inline text-sm border transition-colors ${
                      p1.activityLevel === v
                        ? "bg-primary text-white border-primary"
                        : "border-border text-text-primary hover:border-primary"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {p1.activityLevel && (
              <p className="text-text-secondary text-xs mt-2">{ACTIVITY_DESC[p1.activityLevel]}</p>
            )}
          </div>

          {/* Experience — radios */}
          <div className="bg-surface border border-border rounded-card px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-text-primary font-medium mb-2">
              <span className="text-primary flex-shrink-0">
                <Award size={18} />
              </span>{" "}
              Experience Level
            </span>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_OPTS.map((o) => (
                <label
                  key={o.v}
                  className="flex items-center gap-2 text-sm text-text-primary cursor-pointer"
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    className="accent-primary"
                    checked={p1.experienceLevel === o.v}
                    onChange={() =>
                      setP1((p) => ({ ...p, experienceLevel: o.v as Phase1Answers["experienceLevel"] }))
                    }
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div id="phase2-section" className="bg-surface border border-border rounded-card p-6 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-text-primary">Phase 2: Additional Details (Optional)</h2>
          {p2Complete && <CircleCheck size={18} className="text-match-high-text" />}
        </div>
        <p className="text-text-secondary text-sm mb-4">These help us improve accuracy and confidence.</p>
        <div className="flex flex-col gap-3">
          <FieldRow icon={<Brush size={18} />} label="Grooming Commitment">
            <select
              className={SELECT_CLS}
              value={p2.groomingTolerance}
              onChange={(e) =>
                setP2((p) => ({
                  ...p,
                  groomingTolerance: e.target.value as Phase2Answers["groomingTolerance"],
                }))
              }
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Fence size={18} />} label="Yard">
            <select
              className={SELECT_CLS}
              value={p2.hasYard === null ? "" : p2.hasYard ? (p2.hasFence ? "Fenced" : "Unfenced") : "None"}
              onChange={(e) => {
                const v = e.target.value;
                setP2((p) => ({
                  ...p,
                  hasYard: v === "" ? null : v !== "None",
                  hasFence: v === "Fenced" ? true : v === "" ? null : false,
                }));
              }}
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Fenced">Fenced yard</option>
              <option value="Unfenced">Unfenced yard</option>
              <option value="None">No yard</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Heart size={18} />} label="Open to a dog with special needs?">
            <select
              className={SELECT_CLS}
              value={snChoice}
              onChange={(e) => {
                const val = e.target.value;
                setSnChoice(val);
                setP2((p) => ({
                  ...p,
                  specialNeedsWilling: val === "No" ? false : val === "" ? null : true,
                }));
              }}
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Yes">Yes</option>
              <option value="Maybe">Maybe</option>
              <option value="No">No</option>
            </select>
          </FieldRow>
          <FieldRow icon={<PawPrint size={18} />} label="Age Preference">
            <select
              className={SELECT_CLS}
              value={p2.agePreference}
              onChange={(e) =>
                setP2((p) => ({ ...p, agePreference: e.target.value as Phase2Answers["agePreference"] }))
              }
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Baby">Puppy</option>
              <option value="Young">Young</option>
              <option value="Adult">Adult</option>
              <option value="Senior">Senior</option>
              <option value="No Preference">No Preference</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Dog size={18} />} label="Sex Preference">
            <select
              className={SELECT_CLS}
              value={p2.sexPreference}
              onChange={(e) =>
                setP2((p) => ({ ...p, sexPreference: e.target.value as Phase2Answers["sexPreference"] }))
              }
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="No Preference">No Preference</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Dog size={18} />} label="Size Preference">
            <select
              className={SELECT_CLS}
              value={p2.sizePreference}
              onChange={(e) =>
                setP2((p) => ({ ...p, sizePreference: e.target.value as Phase2Answers["sizePreference"] }))
              }
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
              <option value="X-Large">X-Large</option>
              <option value="No Preference">No Preference</option>
            </select>
          </FieldRow>
          <FieldRow icon={<Footprints size={18} />} label="Hours Alone / Day">
            <select
              className={SELECT_CLS}
              value={p2.hoursAlone}
              onChange={(e) =>
                setP2((p) => ({ ...p, hoursAlone: e.target.value as Phase2Answers["hoursAlone"] }))
              }
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Under 4h">Under 4 hours</option>
              <option value="4-8h">4–8 hours</option>
              <option value="8h+">8+ hours</option>
            </select>
          </FieldRow>

          {/* Distance — discrete snapping slider */}
          <div className="bg-surface border border-border rounded-card px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-text-primary font-medium mb-2">
              <span className="text-primary flex-shrink-0">
                <MapPin size={18} />
              </span>{" "}
              Preferred Adoption Distance
            </span>
            <DistanceSlider
              value={p2.maxDistance}
              onChange={(v) => setP2((p) => ({ ...p, maxDistance: v }))}
            />
          </div>
        </div>
      </div>

      {/* Version banner */}
      <div className="bg-primary-light/40 border border-border rounded-card p-4 mt-6 flex items-center gap-3">
        <CircleCheck size={18} className="text-match-high-text flex-shrink-0" />
        <div>
          <p className="font-semibold text-text-primary text-sm">
            Your profile will be updated to Version {version + 1}
          </p>
          <p className="text-text-secondary text-sm">Your matches may update based on your changes.</p>
        </div>
      </div>

      {errorMsg && (
        <p role="alert" className="text-match-low-text text-sm mt-4 text-center">
          {errorMsg}
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-6 w-full bg-primary text-white rounded-button-full py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 w-full border border-primary text-primary rounded-button-full py-3 font-semibold hover:bg-primary-light transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function StepBadge({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center flex-shrink-0 bg-primary text-white">
        {n}
      </div>
      <div className="leading-tight">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{sub}</p>
      </div>
    </div>
  );
}

function FieldRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-card px-4 py-3 flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-text-primary font-medium">
        <span className="text-primary flex-shrink-0">{icon}</span> {label}
      </span>
      {children}
    </div>
  );
}

function BoolSelect({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <select
      className={SELECT_CLS}
      value={value === true ? "Yes" : value === false ? "No" : ""}
      onChange={(e) => onChange(e.target.value === "Yes")}
    >
      {value === null && (
        <option value="" disabled>
          Select…
        </option>
      )}
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-card px-4 py-3 flex items-center justify-between gap-3">
      <span className="flex items-center gap-3 text-sm">
        <span className="text-primary flex-shrink-0">{icon}</span>
        <span className="text-text-secondary">{label}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="flex flex-col items-end text-right">
          <span className="text-text-primary font-medium text-sm">{value}</span>
          {description && <span className="text-text-secondary text-xs">{description}</span>}
        </span>
        <CircleCheck size={16} className="text-match-high-text flex-shrink-0" />
      </span>
    </div>
  );
}

