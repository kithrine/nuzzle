export type NormalizedDog = {
  provider: "rescuegroups";
  externalId: string;
  name: string;
  breed: string | null;
  ageGroup: "Baby" | "Young" | "Adult" | "Senior" | "Unknown";
  sizeGroup: "Small" | "Medium" | "Large" | "X-Large" | "Unknown";
  energyLevel: "Low" | "Moderate" | "High" | "Unknown";
  activityLevel: "Low" | "Moderate" | "High" | "Unknown";
  exerciseNeeds: "Low" | "Moderate" | "High" | "Unknown";
  isKidsOk: boolean | "Unknown";
  isCatsOk: boolean | "Unknown";
  isDogsOk: boolean | "Unknown";
  isSpecialNeeds: boolean | "Unknown";
  isYardRequired: boolean | "Unknown";
  fenceNeeds: "Not required" | "Any type" | "3 foot" | "6 foot" | "Unknown";
  ownerExperience: "None" | "Species" | "Breed" | "Unknown";
  photos: string[];
  shelterName?: string;
  shelterUrl?: string;
  description: string | null;
  distance: number | null;
};

export type MatchLabel =
  | "Strong Match"
  | "Good Match"
  | "Possible Match"
  | "Low Match";
export type ConfidenceLabel = "High" | "Medium" | "Low";

export interface CompatibilityBreakdown {
  category: string;
  score: number;
  maxScore: number;
  detail: string;
}

export interface CompatibilityResult {
  compatibilityScore: number;
  matchLabel: MatchLabel;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  breakdown: CompatibilityBreakdown[];
  positiveFactors: string[];
  concerns: string[];
  shelterQuestions: string[];
}

export interface AdopterProfile {
  homeType: "Apartment" | "House" | "Other";
  hasChildren: boolean;
  hasCats: boolean;
  hasOtherDogs: boolean;
  activityLevel: "Low" | "Moderate" | "High";
  experienceLevel: "None" | "Species" | "Breed";
  groomingTolerance?: "Low" | "Moderate" | "High";
  hasFence?: boolean;
  hasYard?: boolean;
  specialNeedsWilling?: boolean;
  maxDistance?: number;
  sizePreference?: "Small" | "Medium" | "Large" | "X-Large" | "No Preference";
}
