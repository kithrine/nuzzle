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
  relationships?: {
    pictures?: { data?: Array<{ id: string; type: string }> };
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

// RescueGroups v5 returns photo URLs as a separate `pictures` resource in the
// response `included` array — not inside `animals.attributes`.
export type RescueGroupsApiPicture = {
  id: string;
  type: "pictures";
  attributes: {
    order?: number | null;
    original?: { url?: string | null } | null;
    large?: { url?: string | null } | null;
    small?: { url?: string | null } | null;
    url?: string | null;
  };
};

export type RescueGroupsApiResponse = {
  data: RescueGroupsApiAnimal[];
  included?: Array<RescueGroupsApiAnimal | RescueGroupsApiShelter | RescueGroupsApiPicture>;
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
