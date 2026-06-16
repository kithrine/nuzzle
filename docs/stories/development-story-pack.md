# Development Story Pack — Nuzzle

Version: 1.0
Status: Build-ready

---

## How To Use This Document

This document converts the approved PRD, Architecture, UX, and Compatibility specifications into developer-ready implementation stories organized by Epic.

Every story contains: a user story, acceptance criteria (checkboxes), technical notes, and required tests.

**Development workflow for every story:**

```
Specification → Tests → Implementation → Refactor
```

A story is not complete until tests pass.

**Before starting any story, read:**
- `AGENTS.md` — project rules and decisions
- `RULES.md` — hard constraints
- The relevant spec doc linked in the story

**Story dependency order** is listed at the end of this document. Build in that order.

---

## Epic 1: Project Foundation

### Story 1.1: Initialize Application

**As a developer**, I want a properly configured application foundation so that future development occurs in a consistent environment.

#### Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] TypeScript strict mode enabled (`tsconfig.json`: `"strict": true`)
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Vitest configured and executable
- [ ] Tailwind CSS installed and working
- [ ] Folder structure matches `docs/architecture/architecture.md`
- [ ] `.env.example` exists with all required env variable names (no values)
- [ ] `AGENTS.md` and `RULES.md` present at project root
- [ ] Node version pinned in `.nvmrc`
- [ ] `.gitignore` includes `.env`, `node_modules`, `.next`

#### Technical Notes

- Use Next.js App Router (not Pages Router)
- Folder structure reference: `docs/architecture/architecture.md`

#### Tests Required

- Smoke test: app renders without crashing
- TypeScript: `npx tsc --noEmit` passes with no errors
- Vitest: test runner executes successfully
- Build: `npm run build` succeeds

---

### Story 1.2: Configure Database Layer

**As a developer**, I want database infrastructure configured so that application data can be stored reliably.

#### Acceptance Criteria

- [ ] PostgreSQL configured (Neon)
- [ ] Prisma installed and configured
- [ ] `npx prisma migrate dev` runs without errors
- [ ] `npx prisma generate` runs without errors
- [ ] Prisma client exported from `lib/db/prisma.ts` as a singleton
- [ ] Schema includes all required models per `docs/architecture/database-api-contract.md`
- [ ] `DATABASE_URL` documented in `.env.example`

#### Required Models

- `User` (with `clerkUserId`)
- `AdopterProfile` (with `profileVersion`)
- `DogCache`
- `CompatibilityScore`
- `AiExplanation`
- `Favorite`
- `AnalyticsEvent`

#### Technical Notes

- Schema must match exactly: `docs/architecture/database-api-contract.md`
- All `onDelete: Cascade` relations set correctly
- `profileVersion` defaults to `1` on `AdopterProfile`

#### Tests Required

- Database connection: Prisma client connects without throwing
- User creation: creates user with `clerkUserId` and `email`
- Profile creation: creates profile linked to user
- Schema validation: all required fields exist on all models

---

## Epic 2: RescueGroups Integration

### Story 2.1: Create Provider Interface

**As a developer**, I want a provider abstraction layer so that business logic remains provider-independent.

#### Acceptance Criteria

- [ ] `PetProvider` interface exists in `lib/providers/types.ts`
- [ ] `searchDogs(params)` method defined on interface
- [ ] `getDogById(provider, externalId)` method defined on interface
- [ ] Mock provider implementation exists for testing
- [ ] No business logic imports raw RescueGroups field names

#### Technical Notes

- The interface decouples the app from RescueGroups specifically
- All provider implementations must return `NormalizedDog` — never raw API shapes
- The mock provider is used throughout tests for Epic 3 onward

#### Tests Required

- Provider contract tests: mock implementation satisfies the interface
- Mock provider returns valid `NormalizedDog` shape
- No raw RescueGroups fields leak past the provider boundary

---

### Story 2.2: RescueGroups Search

**As a visitor**, I want to browse available dogs so that I can discover adoption opportunities.

#### Acceptance Criteria

- [ ] `GET /api/dogs/search` returns dog listings
- [ ] Pagination implemented (`page`, `limit` params)
- [ ] RescueGroups API errors return 503 (not crash)
- [ ] Rate limiting (429) handled gracefully
- [ ] Response shape matches `docs/architecture/database-api-contract.md` — anonymous and profiled formats

#### Technical Notes

- RescueGroups client lives in `lib/rescuegroups/client.ts`
- All responses pass through normalization (Story 2.3) before returning — never skip this step
- Reference: `docs/architecture/database-api-contract.md` → GET /api/dogs/search

