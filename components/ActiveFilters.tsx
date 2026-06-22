import { X } from "lucide-react";
import { formatAgeGroup } from "@/lib/compatibility/display";
import type { NormalizedDog } from "@/lib/compatibility/types";
import type { FilterValues } from "@/components/SearchFilters";

type FilterField = "zip" | "breed" | "ageGroup" | "sizeGroup";

// Shows the currently-applied filters as removable chips so users can drop one
// or clear all and return to their overall matches.
export function ActiveFilters({
  filters,
  onRemove,
  onClear,
}: {
  filters: FilterValues;
  onRemove: (field: FilterField) => void;
  onClear: () => void;
}) {
  const chips: { field: FilterField; label: string }[] = [];
  if (filters.breed) chips.push({ field: "breed", label: `Breed: ${filters.breed}` });
  if (filters.ageGroup)
    chips.push({
      field: "ageGroup",
      label: `Age: ${formatAgeGroup(filters.ageGroup as NormalizedDog["ageGroup"])}`,
    });
  if (filters.sizeGroup) chips.push({ field: "sizeGroup", label: `Size: ${filters.sizeGroup}` });
  if (filters.zip)
    chips.push({ field: "zip", label: `Within ${filters.radius} mi of ${filters.zip}` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      {chips.map(({ field, label }) => (
        <span
          key={field}
          className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-sm rounded-badge pl-3 pr-1.5 py-1"
        >
          {label}
          <button
            type="button"
            aria-label={`Remove ${field} filter`}
            onClick={() => onRemove(field)}
            className="rounded-full p-0.5 hover:bg-primary/15 transition-colors"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-text-secondary text-sm underline underline-offset-2 hover:text-text-primary transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}
