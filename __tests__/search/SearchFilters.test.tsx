import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchFilters } from "@/components/SearchFilters";

const DEFAULT_VALUES = {
  zip: "",
  radius: "25",
  breed: "",
  ageGroup: "",
  sizeGroup: "",
};

describe("SearchFilters", () => {
  it("renders ZIP input, radius select, breed input, age group select, size group select", () => {
    render(<SearchFilters defaultValues={DEFAULT_VALUES} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/zip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/radius/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/breed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
  });

  it("radius select has 10, 25, 50, 100 mile options with 25 as default", () => {
    render(<SearchFilters defaultValues={DEFAULT_VALUES} onSubmit={vi.fn()} />);
    const radiusSelect = screen.getByLabelText(/radius/i);
    expect(radiusSelect).toHaveValue("25");
    expect(screen.getByRole("option", { name: /^10 miles?$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /25.*miles?/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /50.*miles?/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /100.*miles?/i })).toBeInTheDocument();
  });

  it("age group select has All Ages plus Baby, Young, Adult, Senior options", () => {
    render(<SearchFilters defaultValues={DEFAULT_VALUES} onSubmit={vi.fn()} />);
    expect(screen.getByRole("option", { name: /all ages/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^puppy$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^young$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^adult$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^senior$/i })).toBeInTheDocument();
  });

  it("size group select has All Sizes plus Small, Medium, Large, X-Large options", () => {
    render(<SearchFilters defaultValues={DEFAULT_VALUES} onSubmit={vi.fn()} />);
    expect(screen.getByRole("option", { name: /all sizes/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^small$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^medium$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^large$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /x-large/i })).toBeInTheDocument();
  });

  it("submitting the form calls onSubmit with current filter values", () => {
    const onSubmit = vi.fn();
    render(
      <SearchFilters
        defaultValues={{ ...DEFAULT_VALUES, zip: "10001" }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: "Young" } });
    fireEvent.change(screen.getByLabelText(/size/i), { target: { value: "Medium" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ zip: "10001", ageGroup: "Young", sizeGroup: "Medium" })
    );
  });

  it("ZIP is optional — no required attribute, form submits nationwide with empty zip", () => {
    const onSubmit = vi.fn();
    render(<SearchFilters defaultValues={DEFAULT_VALUES} onSubmit={onSubmit} />);

    expect(screen.getByLabelText(/zip/i)).not.toHaveAttribute("required");

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ zip: "" }));
  });

  it("optional filters are not required — form submits successfully with only zip", () => {
    const onSubmit = vi.fn();
    render(
      <SearchFilters
        defaultValues={{ ...DEFAULT_VALUES, zip: "10001" }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ zip: "10001", breed: "", ageGroup: "", sizeGroup: "" })
    );
  });
});