#### Tests Required

- Successful search with valid zip returns dogs array
- Empty results handled (returns empty array, not error)
- RescueGroups API unavailable → 503 response
- 429 from provider → handled gracefully, not surfaced as 500
- Pagination: `page` and `limit` params work correctly

---

### Story 2.3: Data Normalization

**As the system**, I want RescueGroups data normalized so that scoring logic remains provider-independent.

#### Acceptance Criteria

- [ ] `lib/compatibility/normalize.ts` maps RescueGroups fields to `NormalizedDog`
- [ ] All unknown/missing domain fields become `"Unknown"` (the string literal) — never `false`, `null`, or `0`
- [ ] Metadata fields (`photos`, `shelterUrl`, `description`) become `null` or `[]` when absent
- [ ] Raw RescueGroups field names never appear outside `normalize.ts`
- [ ] Field mapping matches `docs/architecture/database-api-contract.md` → RescueGroups Field Mapping table

#### Technical Notes

- Normalization is a separate concern from the RescueGroups client — do not mix them
- `NormalizedDog` type defined in `lib/compatibility/types.ts`
- The `"Unknown"` literal is how the engine detects missing data — this is critical for correct scoring
- Reference: `docs/architecture/compatibility-engine-spec.md` → NormalizedDog Type

#### Tests Required

- All field mappings produce correct `NormalizedDog` shape
- Missing RescueGroups fields → `"Unknown"` in output (never `false`)
- Ambiguous API values → `"Unknown"` in output
- `photos` absent → empty array `[]`
- `shelterUrl` absent → `null`
- Contract validation: output satisfies `NormalizedDog` type on every test case

---

## Epic 3: Search Experience

### Story 3.1: Anonymous Search

**As a visitor**, I want to browse dogs without registering so that I can evaluate the platform first.

#### Acceptance Criteria

- [ ] Search accessible without authentication
- [ ] Dog cards display: photo, name, age, breed, distance
- [ ] Compatibility score **not** shown for anonymous users
- [ ] Compatibility teaser shown on each card ("Create your profile to unlock...")
- [ ] Sort order for anonymous: distance ascending
- [ ] Sort label visible: "Nearby Dogs"

#### Technical Notes

- API returns `compatibility: { available: false, teaser: "..." }` for anonymous users
- Teaser is non-intrusive — does not block browsing
- Reference: `docs/ux/ux-spec.md` → Anonymous Browse Flow

#### Tests Required

- Anonymous request to search returns dogs without scores
- Dog card renders photo, name, age, breed
- Teaser renders for anonymous user (ANON-001, ANON-002)
- Compatibility score not present in anonymous response

---

### Story 3.2: Search Filters

**As a visitor**, I want search filters so that I can narrow results.

#### Acceptance Criteria

- [ ] Filter by: location, radius, breed, age group, size group
- [ ] Filters persist in URL params
- [ ] Pagination works correctly with active filters
- [ ] Filter state survives page refresh

#### Technical Notes

- Filter params match `docs/architecture/database-api-contract.md` → GET /api/dogs/search query params
- URL params: `breed`, `ageGroup`, `sizeGroup`, `radius`, `sort`

#### Tests Required

- Applying a filter returns correctly filtered results
- Filter values persist in URL
- Paginating with active filters maintains filter state
- Invalid filter values handled gracefully (ignored or 422)

---

## Epic 4: Authentication & Profiles

### Story 4.1: Authentication

**As a user**, I want secure authentication so that my profile and favorites persist across sessions.

#### Acceptance Criteria

- [ ] Clerk installed and configured
- [ ] `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.example`
- [ ] Login flow works
- [ ] Logout flow works
- [ ] Protected routes enforce authentication (return 401 if unauthenticated)
- [ ] `clerkUserId` stored on `User` record at first login
- [ ] Clerk middleware configured in `middleware.ts`

#### Technical Notes

- Auth provider is Clerk — do not use NextAuth
- On first authenticated request, create `User` record with `clerkUserId` if not exists
- Protected routes: `/api/profile`, `/api/favorites`, `/api/dogs/*/compatibility`

#### Tests Required

- Login: user is authenticated and session created
- Logout: session cleared
- Protected route without auth → 401
- First login: User record created with correct `clerkUserId`
- Repeated login: User record not duplicated

---

### Story 4.2: Compatibility Questionnaire

**As a user**, I want to create a compatibility profile so that recommendations can be personalized.

#### Acceptance Criteria

