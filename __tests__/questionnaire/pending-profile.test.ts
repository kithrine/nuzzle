import { describe, it, expect, beforeEach } from "vitest";
import {
  savePendingProfile,
  loadPendingProfile,
  clearPendingProfile,
  type PendingProfile,
} from "@/lib/questionnaire/pending-profile";

const SAMPLE: PendingProfile = {
  homeType: "House",
  hasChildren: true,
  hasCats: false,
  hasOtherDogs: true,
  activityLevel: "Moderate",
  experienceLevel: "Species",
};

describe("pending-profile storage", () => {
  beforeEach(() => localStorage.clear());

  it("PEND-001: round-trips saved answers", () => {
    savePendingProfile(SAMPLE);
    expect(loadPendingProfile()).toEqual(SAMPLE);
  });

  it("PEND-002: returns null when nothing is saved", () => {
    expect(loadPendingProfile()).toBeNull();
  });

  it("PEND-003: clear removes saved answers", () => {
    savePendingProfile(SAMPLE);
    clearPendingProfile();
    expect(loadPendingProfile()).toBeNull();
  });

  it("PEND-004: returns null on corrupt data", () => {
    localStorage.setItem("nuzzle:pendingProfile", "{not valid json");
    expect(loadPendingProfile()).toBeNull();
  });
});
