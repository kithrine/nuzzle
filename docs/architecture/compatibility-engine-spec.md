# Compatibility Engine Specification v1.0 — Nuzzle

Version: 1.0
Status: Approved — Implementation Ready

---

## Purpose

The Compatibility Engine generates a deterministic compatibility assessment between an adopter profile and an adoptable dog.

The engine is the core business logic of Nuzzle. AI must not calculate or alter the score.

The engine must be: Deterministic, Explainable, Testable, Independent of AI, Independent of external services.

---

## Core Principles

### Deterministic Results

The same adopter profile and dog profile must always produce the same result. No randomness. No machine learning. No AI scoring.

### Explainable Results

Every point awarded or removed must be explainable. Users should understand why a dog scored highly, why a dog scored poorly, and which data was missing.

### Unknown Does Not Mean False

Unknown shelter data must never be interpreted as negative. Unknown values receive partial credit, reduce confidence, and generate follow-up questions.

---

## Engine Signature

```ts
calculateCompatibility(
  userProfile: AdopterProfile,
  dog: NormalizedDog
): CompatibilityResult
```

No database calls. No API calls. No AI calls. No side effects.

---

## Engine Outputs

```ts
interface CompatibilityResult {
  compatibilityScore: number;         // 0–100
  matchLabel: MatchLabel;
  confidenceScore: number;            // 0–100
  confidenceLabel: ConfidenceLabel;
  breakdown: CompatibilityBreakdown[];
  positiveFactors: string[];
  concerns: string[];
  shelterQuestions: string[];
}

type MatchLabel = "Strong Match" | "Good Match" | "Possible Match" | "Low Match";
type ConfidenceLabel = "High" | "Medium" | "Low";

interface CompatibilityBreakdown {
  category: string;
  score: number;
  maxScore: number;
  detail: string;
}
```

---

## Match Labels

| Score Range | Label |
|-------------|-------|
| 85–100 | Strong Match |
| 70–84 | Good Match |
| 50–69 | Possible Match |
| 0–49 | Low Match |

---

## Confidence Labels

| Confidence Range | Label |
|-----------------|-------|
| 80–100 | High |
| 50–79 | Medium |
| 0–49 | Low |

**Confidence measures data completeness, not match quality.**

A dog can be a Strong Match with Low confidence (missing shelter data).
A dog can be a Low Match with High confidence (shelter provided complete data showing poor fit).

---

## Compatibility Weights (Total = 100 pts)

| Category | Weight |
|----------|--------|
| Kids compatibility | 18 |
| Cats compatibility | 18 |
| Dogs compatibility | 14 |
| Energy / activity fit | 16 |
| Home / yard / fence fit | 12 |
| Experience level | 10 |
| Size preference | 8 |
| Special needs tolerance | 4 |
| **Total** | **100** |

---

## Core Rule: Unknown Data

**Unknown dog data must never be treated as false.**

If a dog field is `"Unknown"`:
- Award neutral partial credit (see per-category rules below)
- Reduce the confidence score
- Add a relevant shelter question

This rule protects dogs with incomplete shelter profiles from being unfairly penalized.

---

## Category Rules

### Kids Compatibility — 18 pts

Applies when user has children in household.

| Dog `isKidsOk` | User Has Kids | Score |
|----------------|--------------|-------|
| `true` | yes | 18 |
| `false` | yes | 0 |
| `"Unknown"` | yes | 9 |
| any | no | 18 |

- **Concern generated when**: user has kids and `isKidsOk = false`
  - Message: "This dog is not recommended for homes with children."
- **Shelter question generated when**: user has kids and `isKidsOk = "Unknown"`
  - Question: "Has this dog lived with or been around children?"

---

### Cats Compatibility — 18 pts

Applies when user has cats in household.

| Dog `isCatsOk` | User Has Cats | Score |
|----------------|--------------|-------|
| `true` | yes | 18 |
| `false` | yes | 0 |
| `"Unknown"` | yes | 9 |
| any | no | 18 |

- **Concern generated when**: user has cats and `isCatsOk = false`
  - Message: "This dog is not recommended for homes with cats."
- **Shelter question generated when**: user has cats and `isCatsOk = "Unknown"`
  - Question: "Has this dog lived with or been tested around cats?"

---

### Dogs Compatibility — 14 pts

Applies when user has other dogs in household.

| Dog `isDogsOk` | User Has Dogs | Score |
|----------------|--------------|-------|
| `true` | yes | 14 |
| `false` | yes | 0 |
| `"Unknown"` | yes | 7 |
| any | no | 14 |

