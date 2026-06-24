# Database & API Contract Specification — Nuzzle

Version: 1.0
Status: Approved

---

## Purpose

This document defines the database schema, API contracts, validation rules, and data models used by Nuzzle.

This document serves as the source of truth for: database design, API development, backend testing, and integration testing.

---

## Architectural Principles

### Provider Isolation

Business logic must never consume raw RescueGroups responses. All provider responses must be converted into normalized internal models before use anywhere in the app. See the RescueGroups Field Mapping section.

### Deterministic Compatibility

Compatibility calculations must not depend on database state, AI, or external APIs. The compatibility engine operates entirely from supplied inputs. See `docs/architecture/compatibility-engine-spec.md`.

### Versioning

Compatibility results are tied to a `profileVersion` and a `scoreVersion`. This ensures historical scores remain traceable and stale scores can be detected when a profile changes.

---

## Database Schema

Canonical format is Prisma. PostgreSQL is the backing database, hosted on Neon.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Users ────────────────────────────────────────────────────────────────────

model User {
  id          String   @id @default(uuid())
  clerkUserId String   @unique
  email       String   @unique
  firstName   String?  // shown on the dashboard sidebar; seeded from Clerk, editable in-app
  lastName    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  profile     AdopterProfile?
  favorites   Favorite[]
  scores      CompatibilityScore[]
  events      AnalyticsEvent[]
}

// ─── Adopter Profile ──────────────────────────────────────────────────────────

model AdopterProfile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Phase 1 — Quick Match (required)
  homeType        String  // "Apartment" | "House" | "Other"
  hasChildren     Boolean
  hasCats         Boolean
  hasOtherDogs    Boolean
  activityLevel   String  // "Low" | "Moderate" | "High"
  experienceLevel String  // "None" | "Species" | "Breed"

  // Phase 2 — Improve Accuracy (optional)
  groomingTolerance   String?  // "Low" | "Moderate" | "High"
  coatPreference      String?
  breedPreference     String?
  hasFence            Boolean?
  hasYard             Boolean?
  specialNeedsWilling Boolean?
  maxDistance         Int?     // miles
  sizePreference      String?  // "Small" | "Medium" | "Large" | "X-Large" | "No Preference"
  agePreference       String?  // "Baby" | "Young" | "Adult" | "Senior" | "No Preference"
  sexPreference       String?  // "Male" | "Female" | "No Preference"
  hoursAlone          String?  // "Under 4h" | "4-8h" | "8h+" (soft signal, not scored)

  // Version tracking — incremented on every update, used to detect stale scores
  profileVersion Int @default(1)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── Dog Cache ────────────────────────────────────────────────────────────────

model DogCache {
  id              String   @id @default(uuid())
  provider        String   // "rescuegroups"
  externalId      String
  name            String
  normalizedData  Json     // Full NormalizedDog snapshot
  shelterName     String?
  shelterUrl      String?
  primaryPhotoUrl String?
  lastSyncedAt    DateTime
  expiresAt       DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([provider, externalId])
}

// ─── Compatibility Scores ─────────────────────────────────────────────────────

model CompatibilityScore {
  id             String @id @default(uuid())
  userId         String
  user           User   @relation(fields: [userId], references: [id])
  dogProvider    String
  dogExternalId  String
  profileVersion Int
  scoreVersion   Int    @default(1) // increment when scoring algorithm changes

  compatibilityScore Int
  matchLabel         String
  confidenceScore    Int
  confidenceLabel    String
  scoreBreakdown     Json
  positiveFactors    Json
  concerns           Json
  shelterQuestions   Json

  createdAt DateTime @default(now())

  aiExplanations AiExplanation[]

  @@index([userId, dogProvider, dogExternalId])
}

// ─── AI Explanations ──────────────────────────────────────────────────────────

// AI explanations are stored separately and never modify compatibility scores.
model AiExplanation {
  id                   String             @id @default(uuid())
  compatibilityScoreId String
  compatibilityScore   CompatibilityScore @relation(fields: [compatibilityScoreId], references: [id])
  model                String             // e.g. "llama-3.3-70b-versatile"
  promptVersion        Int
  explanationJson      Json
  createdAt            DateTime           @default(now())
}

// ─── Favorites ────────────────────────────────────────────────────────────────

model Favorite {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider   String   // "rescuegroups"
  externalId String   // Provider-specific dog ID
  createdAt  DateTime @default(now())

  @@unique([userId, provider, externalId])
  @@index([userId])
}

// ─── Analytics Events ─────────────────────────────────────────────────────────

