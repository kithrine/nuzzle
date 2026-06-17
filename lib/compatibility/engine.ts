import type {
  AdopterProfile,
  CompatibilityBreakdown,
  CompatibilityResult,
  ConfidenceLabel,
  MatchLabel,
  NormalizedDog,
} from "./types";

const ENERGY_ORDER = ["Low", "Moderate", "High"] as const;
const SIZE_ORDER = ["Small", "Medium", "Large", "X-Large"] as const;

function toMatchLabel(score: number): MatchLabel {
  if (score >= 85) return "Strong Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Possible Match";
  return "Low Match";
}

function toConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

export function calculateCompatibility(
  profile: AdopterProfile,
  dog: NormalizedDog,
): CompatibilityResult {
  const breakdown: CompatibilityBreakdown[] = [];
  const positiveFactors: string[] = [];
  const concerns: string[] = [];
  const shelterQuestions: string[] = [];
  let confidence = 100;

  // ─── 1. Kids Compatibility — 18 pts ──────────────────────────────────────
  let kidsScore: number;
  if (!profile.hasChildren) {
    kidsScore = 18;
    positiveFactors.push("No children in home — no kids compatibility concerns.");
  } else if (dog.isKidsOk === true) {
    kidsScore = 18;
    positiveFactors.push("This dog is good with children.");
  } else if (dog.isKidsOk === false) {
    kidsScore = 0;
    concerns.push("This dog is not recommended for homes with children.");
  } else {
    kidsScore = 9;
    confidence -= 15;
    shelterQuestions.push("Has this dog lived with or been around children?");
  }
  breakdown.push({
    category: "Kids Compatibility",
    score: kidsScore,
    maxScore: 18,
    detail: `Kids compatibility: ${kidsScore}/18`,
  });

  // ─── 2. Cats Compatibility — 18 pts ──────────────────────────────────────
  let catsScore: number;
  if (!profile.hasCats) {
    catsScore = 18;
    positiveFactors.push("No cats in home — no cats compatibility concerns.");
  } else if (dog.isCatsOk === true) {
    catsScore = 18;
    positiveFactors.push("This dog is good with cats.");
  } else if (dog.isCatsOk === false) {
    catsScore = 0;
    concerns.push("This dog is not recommended for homes with cats.");
  } else {
    catsScore = 9;
    confidence -= 15;
    shelterQuestions.push("Has this dog lived with or been tested around cats?");
  }
  breakdown.push({
    category: "Cats Compatibility",
    score: catsScore,
    maxScore: 18,
    detail: `Cats compatibility: ${catsScore}/18`,
  });

  // ─── 3. Dogs Compatibility — 14 pts ──────────────────────────────────────
  let dogsScore: number;
  if (!profile.hasOtherDogs) {
    dogsScore = 14;
    positiveFactors.push("No other dogs in home — no dog-to-dog compatibility concerns.");
  } else if (dog.isDogsOk === true) {
    dogsScore = 14;
    positiveFactors.push("This dog gets along well with other dogs.");
  } else if (dog.isDogsOk === false) {
    dogsScore = 0;
    concerns.push("This dog may not do well in a home with other dogs.");
  } else {
    dogsScore = 7;
    confidence -= 12;
    shelterQuestions.push("Has this dog been socialized with other dogs?");
  }
  breakdown.push({
    category: "Dogs Compatibility",
    score: dogsScore,
    maxScore: 14,
    detail: `Dogs compatibility: ${dogsScore}/14`,
  });

  // ─── 4. Energy / Activity Fit — 16 pts ───────────────────────────────────
  // Priority: dog.energyLevel → dog.activityLevel → dog.exerciseNeeds
  const dogEnergy =
    dog.energyLevel !== "Unknown"
      ? dog.energyLevel
      : dog.activityLevel !== "Unknown"
        ? dog.activityLevel
        : dog.exerciseNeeds !== "Unknown"
          ? dog.exerciseNeeds
          : "Unknown";

  let energyScore: number;
  if (dogEnergy === "Unknown") {
    energyScore = 8;
    confidence -= 15;
    shelterQuestions.push("How much daily exercise does this dog currently need?");
  } else {
    const dogIdx = ENERGY_ORDER.indexOf(dogEnergy);
    const profileIdx = ENERGY_ORDER.indexOf(profile.activityLevel);
    const steps = Math.abs(dogIdx - profileIdx);
    if (steps === 0) {
      energyScore = 16;
      positiveFactors.push("This dog's energy level matches your lifestyle.");
    } else if (steps === 1) {
      energyScore = 10;
    } else {
      energyScore = 2;
      concerns.push(
        "Your activity level and this dog's energy level may not be a good match.",
      );
    }
  }
  breakdown.push({
    category: "Energy / Activity Fit",
    score: energyScore,
    maxScore: 16,
    detail: `Energy fit: ${energyScore}/16`,
  });

  // ─── 5. Yard & Fence — 12 pts (6 + 6) ───────────────────────────────────
  let yardScore: number;
  if (dog.isYardRequired === "Unknown") {
    yardScore = 3;
    confidence -= 8;
    shelterQuestions.push("Does this dog require access to a yard?");
  } else if (dog.isYardRequired === false) {
    yardScore = 6;
    positiveFactors.push("This dog does not require a yard.");
  } else {
    if (profile.hasYard === true) {
      yardScore = 6;
      positiveFactors.push("This dog requires a yard, and you have one.");
    } else {
      yardScore = 0;
      concerns.push(
        "This dog requires a yard, but your profile does not indicate you have one.",
      );
    }
  }

  let fenceScore: number;
  if (dog.fenceNeeds === "Unknown") {
    fenceScore = 3;
    confidence -= 8;
    shelterQuestions.push("Does this dog require a fenced yard?");
  } else if (dog.fenceNeeds === "Not required") {
    fenceScore = 6;
    positiveFactors.push("This dog does not require a fenced yard.");
  } else {
    if (profile.hasFence === true) {
      fenceScore = 6;
      positiveFactors.push("This dog requires a fence, and you have one.");
    } else {
      fenceScore = 0;
      concerns.push(
        "This dog requires a fenced yard, but your profile does not indicate you have one.",
      );
    }
  }
  breakdown.push({
    category: "Yard & Fence",
    score: yardScore + fenceScore,
    maxScore: 12,
    detail: `Yard & fence: ${yardScore + fenceScore}/12`,
  });

  // ─── 6. Experience Level — 10 pts ────────────────────────────────────────
  let expScore: number;
  if (dog.ownerExperience === "Unknown") {
    expScore = 5;
    confidence -= 8;
  } else if (dog.ownerExperience === "None") {
    expScore = 10;
  } else if (dog.ownerExperience === "Species") {
    expScore =
      profile.experienceLevel === "Species" || profile.experienceLevel === "Breed" ? 10 : 4;
  } else {
    // "Breed"
    if (profile.experienceLevel === "Breed") {
      expScore = 10;
    } else if (profile.experienceLevel === "Species") {
      expScore = 6;
    } else {
      expScore = 2;
      concerns.push(
        "This dog may need an experienced handler with familiarity with this breed.",
      );
    }
  }
  breakdown.push({
    category: "Experience Level",
    score: expScore,
    maxScore: 10,
    detail: `Experience: ${expScore}/10`,
  });

  // ─── 7. Size Preference — 8 pts ──────────────────────────────────────────
  let sizeScore: number;
  if (dog.sizeGroup === "Unknown") {
    sizeScore = 4;
    confidence -= 6;
  } else if (!profile.sizePreference || profile.sizePreference === "No Preference") {
    sizeScore = 8;
  } else {
    const dogIdx = SIZE_ORDER.indexOf(dog.sizeGroup);
    const prefIdx = SIZE_ORDER.indexOf(profile.sizePreference);
    const steps = Math.abs(dogIdx - prefIdx);
    sizeScore = steps === 0 ? 8 : steps === 1 ? 5 : 2;
  }
  breakdown.push({
    category: "Size Preference",
    score: sizeScore,
    maxScore: 8,
    detail: `Size preference: ${sizeScore}/8`,
  });

  // ─── 8. Special Needs — 4 pts ────────────────────────────────────────────
  let specialScore: number;
  if (dog.isSpecialNeeds === "Unknown") {
    specialScore = 2;
    confidence -= 5;
  } else if (dog.isSpecialNeeds === false) {
    specialScore = 4;
    positiveFactors.push("This dog does not have special needs.");
  } else {
    if (profile.specialNeedsWilling === true) {
      specialScore = 4;
      positiveFactors.push("You are open to dogs with special needs.");
    } else {
      specialScore = 0;
      concerns.push(
        "This dog has special needs that your profile indicates you may not be prepared for.",
      );
    }
  }
  breakdown.push({
    category: "Special Needs",
    score: specialScore,
    maxScore: 4,
    detail: `Special needs: ${specialScore}/4`,
  });

  const compatibilityScore = breakdown.reduce((sum, b) => sum + b.score, 0);
  const confidenceScore = Math.max(0, Math.min(100, confidence));

  return {
    compatibilityScore,
    matchLabel: toMatchLabel(compatibilityScore),
    confidenceScore,
    confidenceLabel: toConfidenceLabel(confidenceScore),
    breakdown,
    positiveFactors,
    concerns,
    shelterQuestions,
  };
}
