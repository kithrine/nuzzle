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
const AGE_ORDER = ["Baby", "Young", "Adult", "Senior"] as const;
const GROOM_ORDER = ["Low", "Moderate", "High"] as const;

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

  // ─── 1. Kids Compatibility — 16 pts ──────────────────────────────────────
  let kidsScore: number;
  if (!profile.hasChildren) {
    kidsScore = 16;
    positiveFactors.push("No children in home — no kids compatibility concerns.");
  } else if (dog.isKidsOk === true) {
    kidsScore = 16;
    positiveFactors.push("This dog is good with children.");
  } else if (dog.isKidsOk === false) {
    kidsScore = 0;
    concerns.push("This dog is not recommended for homes with children.");
  } else {
    kidsScore = 8;
    confidence -= 15;
    shelterQuestions.push("Has this dog lived with or been around children?");
  }
  breakdown.push({
    category: "Kids Compatibility",
    score: kidsScore,
    maxScore: 16,
    detail: `Kids compatibility: ${kidsScore}/16`,
  });

  // ─── 2. Cats Compatibility — 16 pts ──────────────────────────────────────
  let catsScore: number;
  if (!profile.hasCats) {
    catsScore = 16;
    positiveFactors.push("No cats in home — no cats compatibility concerns.");
  } else if (dog.isCatsOk === true) {
    catsScore = 16;
    positiveFactors.push("This dog is good with cats.");
  } else if (dog.isCatsOk === false) {
    catsScore = 0;
    concerns.push("This dog is not recommended for homes with cats.");
  } else {
    catsScore = 8;
    confidence -= 15;
    shelterQuestions.push("Has this dog lived with or been tested around cats?");
  }
  breakdown.push({
    category: "Cats Compatibility",
    score: catsScore,
    maxScore: 16,
    detail: `Cats compatibility: ${catsScore}/16`,
  });

  // ─── 3. Dogs Compatibility — 12 pts ──────────────────────────────────────
  let dogsScore: number;
  if (!profile.hasOtherDogs) {
    dogsScore = 12;
    positiveFactors.push("No other dogs in home — no dog-to-dog compatibility concerns.");
  } else if (dog.isDogsOk === true) {
    dogsScore = 12;
    positiveFactors.push("This dog gets along well with other dogs.");
  } else if (dog.isDogsOk === false) {
    dogsScore = 0;
    concerns.push("This dog may not do well in a home with other dogs.");
  } else {
    dogsScore = 6;
    confidence -= 12;
    shelterQuestions.push("Has this dog been socialized with other dogs?");
  }
  breakdown.push({
    category: "Dogs Compatibility",
    score: dogsScore,
    maxScore: 12,
    detail: `Dogs compatibility: ${dogsScore}/12`,
  });

  // ─── 4. Energy / Activity Fit — 14 pts ───────────────────────────────────
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
    energyScore = 7;
    confidence -= 15;
    shelterQuestions.push("How much daily exercise does this dog currently need?");
  } else {
    const dogIdx = ENERGY_ORDER.indexOf(dogEnergy);
    const profileIdx = ENERGY_ORDER.indexOf(profile.activityLevel);
    const steps = Math.abs(dogIdx - profileIdx);
    if (steps === 0) {
      energyScore = 14;
      positiveFactors.push("This dog's energy level matches your lifestyle.");
    } else if (steps === 1) {
      energyScore = 9;
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
    maxScore: 14,
    detail: `Energy fit: ${energyScore}/14`,
  });

  // ─── 5. Yard & Fence — 10 pts (5 + 5) ───────────────────────────────────
  let yardScore: number;
  if (dog.isYardRequired === "Unknown") {
    yardScore = 3;
    confidence -= 8;
    shelterQuestions.push("Does this dog require access to a yard?");
  } else if (dog.isYardRequired === false) {
    yardScore = 5;
    positiveFactors.push("This dog does not require a yard.");
  } else {
    if (profile.hasYard === true) {
      yardScore = 5;
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
    fenceScore = 5;
    positiveFactors.push("This dog does not require a fenced yard.");
  } else {
    if (profile.hasFence === true) {
      fenceScore = 5;
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
    maxScore: 10,
    detail: `Yard & fence: ${yardScore + fenceScore}/10`,
  });

  // ─── 6. Experience Level — 8 pts ─────────────────────────────────────────
  let expScore: number;
  if (dog.ownerExperience === "Unknown") {
    expScore = 4;
    confidence -= 8;
  } else if (dog.ownerExperience === "None") {
    expScore = 8;
  } else if (dog.ownerExperience === "Species") {
    expScore =
      profile.experienceLevel === "Species" || profile.experienceLevel === "Breed" ? 8 : 3;
  } else {
    // "Breed"
    if (profile.experienceLevel === "Breed") {
      expScore = 8;
    } else if (profile.experienceLevel === "Species") {
      expScore = 5;
    } else {
      expScore = 1;
      concerns.push(
        "This dog may need an experienced handler with familiarity with this breed.",
      );
    }
  }
  breakdown.push({
    category: "Experience Level",
    score: expScore,
    maxScore: 8,
    detail: `Experience: ${expScore}/8`,
  });

  // ─── 7. Size Preference — 7 pts ──────────────────────────────────────────
  let sizeScore: number;
  if (dog.sizeGroup === "Unknown") {
    sizeScore = 3;
    confidence -= 6;
  } else if (!profile.sizePreference || profile.sizePreference === "No Preference") {
    sizeScore = 7;
  } else {
    const dogIdx = SIZE_ORDER.indexOf(dog.sizeGroup);
    const prefIdx = SIZE_ORDER.indexOf(profile.sizePreference);
    const steps = Math.abs(dogIdx - prefIdx);
    sizeScore = steps === 0 ? 7 : steps === 1 ? 4 : 2;
  }
  breakdown.push({
    category: "Size Preference",
    score: sizeScore,
    maxScore: 7,
    detail: `Size preference: ${sizeScore}/7`,
  });

  // ─── 8. Age Preference — 7 pts ───────────────────────────────────────────
  let ageScore: number;
  if (dog.ageGroup === "Unknown") {
    ageScore = 3;
    confidence -= 4;
  } else if (!profile.agePreference || profile.agePreference === "No Preference") {
    ageScore = 7;
  } else {
    const dogIdx = AGE_ORDER.indexOf(dog.ageGroup);
    const prefIdx = AGE_ORDER.indexOf(profile.agePreference);
    const steps = Math.abs(dogIdx - prefIdx);
    if (steps === 0) {
      ageScore = 7;
      positiveFactors.push("This dog's age fits your preference.");
    } else if (steps === 1) {
      ageScore = 4;
    } else {
      ageScore = 2;
    }
  }
  breakdown.push({
    category: "Age Preference",
    score: ageScore,
    maxScore: 7,
    detail: `Age preference: ${ageScore}/7`,
  });

  // ─── 9. Grooming Fit — 4 pts ─────────────────────────────────────────────
  const groomNeed = dog.groomingNeeds ?? "Unknown";
  let groomScore: number;
  if (groomNeed === "Unknown") {
    groomScore = 2;
    confidence -= 6;
    shelterQuestions.push("How much grooming does this dog's coat need?");
  } else if (!profile.groomingTolerance) {
    groomScore = 4;
  } else {
    const needIdx = GROOM_ORDER.indexOf(groomNeed);
    const tolIdx = GROOM_ORDER.indexOf(profile.groomingTolerance);
    const diff = needIdx - tolIdx;
    if (diff <= 0) {
      groomScore = 4;
    } else if (diff === 1) {
      groomScore = 2;
    } else {
      groomScore = 0;
      concerns.push(
        "This dog's coat needs more grooming than you indicated you're up for.",
      );
    }
  }
  breakdown.push({
    category: "Grooming Fit",
    score: groomScore,
    maxScore: 4,
    detail: `Grooming fit: ${groomScore}/4`,
  });

  // ─── 10. Special Needs — 4 pts ───────────────────────────────────────────
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

  // ─── 11. Sex Preference — 2 pts ──────────────────────────────────────────
  const dogSex = dog.gender ?? "Unknown";
  let sexScore: number;
  if (dogSex === "Unknown") {
    sexScore = 1;
    confidence -= 2;
  } else if (!profile.sexPreference || profile.sexPreference === "No Preference") {
    sexScore = 2;
  } else {
    sexScore = profile.sexPreference === dogSex ? 2 : 0;
  }
  breakdown.push({
    category: "Sex Preference",
    score: sexScore,
    maxScore: 2,
    detail: `Sex preference: ${sexScore}/2`,
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
