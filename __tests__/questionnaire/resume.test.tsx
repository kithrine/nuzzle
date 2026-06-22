import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const mockUseUser = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockReplace = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

import { QuestionnaireClient } from "@/app/questionnaire/QuestionnaireClient";
import { savePendingProfile, loadPendingProfile } from "@/lib/questionnaire/pending-profile";

describe("questionnaire resume + anonymous routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ profileVersion: 1 }) }),
    );
  });

  it("RESUME-001: signed-in user with pending answers auto-creates the profile and goes to matches", async () => {
    mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
    savePendingProfile({
      homeType: "House",
      hasChildren: true,
      hasCats: false,
      hasOtherDogs: true,
      activityLevel: "Moderate",
      experienceLevel: "Species",
    });

    render(<QuestionnaireClient initialProfile={null} firstName="Kit" />);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith("/search?source=questionnaire"),
    );
  });

  it("RESUME-002: anonymous user finishing Phase 1 saves answers and routes to /signup (no API write)", async () => {
    mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });

    render(<QuestionnaireClient initialProfile={null} firstName="" />);

    const next = () => fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    // Onboarding name step comes first.
    fireEvent.change(screen.getByPlaceholderText("First name"), { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByRole("button", { name: /house/i }));
    next();
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i })); // children
    next();
    fireEvent.click(screen.getByRole("button", { name: /^no$/i })); // cats
    next();
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i })); // other dogs
    next();
    fireEvent.click(screen.getByRole("button", { name: /moderate/i })); // activity
    next();
    fireEvent.click(screen.getByRole("button", { name: /owned dogs before/i })); // experience
    fireEvent.click(screen.getByRole("button", { name: /generate my matches/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/signup"));
    expect(fetch).not.toHaveBeenCalled();
    // Name is carried into the pending profile for the post-signup resume.
    expect(loadPendingProfile()?.firstName).toBe("Ada");
  });
});
