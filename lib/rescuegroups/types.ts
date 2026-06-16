export type RescueGroupsRawDog = {
  animals: {
    name?: string | null;
    breeds?: { primary?: string | null } | null;
    ageGroup?: string | null;
    sizeGroup?: string | null;
    isKidsOk?: boolean | null;
    isCatsOk?: boolean | null;
    isDogsOk?: boolean | null;
    energyLevel?: string | null;
    activityLevel?: string | null;
    exerciseNeeds?: string | null;
    isSpecialNeeds?: boolean | null;
    isYardRequired?: boolean | null;
    fenceNeeds?: string | null;
    ownerExperience?: string | null;
    photos?: string[] | null;
    description?: string | null;
  };
  shelters?: {
    name?: string | null;
    adoptionUrl?: string | null;
  } | null;
};
