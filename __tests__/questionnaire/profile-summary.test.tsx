import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { QuestionnaireClient, type EditProfileData } from "@/app/questionnaire/QuestionnaireClient";

// A complete saved profile drops QuestionnaireClient straight into edit mode,
// which shows the ProfileSummary ("What would you like to do?") view.
const PROFILE: EditProfileData = {
  homeType: "House",
  hasChildren: false,
  hasCats: false,
  hasOtherDogs: false,
  activityLevel: "Moderate",
  experienceLevel: "Species",
  groomingTolerance: "Moderate",
  hasFence: true,
  hasYard: true,
  specialNeedsWilling: false,
  maxDistance: 25,
  sizePreference: "Medium",
  agePreference: "Adult",
  sexPreference: "No Preference",
  hoursAlone: "4-8h",
  firstName: "Kit",
  lastName: "Tensfeldt",
  profileVersion: 1,
  updatedAt: new Date("2026-06-20").toISOString(),
};

describe("ProfileSummary — Improve Accuracy CTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
  });

  it("QUEST-008: the Improve Accuracy card reflects the 8-question Phase 2", () => {
    render(<QuestionnaireClient initialProfile={PROFILE} firstName="Kit" />);

    expect(screen.getByText(/answer 8 more questions/i)).toBeInTheDocument();
    expect(screen.queryByText(/answer 6 more questions/i)).not.toBeInTheDocument();
  });
});