- **Concern generated when**: user has dogs and `isDogsOk = false`
  - Message: "This dog may not do well in a home with other dogs."
- **Shelter question generated when**: user has dogs and `isDogsOk = "Unknown"`
  - Question: "Has this dog been socialized with other dogs?"

---

### Energy / Activity Fit — 16 pts

Use dog fields in this priority order to determine energy level:
1. `energyLevel`
2. `activityLevel`
3. `exerciseNeeds`

Normalize to: `"Low" | "Moderate" | "High" | "Unknown"`

| User Preference | Dog Energy | Score |
|----------------|-----------|-------|
| Same | Same | 16 |
| Adjacent | (e.g., Moderate vs High) | 10 |
| Opposite | (e.g., Low vs High) | 2 |
| Any | `"Unknown"` | 8 |

Energy levels ordered: Low → Moderate → High
- Adjacent: one step apart (Low/Moderate or Moderate/High)
- Opposite: two steps apart (Low/High)

- **Concern generated when**: opposite match
  - Example: "You indicated you want a calm dog, but this breed is known for very high energy and exercise requirements."
- **Shelter question generated when**: energy `"Unknown"`
  - Question: "How much daily exercise does this dog currently need?"

---

### Home / Yard / Fence Fit — 12 pts (6 + 6)

#### Yard Requirement (6 pts)

| Condition | Score |
|-----------|-------|
| Dog does not require yard | 6 |
| Dog requires yard AND user has yard | 6 |
| Dog requires yard AND user has no yard | 0 |
| Yard requirement `"Unknown"` | 3 |

- **Concern generated when**: yard required and user has no yard
  - Message: "This dog requires a yard, but your profile does not indicate you have one."
- **Shelter question generated when**: yard requirement `"Unknown"`
  - Question: "Does this dog require access to a yard?"

#### Fence Requirement (6 pts)

Fence levels ordered by restrictiveness: Not required → Any type → 3 foot → 6 foot

| Condition | Score |
|-----------|-------|
| Fence not required | 6 |
| Fence required AND user has compatible fence | 6 |
| Fence required AND user lacks fence | 0 |
| Fence requirement `"Unknown"` | 3 |

- **Concern generated when**: fence required and user lacks fence
  - Message: "This dog requires a fenced yard, but your profile does not indicate you have one."
- **Shelter question generated when**: fence requirement `"Unknown"`
  - Question: "Does this dog require a fenced yard?"

---

### Experience Level — 10 pts

Normalize user experience:
- `"None"` — no previous dog ownership
- `"Species"` — owned dogs before, no breed-specific experience
- `"Breed"` — has breed-specific experience

| Dog Requirement | User Experience | Score |
|----------------|----------------|-------|
| None required | Any | 10 |
| Species | Species or Breed | 10 |
| Species | None | 4 |
| Breed | Breed | 10 |
| Breed | Species | 6 |
| Breed | None | 2 |
| `"Unknown"` | Any | 5 |

- **Concern generated when**: dog requires breed experience and user has none
  - Message: "This dog may need an experienced handler with familiarity with this breed."

---

### Size Preference — 8 pts

Size order: Small → Medium → Large → X-Large

| Match Type | Score |
|-----------|-------|
| Exact size match | 8 |
| User has no size preference | 8 |
| Adjacent size (one step) | 5 |
| Non-matching (two+ steps) | 2 |
| Size `"Unknown"` | 4 |

---

### Special Needs Tolerance — 4 pts

| Condition | Score |
|-----------|-------|
| Dog is not special needs | 4 |
| Dog is special needs AND user is willing | 4 |
| Dog is special needs AND user is not willing | 0 |
| Special needs status `"Unknown"` | 2 |

- **Concern generated when**: dog is special needs and user is not willing
  - Message: "This dog has special needs that your profile indicates you may not be prepared for."

---

## Confidence Calculation

Start at 100. Subtract points for missing key dog fields.

| Missing Field | Condition | Penalty |
|--------------|-----------|---------|
| `isKidsOk` | User has children | -15 |
| `isCatsOk` | User has cats | -15 |
| `isDogsOk` | User has other dogs | -12 |
| Energy/activity/exercise all `"Unknown"` | Always | -15 |
| `isYardRequired` | Always | -8 |
| `fenceNeeds` | Always | -8 |
| `ownerExperience` | Always | -8 |
| `sizeGroup` | Always | -6 |
| `isSpecialNeeds` | Always | -5 |

- Minimum confidence: 0
- Maximum confidence: 100

---

## Ranking Rule

For profiled users, results are sorted:

