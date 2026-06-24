import { describe, expect, it } from "vitest";
import { formatAgeGroup, formatDogCount } from "@/lib/compatibility/display";

describe("formatAgeGroup", () => {
  it("relabels RescueGroups 'Baby' to the friendlier 'Puppy'", () => {
    expect(formatAgeGroup("Baby")).toBe("Puppy");
  });

  it("passes through the other age groups unchanged", () => {
    expect(formatAgeGroup("Young")).toBe("Young");
    expect(formatAgeGroup("Adult")).toBe("Adult");
    expect(formatAgeGroup("Senior")).toBe("Senior");
    expect(formatAgeGroup("Unknown")).toBe("Unknown");
  });
});

describe("formatDogCount", () => {
  it("says 'No dogs' when there are zero results", () => {
    expect(formatDogCount(0)).toBe("No dogs");
  });

  it("uses the singular noun for exactly one dog", () => {
    expect(formatDogCount(1)).toBe("1 dog");
  });

  it("uses the plural noun for many dogs", () => {
    expect(formatDogCount(24)).toBe("24 dogs");
  });

  it("preserves the thousands separator", () => {
    expect(formatDogCount(1234)).toBe("1,234 dogs");
  });
});
