// @vitest-environment node
import { describe, expect, it } from "vitest";
import { mockProvider } from "@/lib/providers/mock-provider";

const RAW_RESCUEGROUPS_KEYS = ["animals", "breeds", "shelters", "adoptionUrl"];

describe("Provider interface contract (Story 2.1)", () => {
  it("searchDogs returns an array of NormalizedDog objects", async () => {
    const dogs = await mockProvider.searchDogs({ zip: "10001" });

    expect(Array.isArray(dogs)).toBe(true);
    expect(dogs.length).toBeGreaterThan(0);

    const first = dogs[0];
    expect(first).toHaveProperty("provider");
    expect(first).toHaveProperty("externalId");
    expect(first).toHaveProperty("name");
    expect(Array.isArray(first.photos)).toBe(true);
  });

  it("getDogById returns the matching dog", async () => {
    const dog = await mockProvider.getDogById("rescuegroups", "mock-001");

    expect(dog).not.toBeNull();
    expect(dog?.name).toBe("Biscuit");
    expect(dog?.externalId).toBe("mock-001");
  });

  it("getDogById returns null when the dog is not found", async () => {
    const dog = await mockProvider.getDogById("rescuegroups", "does-not-exist");
    expect(dog).toBeNull();
  });

  it("mock provider data contains no raw RescueGroups field names", async () => {
    const dogs = await mockProvider.searchDogs({ zip: "10001" });

    for (const dog of dogs) {
      for (const rawKey of RAW_RESCUEGROUPS_KEYS) {
        expect(
          Object.prototype.hasOwnProperty.call(dog, rawKey),
          `NormalizedDog must not have raw RescueGroups field "${rawKey}"`
        ).toBe(false);
      }
    }
  });
});
