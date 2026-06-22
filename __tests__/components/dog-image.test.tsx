import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DogImage } from "@/components/DogImage";

describe("DogImage", () => {
  it("DOGIMG-001: foreground shows the whole image (object-contain) with the alt text", () => {
    render(
      <div className="relative">
        <DogImage src="https://example.test/rex.jpg" alt="Rex" />
      </div>,
    );
    const fg = screen.getByRole("img", { name: "Rex" });
    expect(fg).toHaveAttribute("src", "https://example.test/rex.jpg");
    expect(fg.className).toContain("object-contain");
  });

  it("DOGIMG-002: renders a decorative blurred backdrop (presentational, not in a11y tree)", () => {
    const { container } = render(
      <div className="relative">
        <DogImage src="https://example.test/rex.jpg" alt="Rex" />
      </div>,
    );
    // Two <img> layers: backdrop + foreground.
    expect(container.querySelectorAll("img")).toHaveLength(2);
    // Only the foreground is exposed to assistive tech.
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
