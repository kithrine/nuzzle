import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the hero headline and primary CTA", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /find a dog that fits your lifestyle/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse dogs/i }),
    ).toBeInTheDocument();
  });

  it("renders the How It Works section", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /how it works/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/create profile/i)).toBeInTheDocument();
    expect(screen.getByText(/get match scores/i)).toBeInTheDocument();
    expect(screen.getByText(/find your dog/i)).toBeInTheDocument();
  });

  it("renders the Featured Dogs section with sample dogs", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /featured dogs/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Bella")).toBeInTheDocument();
  });
});
