export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }
}

export class RateLimitError extends Error {
  constructor() {
    super("Rate limited by RescueGroups");
    this.name = "RateLimitError";
  }
}

export type RescueGroupsApiAnimal = {
  id: string;
  type: "animals";
  attributes: {
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
};

export type RescueGroupsApiShelter = {
  id: string;
  type: "shelters";
  attributes: {
    name?: string | null;
    adoptionUrl?: string | null;
  };
};

export type RescueGroupsApiResponse = {
  data: RescueGroupsApiAnimal[];
  included?: Array<RescueGroupsApiAnimal | RescueGroupsApiShelter>;
  meta?: {
    pagination?: {
      total?: number;
      pageNumber?: number;
      pageSize?: number;
    };
  };
};

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
