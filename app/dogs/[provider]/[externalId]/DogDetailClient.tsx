"use client";

import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

type CompatibilityProp =
  | { available: false; teaser: string }
  | { available: true; result: CompatibilityResult };

type Props = { dog: NormalizedDog; compatibility: CompatibilityProp };

export function DogDetailClient({ dog, compatibility }: Props) {
  const breed = dog.breed ?? "Mixed Breed";
  const photo = dog.photos[0] ?? "";

  function handleShelterClick() {
    window.dispatchEvent(
      new CustomEvent("shelter_click", {
        detail: { dogId: dog.externalId, provider: dog.provider },
      })
    );
  }

  return (
    <main>
      {photo && <img src={photo} alt={dog.name} />}

      <section>
        <h1>{dog.name}</h1>
        <p>
          {dog.ageGroup} &bull; {dog.sizeGroup} &bull; {breed}
        </p>
        {dog.shelterName && <p>{dog.shelterName}</p>}
        {dog.distance != null && <p>{dog.distance} miles away</p>}
        {dog.description && <p>{dog.description}</p>}
      </section>

      <section>
        {compatibility.available === false ? (
          <div>
            <p>Compatibility Analysis Available</p>
            <p>{compatibility.teaser}</p>
            <ul>
              <li>Match Score</li>
              <li>Compatibility Explanation</li>
              <li>Potential Concerns</li>
              <li>Questions to Ask the Shelter</li>
            </ul>
            <a href="/profile">Get My Compatibility Match</a>
          </div>
        ) : (
          <div>
            <p>
              {compatibility.result.matchLabel} &bull;{" "}
              {compatibility.result.compatibilityScore}%
            </p>
            <p>{compatibility.result.confidenceLabel} Confidence</p>
            {compatibility.result.shelterQuestions.length > 0 && (
              <section>
                <h2>Before You Apply</h2>
                <p>We recommend asking the shelter:</p>
                <ul>
                  {compatibility.result.shelterQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </section>

      {dog.shelterUrl && (
        <a href={dog.shelterUrl} target="_blank" rel="noreferrer" onClick={handleShelterClick}>
          Visit Shelter Listing
        </a>
      )}
    </main>
  );
}
