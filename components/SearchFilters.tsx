import { useState } from "react";
import { MapPin } from "lucide-react";

export type FilterValues = {
  zip: string;
  radius: string;
  breed: string;
  ageGroup: string;
  sizeGroup: string;
};

const inputClasses =
  "border border-border rounded-button-inline px-3 py-2 text-sm bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

export function SearchFilters({
  defaultValues,
  onSubmit,
  isLoading = false,
}: {
  defaultValues: FilterValues;
  onSubmit: (values: FilterValues) => void;
  isLoading?: boolean;
}) {
  const [values, setValues] = useState<FilterValues>(defaultValues);

  function set(field: keyof FilterValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-card p-3 md:p-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
    >
      {/* ZIP */}
      <div className="flex flex-col gap-1 md:flex-1 md:min-w-[150px]">
        <label htmlFor="zip" className="sr-only">
          ZIP Code
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="zip"
            type="text"
            value={values.zip}
            onChange={(e) => set("zip", e.target.value)}
            placeholder="Enter ZIP code"
            required
            className={`${inputClasses} w-full pl-9`}
          />
        </div>
      </div>

      {/* Radius */}
      <div className="flex flex-col gap-1">
        <label htmlFor="radius" className="sr-only">
          Radius
        </label>
        <select
          id="radius"
          value={values.radius}
          onChange={(e) => set("radius", e.target.value)}
          className={inputClasses}
        >
          <option value="10">10 miles</option>
          <option value="25">25 miles</option>
          <option value="50">50 miles</option>
          <option value="100">100 miles</option>
        </select>
      </div>

      {/* Breed */}
      <div className="flex flex-col gap-1 md:flex-1 md:min-w-[150px]">
        <label htmlFor="breed" className="sr-only">
          Breed
        </label>
        <input
          id="breed"
          type="text"
          value={values.breed}
          onChange={(e) => set("breed", e.target.value)}
          placeholder="Any breed"
          className={`${inputClasses} w-full`}
        />
      </div>

      {/* Age group */}
      <div className="flex flex-col gap-1">
        <label htmlFor="ageGroup" className="sr-only">
          Age Group
        </label>
        <select
          id="ageGroup"
          value={values.ageGroup}
          onChange={(e) => set("ageGroup", e.target.value)}
          className={inputClasses}
        >
          <option value="">All Ages</option>
          <option value="Baby">Puppy</option>
          <option value="Young">Young</option>
          <option value="Adult">Adult</option>
          <option value="Senior">Senior</option>
        </select>
      </div>

      {/* Size group */}
      <div className="flex flex-col gap-1">
        <label htmlFor="sizeGroup" className="sr-only">
          Size Group
        </label>
        <select
          id="sizeGroup"
          value={values.sizeGroup}
          onChange={(e) => set("sizeGroup", e.target.value)}
          className={inputClasses}
        >
          <option value="">All Sizes</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
          <option value="X-Large">X-Large</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-white rounded-button-inline px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