1. `compatibilityScore` descending (primary)
2. `confidenceScore` descending (tie-breaker)
3. Distance ascending (final tie-breaker)

**Compatibility and confidence are never merged into a single display score.** They remain separate values shown separately in the UI.

---

## Explanation Output

The engine produces structured text before AI is involved. AI uses this as input to generate a natural-language explanation.

### Positive Factors (examples)

- "This dog is marked as good with cats."
- "This dog's energy level matches your preference for a moderate-energy dog."
- "This dog does not require a fenced yard."
- "This dog's size fits your preference."

### Concerns (examples)

- "This dog may not be a fit because you have cats and the dog is marked as not cat-friendly."
- "This dog may require more daily activity than your profile suggests."
- "This dog requires a fenced yard, but your profile does not indicate you have one."
- "This dog may be a better fit for an experienced dog owner."

### Questions to Ask the Shelter (examples)

- "Has this dog lived with children?"
- "Has this dog been tested around cats?"
- "How much daily exercise does this dog currently need?"
- "Does this dog require a fenced yard?"
- "Has this dog been socialized with other dogs?"

---

## AI Restrictions

AI must never:
- Calculate scores
- Change scores
- Influence rankings
- Modify confidence

AI may only:
- Generate explanations
- Improve readability
- Summarize compatibility results

---

## TDD Test Suite Requirements

All tests documented in `docs/product/user-stories-tdd-plan.md`.

**Scoring Tests** (SCORE-001 through SCORE-034):
- Exact, adjacent, opposite energy matches
- Unknown energy
- Kids: match, mismatch, unknown, no kids
- Cats: match, mismatch, unknown, no cats
- Dogs: match, mismatch, unknown, no dogs
- Yard/fence: match, mismatch, unknown
- Experience: all combinations
- Size: exact, adjacent, non-matching, unknown, no preference
- Special needs: match, mismatch, unknown

**Confidence Tests** (CONF-001 through CONF-012):
- Full data → High confidence
- Each missing field → correct penalty
- Confidence never below 0
- Confidence never above 100

**Ranking Tests** (RANK-001 through RANK-003):
- Compatibility sorts first
- Confidence breaks ties
- Distance is final tie-breaker

**Determinism Tests** (DET-001 through DET-004):
- Same input → same output on repeated calls

**AI Safety Tests** (AI-001 through AI-005):
- Engine makes no external calls
- Engine makes no AI calls
- AI cannot mutate score
- Search does not trigger AI
- System works without AI

---

## Definition of Done

The Compatibility Engine is complete when:
- All category tests pass
- Determinism tests pass
- Confidence tests pass
- AI safety tests pass
- Outputs match specification
- Engine remains a pure function

---

## NormalizedDog Type

```ts
interface NormalizedDog {
  id: string;
  name: string;
  breed: string | null;
  age: string | null;
  sizeGroup: "Small" | "Medium" | "Large" | "X-Large" | "Unknown";
  energyLevel: "Low" | "Moderate" | "High" | "Unknown";
  activityLevel: "Low" | "Moderate" | "High" | "Unknown";
  exerciseNeeds: "Low" | "Moderate" | "High" | "Unknown";
  isKidsOk: boolean | "Unknown";
  isCatsOk: boolean | "Unknown";
  isDogsOk: boolean | "Unknown";
  isYardRequired: boolean | "Unknown";
  fenceNeeds: "Not required" | "Any type" | "3 foot" | "6 foot" | "Unknown";
  ownerExperience: "None" | "Species" | "Breed" | "Unknown";
  isSpecialNeeds: boolean | "Unknown";
  shelterUrl: string | null;
  photoUrl: string | null;
  description: string | null;
  shelterId: string;
  distance: number | null; // miles from search location
}
```

Fields that are absent in the API response or explicitly marked unknown become `"Unknown"`. Fields that are simply missing metadata (photo, description, url) remain `null`.

---

## AdopterProfile Type

```ts
interface AdopterProfile {
  homeType: "Apartment" | "House" | "Other";
  hasChildren: boolean;
  hasCats: boolean;
  hasOtherDogs: boolean;
  activityLevel: "Low" | "Moderate" | "High";
  experienceLevel: "None" | "Species" | "Breed";
  // Optional (Phase 2 questionnaire)
  groomingTolerance?: "Low" | "Moderate" | "High";
  hasFence?: boolean;
  hasYard?: boolean;
  specialNeedsWilling?: boolean;
  maxDistance?: number;
  sizePreference?: "Small" | "Medium" | "Large" | "X-Large" | "No Preference";
}
```