- [ ] Phase 1 (Quick Match) questionnaire implemented — 6 required questions
- [ ] Phase 2 (Improve Accuracy) — 6 optional additional questions
- [ ] One question per screen on mobile
- [ ] Progress bar visible ("Step 2 of 6")
- [ ] Phase 1 completable without Phase 2
- [ ] Authenticated: profile saved to database via `POST /api/profile`
- [ ] Profile update via `PUT /api/profile` increments `profileVersion`
- [ ] User can return and update answers

#### Phase 1 Questions (Required)

- Children in home
- Cats in home
- Other dogs in home
- Activity level
- Experience level
- Home type

#### Phase 2 Questions (Optional)

- Yard availability
- Fence availability
- Size preference
- Distance preference
- Grooming tolerance
- Special needs willingness

#### Technical Notes

- Form state managed with React state (not inside the compatibility engine)
- Questions and answer options match `docs/product/prd.md` Phase 1 and Phase 2 lists
- Reference: `docs/ux/ux-spec.md` → Questionnaire Flow

#### Tests Required

- Phase 1 submission: profile created with correct field values
- Phase 2 fields: all optional — Phase 1 submission works without them
- Profile update: `profileVersion` increments on every update
- Validation: required Phase 1 fields enforced
- `POST /api/profile` creates profile; `PUT /api/profile` updates it

---

## Epic 5: Compatibility Engine

### Story 5.1: Compatibility Engine

**As a user**, I want compatibility scores so that I can identify strong matches.

**This is the most critical story. Read `docs/architecture/compatibility-engine-spec.md` completely before starting.**

#### Acceptance Criteria

- [ ] `calculateCompatibility(profile, dog)` implemented as a pure function in `lib/compatibility/engine.ts`
- [ ] All 8 scoring categories implemented per spec: kids, cats, dogs, energy, home/yard/fence, experience, size, special needs
- [ ] Output matches `CompatibilityResult` type exactly
- [ ] AI safety: engine makes zero calls to any external service
- [ ] Determinism: same input always produces same output
- [ ] All TDD test cases pass: SCORE-001 through SCORE-034

#### Technical Notes

- Location: `lib/compatibility/engine.ts`
- Types: `lib/compatibility/types.ts`
- No imports of database client, AI client, or RescueGroups client anywhere in the engine
- Engine exports only `calculateCompatibility`
- Reference: `docs/architecture/compatibility-engine-spec.md` → Category Rules

#### Tests Required

- SCORE-001 through SCORE-034 (all scoring category tests)
- DET-001 through DET-004 (determinism tests)
- AI-001 through AI-005 (AI safety tests — engine makes no external calls)

---

### Story 5.2: Confidence Engine

**As a user**, I want confidence scores so that I understand how reliable a recommendation is.

#### Acceptance Criteria

- [ ] Confidence score calculated as part of `CompatibilityResult`
- [ ] Confidence starts at 100 and subtracts penalties for missing dog data
- [ ] Confidence labels generated: High (80–100), Medium (50–79), Low (0–49)
- [ ] Missing data generates confidence penalty per `docs/architecture/compatibility-engine-spec.md` → Confidence Calculation
- [ ] Confidence never goes below 0 or above 100

#### Technical Notes

- Confidence is part of `calculateCompatibility` — not a separate function
- Penalty table is in `docs/architecture/compatibility-engine-spec.md`
- Confidence and compatibility are always separate values — never merged
- Reference: `docs/architecture/compatibility-engine-spec.md` → Confidence Calculation

#### Tests Required

- CONF-001 through CONF-012 (all confidence tests):
  - Full dog data → High confidence
  - Each missing field applies correct penalty
  - Confidence never below 0
  - Confidence never above 100

---

### Story 5.3: Ranked Search Results

**As a user**, I want best matches shown first so that I can discover compatible dogs quickly.

#### Acceptance Criteria

- [ ] Search results sorted server-side before returning
- [ ] Profiled user sort order: compatibility desc → confidence desc → distance asc
- [ ] Anonymous user sort order: distance asc
- [ ] Sort label visible on results page
- [ ] `sort=best_match` query param triggers compatibility sort
- [ ] `sort=distance` query param triggers distance sort

#### Technical Notes

- Ranking is applied in the API layer after scores are calculated — not in the engine
- Compatibility and confidence are never combined into a single sort value
- Reference: `docs/architecture/compatibility-engine-spec.md` → Ranking Rule

#### Tests Required

- RANK-001: higher compatibility score ranks first
- RANK-002: equal compatibility → higher confidence ranks first
- RANK-003: equal compatibility and confidence → shorter distance ranks first
- Anonymous results sorted by distance, not compatibility

