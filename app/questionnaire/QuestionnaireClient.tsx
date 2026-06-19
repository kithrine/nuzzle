"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  X,
  CircleHelp,
} from "lucide-react";

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
  specialNeedsWilling: boolean | null;
  maxDistance: string;
};

type UIPhase = 0 | 1 | 2 | 3 | 4 | 5 | "phase1-done" | "phase2" | "done";

const PHASE1_TOTAL = 6;

export function QuestionnaireClient() {
  const router = useRouter();
  const [step, setStep] = useState<UIPhase>(0);
  const [p2step, setP2step] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    specialNeedsWilling: null,
    maxDistance: "25",
  });
  const [specialNeedsChoice, setSpecialNeedsChoice] = useState<"" | "Yes" | "No" | "Open">("");

  const skipToBrowse = () => router.push("/search");

  async function submitPhase1() {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      if (p2.specialNeedsWilling !== null) body.specialNeedsWilling = p2.specialNeedsWilling;
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
  if (step === 0) {
    return (
      <Shell>
        <QuestionCard
          current={1}
          title="What's your home like?"
          subtitle="This helps us understand the best environment for your future dog."
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
              Answer 6 more questions to improve accuracy
            </button>
          </div>
          <p className="text-text-secondary text-sm mt-4">You can always update your profile later.</p>
        </div>
      </Shell>
    );
  }

  // ─── Phase 2: Improve Accuracy (6 stepped cards) ─────────────────────────
  if (step === "phase2") {
    const back = p2step === 0 ? () => setStep("phase1-done") : () => setP2step((s) => s - 1);
    const skip = p2step === 5 ? submitPhase2 : () => setP2step((s) => s + 1);
    const next = p2step === 5 ? submitPhase2 : () => setP2step((s) => s + 1);

    let body: ReactNode = null;
    let title = "";
    let subtitle = "";

    if (p2step === 0) {
      title = "What's your grooming tolerance?";
      subtitle = "This helps us match you with a dog whose grooming needs fit your lifestyle.";
      body = (
        <>
          <OptionButton icon={<Sparkles size={20} />} label="Low" description="Minimal grooming preference" selected={p2.groomingTolerance === "Low"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "Low" }))} />
          <OptionButton icon={<Brush size={20} />} label="Moderate" description="Regular brushing and upkeep" selected={p2.groomingTolerance === "Moderate"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "Moderate" }))} />
          <OptionButton icon={<Scissors size={20} />} label="High" description="I don't mind frequent grooming" selected={p2.groomingTolerance === "High"} onClick={() => setP2((p) => ({ ...p, groomingTolerance: "High" }))} />
        </>
      );
    } else if (p2step === 1) {
      title = "Do you have a fenced yard?";
      subtitle = "A secure yard can be important for some dogs to feel safe.";
      body = <YesNo icon={<Fence size={20} />} value={p2.hasFence} onChange={(v) => setP2((p) => ({ ...p, hasFence: v }))} />;
    } else if (p2step === 2) {
      title = "Do you have a yard?";
      subtitle = "An unfenced yard is okay! This just helps us understand your space.";
      body = <YesNo icon={<Trees size={20} />} value={p2.hasYard} onChange={(v) => setP2((p) => ({ ...p, hasYard: v }))} />;
    } else if (p2step === 3) {
      title = "Are you open to a dog with special needs?";
      subtitle = "Some dogs may need extra care, training, or ongoing support.";
      body = (
        <>
          <OptionButton icon={<Heart size={20} />} label="Yes" selected={specialNeedsChoice === "Yes"} onClick={() => { setSpecialNeedsChoice("Yes"); setP2((p) => ({ ...p, specialNeedsWilling: true })); }} />
          <OptionButton icon={<X size={20} />} label="No" selected={specialNeedsChoice === "No"} onClick={() => { setSpecialNeedsChoice("No"); setP2((p) => ({ ...p, specialNeedsWilling: false })); }} />
          <OptionButton icon={<CircleHelp size={20} />} label="Open to it" selected={specialNeedsChoice === "Open"} onClick={() => { setSpecialNeedsChoice("Open"); setP2((p) => ({ ...p, specialNeedsWilling: true })); }} />
        </>
      );
    } else if (p2step === 4) {
      title = "What's your preferred adoption distance?";
      subtitle = "We'll prioritize dogs within this range from your location.";
      body = (
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="maxDistance" className="block text-sm text-text-secondary mb-1">Maximum distance</label>
            <select
              id="maxDistance"
              value={p2.maxDistance}
              onChange={(e) => setP2((p) => ({ ...p, maxDistance: e.target.value }))}
              className="w-full border border-border rounded-button-inline px-3 py-2 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
          </div>
          <div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={p2.maxDistance}
              onChange={(e) => setP2((p) => ({ ...p, maxDistance: e.target.value }))}
              className="w-full accent-primary"
              aria-label="Maximum distance in miles"
            />
            <div className="flex justify-between text-text-secondary text-xs mt-1">
              <span>5 mi</span>
              <span>100 mi</span>
            </div>
          </div>
        </div>
      );
    } else {
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
    }

    return (
      <Shell>
        <QuestionCard
          current={p2step + 1}
          title={title}
          subtitle={subtitle}
          onBack={back}
          onNext={next}
          nextLabel={p2step === 5 ? (isLoading ? "Saving..." : "Improve My Matches") : "Next"}
          nextIcon={p2step === 5 ? <Sparkles size={18} /> : undefined}
          nextDisabled={isLoading}
          onSkip={skip}
          error={errorMsg}
        >
          {body}
        </QuestionCard>
      </Shell>
    );
  }

  return null;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="relative overflow-hidden bg-background min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 md:h-48 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/flowers-bottom.png"
          alt=""
          className="w-full h-full object-cover object-bottom select-none"
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

      <Stepper current={current} />

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

