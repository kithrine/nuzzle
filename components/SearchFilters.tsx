import { useState } from "react";

export type FilterValues = {
  zip: string;
  radius: string;
  breed: string;
  ageGroup: string;
  sizeGroup: string;
};

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
    <form onSubmit={handleSubmit}>
      <label htmlFor="zip">ZIP Code</label>
      <input
        id="zip"
        type="text"
        value={values.zip}
        onChange={(e) => set("zip", e.target.value)}
        placeholder="Enter ZIP code"
        required
      />

      <label htmlFor="radius">Radius</label>
      <select
        id="radius"
        value={values.radius}
        onChange={(e) => set("radius", e.target.value)}
      >
        <option value="10">10 miles</option>
        <option value="25">25 miles</option>
        <option value="50">50 miles</option>
        <option value="100">100 miles</option>
      </select>

      <label htmlFor="breed">Breed</label>
      <input
        id="breed"
        type="text"
        value={values.breed}
        onChange={(e) => set("breed", e.target.value)}
        placeholder="Any breed"
      />

      <label htmlFor="ageGroup">Age Group</label>
      <select
        id="ageGroup"
        value={values.ageGroup}
        onChange={(e) => set("ageGroup", e.target.value)}
      >
        <option value="">All Ages</option>
        <option value="Baby">Baby</option>
        <option value="Young">Young</option>
        <option value="Adult">Adult</option>
        <option value="Senior">Senior</option>
      </select>

      <label htmlFor="sizeGroup">Size Group</label>
      <select
        id="sizeGroup"
        value={values.sizeGroup}
        onChange={(e) => set("sizeGroup", e.target.value)}
      >
        <option value="">All Sizes</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="X-Large">X-Large</option>
      </select>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
