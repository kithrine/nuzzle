// @vitest-environment node
import { describe, expect, it } from "vitest";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import type { RescueGroupsRawDog } from "@/lib/rescuegroups/types";

// A complete raw record with all recognized values — used as the happy-path base.
const FULL_RAW: RescueGroupsRawDog = {
  animals: {
    name: "Rex",
    breeds: { primary: "German Shepherd" },
    ageGroup: "Adult",
    sizeGroup: "Large",
    isKidsOk: true,
    isCatsOk: false,
    isDogsOk: true,
    energyLevel: "High",
    activityLevel: "Moderate",
    exerciseNeeds: "High",
    isSpecialNeeds: false,
    isYardRequired: true,
    fenceNeeds: "6 foot",
    ownerExperience: "Breed",
    photos: ["https://example.test/rex.jpg"],
    description: "A loyal and protective dog.",
  },
  shelters: {
    name: "Metro Animal Rescue",
    adoptionUrl: "https://example.test/adopt/rex",
  },
};

describe("normalizeRescueGroupsDog", () => {
  describe("field mapping — complete data", () => {
    it("maps all fields correctly from complete raw data", () => {
      const dog = normalizeRescueGroupsDog(FULL_RAW, "rg-100", 7.5);

      expect(dog.provider).toBe("rescuegroups");
      expect(dog.externalId).toBe("rg-100");
      expect(dog.name).toBe("Rex");
      expect(dog.breed).toBe("German Shepherd");
      expect(dog.ageGroup).toBe("Adult");
      expect(dog.sizeGroup).toBe("Large");
      expect(dog.isKidsOk).toBe(true);
      expect(dog.isCatsOk).toBe(false);
      expect(dog.isDogsOk).toBe(true);
      expect(dog.energyLevel).toBe("High");
      expect(dog.activityLevel).toBe("Moderate");
      expect(dog.exerciseNeeds).toBe("High");
      expect(dog.isSpecialNeeds).toBe(false);
      expect(dog.isYardRequired).toBe(true);
      expect(dog.fenceNeeds).toBe("6 foot");
      expect(dog.ownerExperience).toBe("Breed");
      expect(dog.photos).toEqual(["https://example.test/rex.jpg"]);
      expect(dog.description).toBe("A loyal and protective dog.");
      expect(dog.shelterName).toBe("Metro Animal Rescue");
      expect(dog.shelterUrl).toBe("https://example.test/adopt/rex");
      expect(dog.distance).toBe(7.5);
    });
  });

  describe("domain fields missing or ambiguous → 'Unknown' (never false)", () => {
    it("isKidsOk absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, isKidsOk: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").isKidsOk).toBe("Unknown");
    });

    it("isKidsOk = null → 'Unknown' (null is not false)", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, isKidsOk: null },
      };
      expect(normalizeRescueGroupsDog(raw, "x").isKidsOk).toBe("Unknown");
    });

    it("isCatsOk absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, isCatsOk: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").isCatsOk).toBe("Unknown");
    });

    it("isDogsOk absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, isDogsOk: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").isDogsOk).toBe("Unknown");
    });

    it("ageGroup absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, ageGroup: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").ageGroup).toBe("Unknown");
    });

    it("ageGroup with unrecognized string → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, ageGroup: "Puppy" },
      };
      expect(normalizeRescueGroupsDog(raw, "x").ageGroup).toBe("Unknown");
    });

    it("sizeGroup absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, sizeGroup: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").sizeGroup).toBe("Unknown");
    });

    it("all three energy fields absent → all 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: {
          ...FULL_RAW.animals,
          energyLevel: undefined,
          activityLevel: undefined,
          exerciseNeeds: undefined,
        },
      };
      const dog = normalizeRescueGroupsDog(raw, "x");
      expect(dog.energyLevel).toBe("Unknown");
      expect(dog.activityLevel).toBe("Unknown");
      expect(dog.exerciseNeeds).toBe("Unknown");
    });

    it("ownerExperience absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, ownerExperience: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").ownerExperience).toBe(
        "Unknown"
      );
    });

    it("fenceNeeds absent → 'Unknown'", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, fenceNeeds: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").fenceNeeds).toBe("Unknown");
    });

    it("isYardRequired = null → 'Unknown' (null is not false)", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, isYardRequired: null },
      };
      expect(normalizeRescueGroupsDog(raw, "x").isYardRequired).toBe(
        "Unknown"
      );
    });
  });

  describe("metadata fields → null or []", () => {
    it("photos absent → empty array []", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, photos: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").photos).toEqual([]);
    });

    it("description absent → null", () => {
      const raw: RescueGroupsRawDog = {
        animals: { ...FULL_RAW.animals, description: undefined },
      };
      expect(normalizeRescueGroupsDog(raw, "x").description).toBeNull();
    });

    it("shelterUrl absent → undefined", () => {
      const raw: RescueGroupsRawDog = {
        animals: FULL_RAW.animals,
        shelters: undefined,
      };
      expect(normalizeRescueGroupsDog(raw, "x").shelterUrl).toBeUndefined();
    });
  });

  describe("real RescueGroups v5 attribute names", () => {
    it("maps breedPrimary → breed", () => {
      const raw: RescueGroupsRawDog = {
        animals: { name: "Allie", breedPrimary: "German Shepherd Dog", ageGroup: "Adult" },
      };
      expect(normalizeRescueGroupsDog(raw, "x").breed).toBe("German Shepherd Dog");
    });

    it("maps descriptionText → description", () => {
      const raw: RescueGroupsRawDog = {
        animals: { name: "Allie", descriptionText: "Sweet and playful." },
      };
      expect(normalizeRescueGroupsDog(raw, "x").description).toBe("Sweet and playful.");
    });

    it("maps sex → gender (Male/Female), else Unknown", () => {
      expect(normalizeRescueGroupsDog({ animals: { sex: "Female" } }, "x").gender).toBe("Female");
      expect(normalizeRescueGroupsDog({ animals: { sex: "Male" } }, "x").gender).toBe("Male");
      expect(normalizeRescueGroupsDog({ animals: {} }, "x").gender).toBe("Unknown");
    });

    it("uses the attribute distance when no distance arg is passed", () => {
      const raw: RescueGroupsRawDog = { animals: { name: "Allie", distance: 18 } };
      expect(normalizeRescueGroupsDog(raw, "x").distance).toBe(18);
    });

    it("an explicit distance arg overrides the attribute distance", () => {
      const raw: RescueGroupsRawDog = { animals: { name: "Allie", distance: 18 } };
      expect(normalizeRescueGroupsDog(raw, "x", 5).distance).toBe(5);
    });

    it("decodes HTML entities in the description", () => {
      const raw: RescueGroupsRawDog = {
        animals: {
          name: "Allie",
          descriptionText: "She didn&#39;t&nbsp;&nbsp;mind cats &amp; dogs.",
        },
      };
      expect(normalizeRescueGroupsDog(raw, "x").description).toBe(
        "She didn't mind cats & dogs."
      );
    });
  });
});