model AnalyticsEvent {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  anonymousId String?  // For pre-auth tracking
  eventName   String
  eventData   Json
  createdAt   DateTime @default(now())
}
```

---

## Profile Version

`profileVersion` is incremented by 1 each time the user updates any questionnaire answer. The `scoreVersion` on `CompatibilityScore` is incremented when the scoring algorithm itself changes (i.e., weights or rules update), allowing historical scores to be identified as stale.

In V1, compatibility scores are calculated on-demand — no precomputation.

---

## Analytics Events

Supported values for `eventName` in `AnalyticsEvent`:

```
questionnaire_started
questionnaire_completed
questionnaire_updated
search_performed
filter_applied
dog_viewed
compatibility_viewed
explanation_viewed
favorite_added
favorite_removed
shelter_click
```

---

## Normalized Dog Type

All business logic uses `NormalizedDog`. Raw RescueGroups responses must never be passed directly to the compatibility engine or any other business logic.

```ts
type NormalizedDog = {
  provider: "rescuegroups";
  externalId: string;
  name: string;
  breed: string | null;
  ageGroup: "Baby" | "Young" | "Adult" | "Senior" | "Unknown";
  sizeGroup: "Small" | "Medium" | "Large" | "X-Large" | "Unknown";
  gender?: "Male" | "Female" | "Unknown";

  // Energy is resolved in priority order: energyLevel → activityLevel → exerciseNeeds
  energyLevel:   "Low" | "Moderate" | "High" | "Unknown";
  activityLevel: "Low" | "Moderate" | "High" | "Unknown";
  exerciseNeeds: "Low" | "Moderate" | "High" | "Unknown";
  groomingNeeds: "Low" | "Moderate" | "High" | "Unknown"; // derived from animals.coatLength

  isKidsOk:      boolean | "Unknown";
  isCatsOk:      boolean | "Unknown";
  isDogsOk:      boolean | "Unknown";
  isSpecialNeeds: boolean | "Unknown";
  isYardRequired: boolean | "Unknown";
  fenceNeeds:    "Not required" | "Any type" | "3 foot" | "6 foot" | "Unknown";
  ownerExperience: "None" | "Species" | "Breed" | "Unknown";

  photos:      string[];       // Array of photo URLs; empty array if none
  shelterName?: string;
  shelterUrl?:  string;
  description: string | null;
  distance:    number | null;  // Miles from search location
};
```

**Unknown rule**: Domain fields that are missing or ambiguous in the API response become `"Unknown"` (the string literal). Metadata fields with no meaningful unknown state (`photos`, `shelterUrl`, `shelterName`, `description`, `breed`, `distance`) are `null` or an empty array when absent. See `RULES.md` Rule 7.

---

## RescueGroups Field Mapping

Source: RescueGroups v5 API. Normalization lives in `lib/compatibility/normalize.ts`.

The v5 API returns `data` as an **array** (even for a single-animal fetch), photo URLs as a separate `pictures` resource in `included` (linked per-animal via `relationships.pictures`), and the shelter/rescue as an `orgs` resource in `included` (via `relationships.orgs`). Both fetches request `?include=pictures,orgs`.

| RescueGroups Field | NormalizedDog Field | Notes |
|-------------------|---------------------|-------|
| `animals.name` | `name` | |
| `animals.breedPrimary` | `breed` | `null` if absent (legacy `breeds.primary` accepted as fallback) |
| `animals.ageGroup` | `ageGroup` | Map to Baby/Young/Adult/Senior or `"Unknown"` |
| `animals.sizeGroup` | `sizeGroup` | Map to Small/Medium/Large/X-Large or `"Unknown"` |
| `animals.sex` | `gender` | Map to Male/Female or `"Unknown"` |
| `animals.coatLength` | `groomingNeeds` | Short/Hairless→Low, Medium→Moderate, Long→High, else `"Unknown"` |
| `animals.distance` | `distance` | Miles from search location; `null` when not a radius search |
| `animals.isKidsOk` | `isKidsOk` | `"Unknown"` if not present or ambiguous |
| `animals.isCatsOk` | `isCatsOk` | `"Unknown"` if not present or ambiguous |
| `animals.isDogsOk` | `isDogsOk` | `"Unknown"` if not present or ambiguous |
| `animals.energyLevel` | `energyLevel` | Map to `"Low"/"Moderate"/"High"` or `"Unknown"` |
| `animals.activityLevel` | `activityLevel` | Map to `"Low"/"Moderate"/"High"` or `"Unknown"` |
| `animals.exerciseNeeds` | `exerciseNeeds` | Map to `"Low"/"Moderate"/"High"` or `"Unknown"` |
| `animals.isSpecialNeeds` | `isSpecialNeeds` | `"Unknown"` if absent |
| `animals.isYardRequired` | `isYardRequired` | `"Unknown"` if absent |
| `animals.fenceNeeds` | `fenceNeeds` | Map to fence enum or `"Unknown"` |
| `animals.ownerExperience` | `ownerExperience` | Map to None/Species/Breed or `"Unknown"` |
| `included[pictures]` | `photos` | URLs from the `pictures` resource (via `relationships.pictures`); `[]` if none |
| `animals.descriptionText` | `description` | `null` if absent (legacy `description` accepted as fallback) |
| `included[orgs].name` | `shelterName` | from the `orgs` resource (via `relationships.orgs`) |
| `included[orgs].url` | `shelterUrl` | shelter/rescue website |

---

## API Endpoints

### GET /api/dogs/search

Search adoptable dogs via RescueGroups.

**Authentication**: Optional

**Query parameters**:
```
zip?:       string               // optional — omit for a nationwide search
radius?:    number               // miles, default 25 (only applied when zip is present)
page?:      number               // default 1
limit?:     number               // default 12, max 50
breed?:     string
ageGroup?:  string
sizeGroup?: string
shelter?:   string
sort?:      "distance" | "best_match"
```

**Two modes:**
- **`best_match`** (profiled, no zip): the route ranks a **large candidate pool**
  via `getCandidatePool` ([lib/search/candidate-pool.ts](../../lib/search/candidate-pool.ts)) —
  up to `CANDIDATE_POOL_SIZE` (500) dogs walked across RescueGroups pages, deduped,
  cached ~1h with `unstable_cache`. The pool is **user-independent** (dogs only) and
  shared across users; the route then scores the *whole pool* against the requesting
  user's **live** profile, sorts, and paginates the ranked list. So two different
  profiles surface different top dogs (not the same first page re-scored), and editing
  a profile re-ranks immediately. Here `total` = the number of ranked candidates
  (pool size) and pagination walks the ranked pool.
- **`distance`** (anonymous, zip search, or `sort=distance`): lazy single-page browse
  (one provider call per page), nearest-first. Here `total` is the catalog count
  (RescueGroups `meta.count`).

The response is always `Cache-Control: no-store` (+ route `dynamic = "force-dynamic"`):
it carries per-user scores and must never be cached or shared across sessions.

`breed`/`ageGroup`/`sizeGroup` narrow the result set for **both anonymous and
profiled users** (sent to RescueGroups as `data.filters`). Profiled results stay
compatibility-sorted *within* the filtered set, so a user can search a breed and
still see it ranked by fit (including lower-scoring dogs).

**Anonymous response**:
```json
{
  "results": [{ "dog": {} }],
  "compatibility": {
    "available": false,
    "teaser": "Create a profile to unlock compatibility matching."
  },
  "page": 1,
  "hasMore": true,
  "total": 33084
}
```

**Profiled response** — `compatibility.available` is `true` at the top level, and
each result carries its full `CompatibilityResult`:
```json
{
  "results": [
    {
      "dog": {},
      "compatibility": {
        "compatibilityScore": 91,
        "matchLabel": "Strong Match",
        "confidenceLabel": "High",
        "positiveFactors": ["Good with cats", "Moderate energy"]
      }
    }
  ],
  "compatibility": { "available": true },
  "page": 1,
  "hasMore": true,
  "total": 500
}
```

Sort comparators: `best_match` = Compatibility → Confidence → Distance, applied
across the **whole candidate pool** (not just one page); `distance` = nearest first,
compatibility breaks ties, applied within the page. Profiled users are scored
regardless of sort, so match badges show in either order. The client adapts each
result into DogCard's compatibility union via `toCardCompatibility`.

---

### GET /api/dogs/[provider]/[externalId]

Retrieve full dog details.

**Authentication**: Optional

**Response**:
```ts
{
  dog: NormalizedDog;
  compatibilityResult: CompatibilityResult | null; // null if anonymous or no profile
  aiExplanation: string | null;                    // null if AI unavailable; client renders fallback
}
```

---

### GET /api/dogs/[provider]/[externalId]/compatibility

Retrieve or calculate compatibility result for a specific dog.

**Authentication**: Required

**Response**: `CompatibilityResult`

---

### POST /api/dogs/[provider]/[externalId]/explanation

Generate or retrieve cached AI explanation.

**Authentication**: Required

**Behavior**:
- Returns cached explanation if one exists for the current `profileVersion` + `scoreVersion`
- Generates a new explanation via Groq if no cached version exists
- Falls back to structured rule-based explanation on AI failure — never returns an error to the client

---

### POST /api/dogs/[provider]/[externalId]/shelter-click

Track a shelter redirect click and return the shelter URL.

**Authentication**: Optional

**Response**:
```json
{ "shelterUrl": "https://..." }
```

---

### POST /api/profile

Create the adopter profile.

**Authentication**: Required

**Request body**:
```json
{
  "hasChildren": true,
  "hasCats": false,
  "hasOtherDogs": true,
  "activityLevel": "Moderate",
  "experienceLevel": "Species",
  "homeType": "House"
}
```

**Response**:
```json
{ "profileVersion": 1 }
```

---

### PUT /api/profile

Update the adopter profile. Increments `profileVersion`.

**Authentication**: Required

**Request body**: Same shape as POST, all fields optional.

**Response**:
```json
{ "profileVersion": 2 }
```

---

### GET /api/profile

Retrieve the current user's profile.

**Authentication**: Required

**Response**: `AdopterProfile | null`

---

### POST /api/favorites

Add a dog to favorites.

**Authentication**: Required

**Request body**:
```json
{
  "provider": "rescuegroups",
  "externalId": "12345"
}
```

**Response**: `201 Created` with favorite object. Returns `409` if already favorited.

---

### DELETE /api/favorites/[provider]/[externalId]

Remove a dog from favorites.

**Authentication**: Required

**Response**: `204 No Content`

---

### GET /api/favorites

List the current user's favorites.

**Authentication**: Required

**Response**: `Favorite[]`

---

### POST /api/analytics/events

Record an analytics event.

**Authentication**: Optional

**Request body**:
```json
{
  "eventName": "dog_viewed",
  "eventData": { "dogExternalId": "12345", "matchLabel": "Strong Match" },
  "anonymousId": "anon_abc123"
}
```

No PII in `eventData`.

---

## Validation Rules

### Required Profile Fields

```
hasChildren
hasCats
hasOtherDogs
activityLevel       // "Low" | "Moderate" | "High"
experienceLevel     // "None" | "Species" | "Breed"
homeType            // "Apartment" | "House" | "Other"
```

### Optional Profile Fields

```
groomingTolerance
coatPreference
breedPreference
hasFence
hasYard
specialNeedsWilling
maxDistance
sizePreference
```

---

## Error Contract

All API errors use this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message"
  }
}
```

