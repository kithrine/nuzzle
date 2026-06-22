// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";

describe("FeaturedCarousel", () => {
  beforeEach(() => {
    // jsdom does not implement scrollBy; provide a spy on the prototype.
    (HTMLElement.prototype as unknown as { scrollBy: () => void }).scrollBy = vi.fn();
  });

  it("renders its children", () => {
    render(
      <FeaturedCarousel>
        <div>card content</div>
      </FeaturedCarousel>,
    );
    expect(screen.getByText("card content")).toBeInTheDocument();
  });

  it("exposes left and right scroll buttons", () => {
    render(
      <FeaturedCarousel>
        <div>card content</div>
      </FeaturedCarousel>,
    );
    expect(screen.getByRole("button", { name: /scroll left/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /scroll right/i })).toBeInTheDocument();
  });

  it("scrolls right by a positive offset when the right arrow is clicked", () => {
    const scrollBy = HTMLElement.prototype.scrollBy as unknown as ReturnType<typeof vi.fn>;
    render(
      <FeaturedCarousel>
        <div>card content</div>
      </FeaturedCarousel>,
    );
    fireEvent.click(screen.getByRole("button", { name: /scroll right/i }));
    expect(scrollBy).toHaveBeenCalled();
    const arg = scrollBy.mock.calls[0][0];
    expect(arg.left).toBeGreaterThan(0);
  });

  it("scrolls left by a negative offset when the left arrow is clicked", () => {
    const scrollBy = HTMLElement.prototype.scrollBy as unknown as ReturnType<typeof vi.fn>;
    render(
      <FeaturedCarousel>
        <div>card content</div>
      </FeaturedCarousel>,
    );
    fireEvent.click(screen.getByRole("button", { name: /scroll left/i }));
    expect(scrollBy).toHaveBeenCalled();
    const arg = scrollBy.mock.calls[0][0];
    expect(arg.left).toBeLessThan(0);
  });
});