---

## Epic 6: Recommendation Experience

### Story 6.1: Dog Detail Page

**As a user**, I want to view a full dog profile so that I can evaluate adoption opportunities.

#### Acceptance Criteria

- [ ] Page shows: photos, name, age, breed, shelter name, distance, description
- [ ] Profiled user: compatibility card with score, label, confidence label, confidence explanation
- [ ] Anonymous user: compatibility teaser card with CTA ("Get My Compatibility Match")
- [ ] "Visit Shelter Listing" button opens shelter URL in new tab
- [ ] Click tracked: shelter redirect fires `shelter_click` analytics event
- [ ] Low confidence: shows list of specific missing fields
- [ ] AI explanation is `null` at this stage (added in Story 6.3)

#### Technical Notes

- `GET /api/dogs/[provider]/[externalId]` returns dog + compatibilityResult
- Confidence explanation text generated from `shelterQuestions` array
- Reference: `docs/ux/ux-spec.md` → Dog Detail Page, `docs/ux/wireframe-layouts.md`

#### Tests Required

- All dog fields render correctly
- Profiled user: compatibility card visible with correct score and label
- Anonymous user: teaser card visible; score not rendered (ANON-003)
- "Visit Shelter Listing" fires `shelter_click` event on click
- US-011 through US-013 acceptance criteria pass

---

### Story 6.2: Structured Explanations

**As a user**, I want score explanations so that I understand why a dog is or isn't a match.

#### Acceptance Criteria

- [ ] Positive Factors list displayed (from `positiveFactors` in `CompatibilityResult`)
- [ ] Concerns list displayed when concerns exist — never hidden for strong matches
- [ ] "Before You Apply" section shows shelter questions when `shelterQuestions` is non-empty
- [ ] Concerns phrased constructively (not as warnings)
- [ ] Low match dogs still show explanation

#### Technical Notes

- All explanation content comes from `CompatibilityResult` — no AI at this stage
- `positiveFactors`, `concerns`, and `shelterQuestions` are arrays of strings produced by the engine
- Reference: `docs/architecture/compatibility-engine-spec.md` → Explanation Output
- Reference: `docs/ux/ux-spec.md` → Concern Display Rules

#### Tests Required

- Positive factors render from `positiveFactors` array
- Concerns render from `concerns` array
- "Before You Apply" section only appears when `shelterQuestions` is non-empty
- Low match dog: explanation still renders (US-014)

---

### Story 6.3: AI Explanation Layer

**As a user**, I want readable natural-language summaries so that recommendations are easier to understand.

#### Acceptance Criteria

- [ ] AI explanation appears on Dog Detail Page below structured breakdown
- [ ] AI is never called during search result generation
- [ ] AI service unavailable → rule-based explanation shown; no error shown to user
- [ ] AI explanation cached per `profileVersion` + `scoreVersion` (via `AiExplanation` model)
- [ ] AI explanation cannot modify `CompatibilityResult` — score, label, confidence unchanged
- [ ] AI safety tests AI-001 through AI-005 continue to pass

#### Technical Notes

- Location: `lib/ai/explainer.ts`
- Contract: `generateExplanation(result: CompatibilityResult, dog: NormalizedDog): Promise<string>`
- All exceptions must be caught; return fallback text on any failure
- The AI receives `CompatibilityResult` as structured input — it does not re-score
- Endpoint: `POST /api/dogs/[provider]/[externalId]/explanation`
- Reference: `docs/architecture/database-api-contract.md` → POST .../explanation

#### Tests Required

- AI explanation renders when service is available
- Fallback text renders when AI throws or is unavailable
- AI is not called during search result generation (mock verification)
- AI cannot mutate the `CompatibilityResult` object (immutability test)
- Cached explanation returned on subsequent request (no duplicate AI call)
- AI safety: AI-001 through AI-005 all still pass

---

## Epic 7: Favorites

### Story 7.1: Favorites

**As a logged-in user**, I want to save dogs to my favorites so I can review them later.

#### Acceptance Criteria

- [ ] Favorite icon on dog card and dog detail page
- [ ] Authenticated: tapping favorite saves dog; icon toggles to filled state
- [ ] Authenticated: tapping unfavorite removes dog; icon toggles to empty
- [ ] Anonymous: tapping favorite shows account creation prompt (not silent failure)
- [ ] After account creation: the pending favorite is saved automatically
- [ ] Favorites page shows saved dogs with current compatibility scores
- [ ] Favorites persist across sessions (stored in database)
- [ ] `POST /api/favorites` and `DELETE /api/favorites/[provider]/[externalId]` work correctly
- [ ] Duplicate favorite returns 409

