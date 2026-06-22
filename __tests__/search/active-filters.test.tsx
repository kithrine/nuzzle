import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFilters } from "@/components/ActiveFilters";
import type { FilterValues } from "@/components/SearchFilters";

const BASE: FilterValues = { zip: "", radius: "25", breed: "", ageGroup: "", sizeGroup: "" };

describe("ActiveFilters", () => {
  it("AF-001: renders a chip per active filter plus Clear all", () => {
    render(
      <ActiveFilters
        filters={{ ...BASE, breed: "Labrador", ageGroup: "Senior" }}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByText(/labrador/i)).toBeInTheDocument();
    expect(screen.getByText(/senior/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
  });

  it("AF-002: clicking a chip's remove calls onRemove with the field", () => {
    const onRemove = vi.fn();
    render(
      <ActiveFilters filters={{ ...BASE, breed: "Labrador" }} onRemove={onRemove} onClear={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /remove breed/i }));
    expect(onRemove).toHaveBeenCalledWith("breed");
  });

  it("AF-003: Clear all calls onClear", () => {
    const onClear = vi.fn();
    render(
      <ActiveFilters filters={{ ...BASE, breed: "Labrador" }} onRemove={vi.fn()} onClear={onClear} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it("AF-004: renders nothing when no filters are active", () => {
    const { container } = render(
      <ActiveFilters filters={BASE} onRemove={vi.fn()} onClear={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
