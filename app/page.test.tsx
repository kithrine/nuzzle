import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the Nuzzle heading and tagline", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /nuzzle/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/find a dog that fits your lifestyle/i),
    ).toBeInTheDocument();
  });
});
