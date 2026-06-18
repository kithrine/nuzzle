"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const stepNumber = typeof step === "number" ? step + 1 : null;
  const progress = typeof step === "number" ? ((step) / PHASE1_TOTAL) * 100 : 100;

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
      router.push("/search");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Phase 1: step 0 — Home Type ─────────────────────────────────────────
  if (step === 0) {
    return (
      <main>
        <ProgressBar step={1} total={PHASE1_TOTAL} progress={progress} />
        <h1>What type of home do you live in?</h1>
        {(["Apartment", "House", "Other"] as const).map((v) => (
          <button
            key={v}
            aria-pressed={p1.homeType === v}
            onClick={() => { setP1((prev) => ({ ...prev, homeType: v })); setStep(1); }}
          >
            {v}
          </button>
        ))}
        <p>Why we ask: Some dogs need more space than apartments allow.</p>
      </main>
    );
  }

  // ─── Phase 1: step 1 — Children ──────────────────────────────────────────
  if (step === 1) {
    return (
      <main>
        <ProgressBar step={2} total={PHASE1_TOTAL} progress={progress} />
        <h1>Do you have children in your home?</h1>
        <YesNo value={p1.hasChildren} onChange={(v) => setP1((prev) => ({ ...prev, hasChildren: v }))} />
        <NavButtons
          stepNumber={stepNumber!}
          canContinue={p1.hasChildren !== null}
          onBack={() => setStep(0)}
          onContinue={() => setStep(2)}
        />
      </main>
    );
  }

  // ─── Phase 1: step 2 — Cats ──────────────────────────────────────────────
  if (step === 2) {
    return (
      <main>
        <ProgressBar step={3} total={PHASE1_TOTAL} progress={progress} />
        <h1>Do you have cats?</h1>
        <YesNo value={p1.hasCats} onChange={(v) => setP1((prev) => ({ ...prev, hasCats: v }))} />
        <NavButtons
          stepNumber={stepNumber!}
          canContinue={p1.hasCats !== null}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      </main>
    );
  }

  // ─── Phase 1: step 3 — Other Dogs ────────────────────────────────────────
  if (step === 3) {
    return (
      <main>
        <ProgressBar step={4} total={PHASE1_TOTAL} progress={progress} />
        <h1>Do you have other dogs?</h1>
        <YesNo value={p1.hasOtherDogs} onChange={(v) => setP1((prev) => ({ ...prev, hasOtherDogs: v }))} />
        <NavButtons
          stepNumber={stepNumber!}
          canContinue={p1.hasOtherDogs !== null}
          onBack={() => setStep(2)}
          onContinue={() => setStep(4)}
        />
      </main>
    );
  }

  // ─── Phase 1: step 4 — Activity Level ────────────────────────────────────
  if (step === 4) {
    return (
      <main>
        <ProgressBar step={5} total={PHASE1_TOTAL} progress={progress} />
        <h1>How active is your lifestyle?</h1>
        {(["Low", "Moderate", "High"] as const).map((v) => (
          <button
            key={v}
            aria-pressed={p1.activityLevel === v}
            onClick={() => setP1((prev) => ({ ...prev, activityLevel: v }))}
          >
            {v}
          </button>
        ))}
        <NavButtons
          stepNumber={stepNumber!}
          canContinue={!!p1.activityLevel}
          onBack={() => setStep(3)}
          onContinue={() => setStep(5)}
        />
      </main>
    );
  }

  // ─── Phase 1: step 5 — Experience Level ──────────────────────────────────
  if (step === 5) {
    const options: Array<{ label: string; value: "None" | "Species" | "Breed" }> = [
      { label: "First-Time Owner", value: "None" },
      { label: "Previous Dog Owner", value: "Species" },
      { label: "Breed Experience", value: "Breed" },
    ];
    return (
      <main>
        <ProgressBar step={6} total={PHASE1_TOTAL} progress={progress} />
        <h1>{"What's your dog ownership experience?"}</h1>
        {options.map(({ label, value }) => (
          <button
            key={value}
            aria-pressed={p1.experienceLevel === value}
            onClick={() => setP1((prev) => ({ ...prev, experienceLevel: value }))}
          >
            {label}
          </button>
        ))}
        {errorMsg && <p role="alert">{errorMsg}</p>}
        <NavButtons
          stepNumber={stepNumber!}
          canContinue={!!p1.experienceLevel}
          onBack={() => setStep(4)}
          onContinue={submitPhase1}
          finalLabel={isLoading ? "Saving..." : "Generate My Matches"}
        />
      </main>
    );
  }

  // ─── Post-Phase 1 prompt ──────────────────────────────────────────────────
  if (step === "phase1-done") {
    return (
      <main>
        <h1>Your matches are ready!</h1>
        <p>We found dogs that fit your lifestyle.</p>
        <button onClick={() => router.push("/search")}>See My Matches</button>
        <button onClick={() => setStep("phase2")}>Answer 6 more questions →</button>
        <p>You can update your profile at any time.</p>
      </main>
    );
  }

  // ─── Phase 2: Improve Accuracy ───────────────────────────────────────────
  if (step === "phase2") {
    return (
      <main>
        <h1>Improve Match Accuracy</h1>

        <fieldset>
          <legend>Yard available?</legend>
          <YesNo value={p2.hasYard} onChange={(v) => setP2((prev) => ({ ...prev, hasYard: v }))} />
        </fieldset>

        <fieldset>
          <legend>Fence available?</legend>
          <YesNo value={p2.hasFence} onChange={(v) => setP2((prev) => ({ ...prev, hasFence: v }))} />
        </fieldset>

        <fieldset>
          <legend>Grooming tolerance?</legend>
          {(["Low", "Moderate", "High"] as const).map((v) => (
            <label key={v}>
              <input
                type="radio"
                name="groomingTolerance"
                value={v}
                checked={p2.groomingTolerance === v}
                onChange={() => setP2((prev) => ({ ...prev, groomingTolerance: v }))}
              />
              {v}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Size preference?</legend>
          {(["Small", "Medium", "Large", "X-Large", "No Preference"] as const).map((v) => (
            <label key={v}>
              <input
                type="radio"
                name="sizePreference"
                value={v}
                checked={p2.sizePreference === v}
                onChange={() => setP2((prev) => ({ ...prev, sizePreference: v }))}
              />
              {v}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Special needs willingness?</legend>
          <YesNo value={p2.specialNeedsWilling} onChange={(v) => setP2((prev) => ({ ...prev, specialNeedsWilling: v }))} />
        </fieldset>

        <label htmlFor="maxDistance">Distance preference (miles)</label>
        <input
          id="maxDistance"
          type="number"
          min={1}
          max={200}
          value={p2.maxDistance}
          onChange={(e) => setP2((prev) => ({ ...prev, maxDistance: e.target.value }))}
        />

        {errorMsg && <p role="alert">{errorMsg}</p>}
        <button onClick={submitPhase2} disabled={isLoading}>
          {isLoading ? "Saving..." : "Improve My Matches"}
        </button>
      </main>
    );
  }

  return null;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ProgressBar({ step, total, progress }: { step: number; total: number; progress: number }) {
  return (
    <div>
      <p>Step {step} of {total}</p>
      <div role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label>
        <input type="radio" checked={value === true} onChange={() => onChange(true)} /> Yes
      </label>
      <label>
        <input type="radio" checked={value === false} onChange={() => onChange(false)} /> No
      </label>
    </div>
  );
}

function NavButtons({
  canContinue,
  onBack,
  onContinue,
  finalLabel,
}: {
  stepNumber: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  finalLabel?: string;
}) {
  return (
    <div>
      <button type="button" onClick={onBack}>Back</button>
      <button type="button" onClick={onContinue} disabled={!canContinue}>
        {finalLabel ?? "Continue"}
      </button>
    </div>
  );
}