#### Technical Notes

- Favorites use `provider` + `externalId` (not dogId) per `docs/architecture/database-api-contract.md`
- Anonymous favorite flow: store pending favorite in session → trigger account creation → save on completion
- Reference: `docs/ux/ux-spec.md` → Account Creation Prompt

#### Tests Required

- Authenticated: favorite saved to database and appears in favorites list
- Authenticated: unfavorite removes from database
- Duplicate favorite: returns 409
- Anonymous: account creation prompt shown on favorite tap
- Post-account-creation: pending favorite saved automatically
- US-015 and US-016 acceptance criteria pass

---

## Epic 8: Analytics

### Story 8.1: Shelter Redirect Tracking

**As the product owner**, I want shelter visits tracked so that engagement can be measured.

#### Acceptance Criteria

- [ ] `POST /api/dogs/[provider]/[externalId]/shelter-click` endpoint implemented
- [ ] Endpoint creates `shelter_click` analytics event
- [ ] Endpoint returns `{ shelterUrl }` for the client to redirect to
- [ ] Works for both authenticated and anonymous users
- [ ] `anonymousId` stored when user is unauthenticated

#### Technical Notes

- Shelter URL comes from `NormalizedDog.shelterUrl`
- Event stored in `AnalyticsEvent` table
- Reference: `docs/architecture/database-api-contract.md` → POST .../shelter-click

#### Tests Required

- `shelter_click` event created in database on endpoint call
- Shelter URL returned in response
- Anonymous tracking: event created with `anonymousId`
- Authenticated tracking: event created with `userId`

---

### Story 8.2: Analytics Foundation

**As the product owner**, I want user activity tracked so that future improvements can be data-driven.

#### Acceptance Criteria

- [ ] `POST /api/analytics/events` endpoint implemented
- [ ] All events stored in `AnalyticsEvent` table
- [ ] Analytics does not block page render (fire-and-forget)
- [ ] No PII in `eventData` payloads

#### Events to Track

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

#### Technical Notes

- Events fire client-side where possible; `POST /api/analytics/events` for server-side
- `anonymousId` for pre-auth tracking
- Reference: `docs/architecture/database-api-contract.md` → Analytics Events

#### Tests Required

- Event created with correct `eventName` and `eventData`
- Invalid `eventName` rejected (validation)
- `eventData` contains no email or user PII
- Analytics calls do not block page render

---

## Story Dependency Order

Build stories in this order. Each story may depend on all stories before it.

| Order | Story | Key Dependency |
|-------|-------|----------------|
| 1 | 1.1 Initialize Application | — |
| 2 | 1.2 Configure Database | 1.1 |
| 3 | 2.1 Provider Interface | 1.1 |
| 4 | 2.3 Data Normalization | 2.1 |
| 5 | 2.2 RescueGroups Search | 2.1, 2.3 |
| 6 | 3.1 Anonymous Search | 2.2 |
| 7 | 3.2 Search Filters | 3.1 |
| 8 | 4.1 Authentication | 1.2 |
| 9 | 4.2 Questionnaire | 4.1 |
| 10 | 5.1 Compatibility Engine | 2.3, 4.2 |
| 11 | 5.2 Confidence Engine | 5.1 |
| 12 | 5.3 Ranked Search Results | 5.1, 5.2 |
| 13 | 6.1 Dog Detail Page | 5.1, 5.2 |
| 14 | 6.2 Structured Explanations | 6.1 |
| 15 | 6.3 AI Explanation Layer | 6.2 |
| 16 | 7.1 Favorites | 4.1 |
| 17 | 8.1 Shelter Redirect Tracking | 6.1 |
| 18 | 8.2 Analytics Foundation | 8.1 |

---

## Definition of Done

A story is complete when **all** of the following are true:

1. Acceptance criteria all checked off
2. Tests written first (TDD — before or alongside implementation, never after)
3. All tests pass
4. TypeScript: `npx tsc --noEmit` passes with no errors
5. Lint passes
6. **No AI called during scoring** — AI safety tests AI-001 through AI-005 still pass
7. Spec doc requirements satisfied (linked in each story above)
8. Feature matches specification — implementation never overrides spec
9. Code reviewed (self-review at minimum for solo development)
10. **Playwright screenshots captured for every test in this story — red (failing) state before implementation, green (passing) state after — saved to `docs/tdd-screenshots/[story-id].md`**
