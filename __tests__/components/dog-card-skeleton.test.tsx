// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DogCardSkeleton, DogCardSkeletonGrid } from "@/components/DogCardSkeleton";

describe("DogCardSkeleton", () => {
  it("is a presentational placeholder hidden from the accessibility tree", () => {
    const { container } = render(<DogCardSkeleton />);
    const skeleton = screen.getByTestId("dog-card-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

describe("DogCardSkeletonGrid", () => {
  it("announces a loading status with an accessible name", () => {
    render(<DogCardSkeletonGrid />);
    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
  });

  it("renders the requested number of skeleton cards", () => {
    render(<DogCardSkeletonGrid count={9} />);
    expect(screen.getAllByTestId("dog-card-skeleton")).toHaveLength(9);
  });

  it("defaults to 6 skeleton cards", () => {
    render(<DogCardSkeletonGrid />);
    expect(screen.getAllByTestId("dog-card-skeleton")).toHaveLength(6);
  });
});
