import { describe, expect, it } from "vitest";
import { formatAgeGroup } from "@/lib/compatibility/display";

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