### Error Codes

| Code | HTTP Status | Scenario |
|------|------------|---------|
| `UNAUTHORIZED` | 401 | No auth, auth required |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Dog or resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request body or params |
| `PROVIDER_ERROR` | 503 | RescueGroups API unavailable |
| `RATE_LIMITED` | 429 | Provider rate limit hit |
| `AI_PROVIDER_ERROR` | — | AI unavailable; use fallback, do not surface to user |
| `DUPLICATE` | 409 | Duplicate favorite |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

**AI provider errors are never surfaced to the user.** The explanation endpoint falls back to structured text silently.

---

## Environment Variables

```
DATABASE_URL=                          # Neon PostgreSQL connection string
RESCUEGROUPS_API_KEY=                  # RescueGroups v5 API key
GROQ_API_KEY=                          # Groq API key (explanation generation)
CLERK_SECRET_KEY=                      # Clerk backend secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=     # Clerk frontend publishable key
```

---

## TDD Requirements

### Database Tests
- Create user
- Create profile
- Update profile (verify profileVersion increments)
- Store compatibility score
- Retrieve cached AI explanation
- Save favorite
- Prevent duplicate favorite
- Create analytics event

### API Tests
- Anonymous search returns dogs without scores
- Authenticated search returns dogs with scores
- Profile creation with required fields only
- Profile creation with all fields
- Profile update increments profileVersion
- Compatibility retrieval for profiled user
- Compatibility returns null for anonymous user
- Favorite creation
- Duplicate favorite returns 409
- Favorite removal
- Shelter click tracking returns shelter URL

### Contract Tests
- Provider isolation: NormalizedDog fields never expose raw RescueGroups field names
- Unknown value preservation: missing API fields map to `"Unknown"`, never `false` or `0`
- Compatibility endpoint never calls AI
- AI explanation endpoint falls back gracefully on AI failure
- AI explanation never modifies compatibility score

---

## Explicit Non-Goals (V1)

Not included in V1: adoption applications, shelter dashboards, direct messaging, machine learning recommendations, multi-profile households, adoption outcome tracking.

---

## Definition of Done

This contract is considered implemented when:
- Database schema exists and migrations run cleanly
- All API routes exist and return the documented shapes
- Validation rules are enforced on all inputs
- Contract tests pass
- Integration tests pass
- Documentation is synchronized with implementation
