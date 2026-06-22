// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopNav } from "@/components/layout/TopNav";

const mockUseUser = vi.hoisted(() => vi.fn());
vi.mock("@clerk/nextjs", () => ({
  useUser: mockUseUser,
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const SIGNED_IN = { isSignedIn: true, isLoaded: true, user: { id: "user-1" } };
const SIGNED_OUT = { isSignedIn: false, isLoaded: true, user: null };

describe("TopNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Home and Browse Dogs and Log In for anonymous users (no Dashboard)", () => {
    mockUseUser.mockReturnValue(SIGNED_OUT);
    render(<TopNav />);

    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /browse dogs/i })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
  });

  it("shows Home, Browse Dogs, and Dashboard for signed-in users (UserButton, no Log In)", () => {
    mockUseUser.mockReturnValue(SIGNED_IN);
    render(<TopNav />);

    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /browse dogs/i })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/favorites");
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
  });
});
