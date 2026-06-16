import type { NormalizedDog } from "@/lib/compatibility/types";
import type { PetProvider, SearchDogsParams } from "@/lib/providers/types";

const MOCK_DOGS: NormalizedDog[] = [
  {
    provider: "rescuegroups",
    externalId: "mock-001",
    name: "Biscuit",
    breed: "Labrador Mix",
    ageGroup: "Young",
    sizeGroup: "Medium",
    energyLevel: "High",
    activityLevel: "High",
    exerciseNeeds: "High",
    isKidsOk: true,
    isCatsOk: false,
    isDogsOk: true,
    isSpecialNeeds: false,
    isYardRequired: true,
    fenceNeeds: "Any type",
    ownerExperience: "Species",
    photos: ["https://example.test/biscuit.jpg"],
    shelterName: "Happy Paws Shelter",
    shelterUrl: "https://example.test/adopt/biscuit",
    description: "A playful and energetic pup who loves outdoor adventures.",
    distance: 4.2,
  },
  {
    provider: "rescuegroups",
    externalId: "mock-002",
    name: "Mochi",
    breed: "Shih Tzu",
    ageGroup: "Senior",
    sizeGroup: "Small",
    energyLevel: "Low",
    activityLevel: "Low",
    exerciseNeeds: "Low",
    isKidsOk: "Unknown",
    isCatsOk: "Unknown",
    isDogsOk: "Unknown",
    isSpecialNeeds: "Unknown",
    isYardRequired: false,
    fenceNeeds: "Not required",
    ownerExperience: "None",
    photos: [],
    shelterName: "City Animal Rescue",
    shelterUrl: undefined,
    description: null,
    distance: 12.0,
  },
];

export const mockProvider: PetProvider = {
  async searchDogs(_: SearchDogsParams): Promise<NormalizedDog[]> {
    return MOCK_DOGS;
  },

  async getDogById(
    _provider: string,
    externalId: string
  ): Promise<NormalizedDog | null> {
    return MOCK_DOGS.find((d) => d.externalId === externalId) ?? null;
  },
};
