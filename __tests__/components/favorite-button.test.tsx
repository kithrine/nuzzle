import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FavoriteButton } from "@/components/FavoriteButton";

const mockUseUser = vi.hoisted(() => vi.fn());
vi.mock("@clerk/nextjs", () => ({
  useUser: mockUseUser,
}));

const SIGNED_IN = { isSignedIn: true, isLoaded: true, user: { id: "user-1" } };
const SIGNED_OUT = { isSignedIn: false, isLoaded: true, user: null };

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("FAVOR-009: renders outline state when initialFavorited is false", () => {
    mockUseUser.mockReturnValue(SIGNED_IN);
    render(<FavoriteButton provider="rescuegroups" externalId="rg-123" initialFavorited={false} />);

    const btn = screen.getByTestId("favorite-btn");
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("FAVOR-010: renders filled state when initialFavorited is true", () => {
    mockUseUser.mockReturnValue(SIGNED_IN);
    render(<FavoriteButton provider="rescuegroups" externalId="rg-123" initialFavorited={true} />);

    const btn = screen.getByTestId("favorite-btn");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("FAVOR-011: click when anonymous shows sign-in prompt, does not call fetch", () => {
    mockUseUser.mockReturnValue(SIGNED_OUT);
    render(<FavoriteButton provider="rescuegroups" externalId="rg-123" />);

    fireEvent.click(screen.getByTestId("favorite-btn"));

    expect(screen.getByTestId("sign-in-prompt")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("FAVOR-012: click when authenticated and not favorited — calls POST, aria-pressed becomes true", async () => {
    mockUseUser.mockReturnValue(SIGNED_IN);
    render(<FavoriteButton provider="rescuegroups" externalId="rg-123" initialFavorited={false} />);

    fireEvent.click(screen.getByTestId("favorite-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("favorite-btn").getAttribute("aria-pressed")).toBe("true");
    });
    expect(fetch).toHaveBeenCalledWith("/api/favorites", expect.objectContaining({ method: "POST" }));
  });

  it("FAVOR-013: click when authenticated and favorited — calls DELETE, aria-pressed becomes false", async () => {
    mockUseUser.mockReturnValue(SIGNED_IN);
    render(<FavoriteButton provider="rescuegroups" externalId="rg-123" initialFavorited={true} />);

    fireEvent.click(screen.getByTestId("favorite-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("favorite-btn").getAttribute("aria-pressed")).toBe("false");
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/favorites/rescuegroups/rg-123",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
