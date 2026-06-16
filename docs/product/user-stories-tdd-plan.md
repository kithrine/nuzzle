# User Stories & TDD Test Plan — Nuzzle MVP

**Agent**: John (Product Manager) + Sarah (Product Owner)
**Status**: Approved for development

---

## User Stories

### Epic 1: Dog Browse & Search

**US-001** — As an anonymous user, I want to search for adoptable dogs by location so I can browse what's available near me.
- Acceptance: Search returns dog listings with photo, name, age, breed
- Acceptance: Results are sorted by distance by default for anonymous users

**US-002** — As an anonymous user viewing search results, I want to see a compatibility teaser on each card so I understand there is more value if I create a profile.
- Acceptance: Teaser is non-intrusive and does not block browsing
- Acceptance: Teaser lists specific benefits (score, explanation, concerns)

**US-003** — As a profiled user, I want my search results sorted by best compatibility match so the most suitable dogs appear first.
- Acceptance: Sort order: compatibility desc → confidence desc → distance asc
- Acceptance: Sort label visible: "Best Match for You"

---

### Epic 2: Questionnaire & Profile

**US-004** — As a new user, I want to complete a short questionnaire to get personalized compatibility scores.
- Acceptance: Quick Match phase completes in ~2 minutes
- Acceptance: Required fields: home type, kids, cats, dogs, activity level, experience

**US-005** — As a user, I want the questionnaire to come before account creation so I can see value before I commit.
- Acceptance: Flow is: Questionnaire → Results → Prompt account creation when favoriting
- Acceptance: No account required to complete questionnaire and view results in session

**US-006** — As a user, I want to optionally answer additional questions to improve my match accuracy.
- Acceptance: Improve Accuracy phase is optional
- Acceptance: Completing it updates scores immediately

**US-007** — As a user, I want to update my profile answers at any time.
- Acceptance: Updated profile triggers score recalculation on next view

---

### Epic 3: Compatibility Engine

**US-008** — As a user, I want to see a compatibility score for each dog so I know how well it fits my lifestyle.
- Acceptance: Score is 0–100
- Acceptance: Label shown: Strong Match / Good Match / Possible Match / Low Match
- Acceptance: Same profile + same dog always produces the same score

**US-009** — As a user, I want to understand why a dog received its score so I can make an informed decision.
- Acceptance: Positive factors are displayed
- Acceptance: Concerns are displayed (even on strong matches if applicable)
- Acceptance: Factor breakdown includes category scores

**US-010** — As a user, I want to know when a recommendation has missing data so I can factor that into my decision.
- Acceptance: Confidence label shown (High/Medium/Low)
- Acceptance: Low confidence shows specific missing fields
- Acceptance: Shelter questions list is shown when data is unknown

---

### Epic 4: Dog Detail Page

**US-011** — As a user, I want to see a full dog profile with compatibility breakdown on the detail page.
- Acceptance: Photo, name, age, breed, shelter description
- Acceptance: Full compatibility breakdown with score, label, confidence, factors, concerns

**US-012** — As a user, I want to see questions I should ask the shelter before applying.
- Acceptance: "Before You Apply" section visible when any unknown fields exist
- Acceptance: Questions are specific to the missing data (not generic)

**US-013** — As a user, I want to be redirected to the shelter's listing to apply.
- Acceptance: "Visit Shelter Listing" opens shelter URL (external)
- Acceptance: Click is tracked for analytics

**US-014** — As an anonymous user on the Dog Detail Page, I want to see a teaser that explains compatibility matching and prompts me to create a profile.
- Acceptance: Full score is not shown
- Acceptance: Teaser clearly lists what they would unlock

---

### Epic 5: Favorites & Account

**US-015** — As a logged-in user, I want to favorite dogs so I can save them for later.
- Acceptance: Favoriting available from both search card and detail page
- Acceptance: Favorites persist across sessions

**US-016** — As an anonymous user, when I try to favorite a dog I am prompted to create an account.
- Acceptance: Prompt is not disruptive — appears in context, not a full modal takeover
- Acceptance: After account creation, the favorite is saved

---

## TDD Test Plan

### Compatibility Engine Tests

All tests are in the scoring engine's test suite. The engine is a pure function — no mocking required for unit tests.

#### Scoring Tests

| Test ID | Description |
|---------|-------------|
| SCORE-001 | Exact energy match returns 16 pts for energy category |
| SCORE-002 | Adjacent energy match returns 10 pts |
| SCORE-003 | Opposite energy match returns 2 pts |
| SCORE-004 | Unknown dog energy returns 8 pts |
| SCORE-005 | User has kids, dog isKidsOk=true → 18 pts |
| SCORE-006 | User has kids, dog isKidsOk=false → 0 pts + concern generated |
| SCORE-007 | User has kids, dog isKidsOk=unknown → 9 pts + shelter question generated |
| SCORE-008 | User has no kids → 18 pts regardless of isKidsOk value |
| SCORE-009 | User has cats, dog isCatsOk=true → 18 pts |
| SCORE-010 | User has cats, dog isCatsOk=false → 0 pts + concern generated |
| SCORE-011 | User has cats, dog isCatsOk=unknown → 9 pts + shelter question generated |
| SCORE-012 | User has no cats → 18 pts regardless of isCatsOk value |
| SCORE-013 | User has dogs, dog isDogsOk=true → 14 pts |
| SCORE-014 | User has dogs, dog isDogsOk=false → 0 pts + concern generated |
| SCORE-015 | User has dogs, dog isDogsOk=unknown → 7 pts + shelter question generated |
| SCORE-016 | User has no dogs → 14 pts regardless of isDogsOk value |
| SCORE-017 | Yard required, user has yard → 6 pts for yard category |
| SCORE-018 | Yard required, user has no yard → 0 pts + concern generated |
| SCORE-019 | Yard not required → 6 pts |
| SCORE-020 | Yard required unknown → 3 pts |
| SCORE-021 | Fence required, user has fence → 6 pts |
| SCORE-022 | Fence required, user has no fence → 0 pts + concern generated |
| SCORE-023 | Dog requires breed experience, user has none → 2 pts + concern |
| SCORE-024 | Dog requires breed experience, user has species → 6 pts |
| SCORE-025 | Dog requires breed experience, user has breed → 10 pts |
| SCORE-026 | Dog requires no experience → 10 pts for any user |
| SCORE-027 | Exact size match → 8 pts |
| SCORE-028 | Adjacent size → 5 pts |
| SCORE-029 | Non-matching size → 2 pts |
| SCORE-030 | Unknown size → 4 pts |
| SCORE-031 | Dog is special needs, user willing → 4 pts |
| SCORE-032 | Dog is special needs, user not willing → 0 pts + concern |
| SCORE-033 | Dog is not special needs → 4 pts |
| SCORE-034 | Total score is sum of all category scores (0–100) |

#### Confidence Tests

| Test ID | Description |
|---------|-------------|
| CONF-001 | All fields populated → confidence ≥ 80 (High) |
| CONF-002 | isKidsOk missing when user has kids → confidence reduced by 15 |
| CONF-003 | isCatsOk missing when user has cats → confidence reduced by 15 |
| CONF-004 | isDogsOk missing when user has dogs → confidence reduced by 12 |
| CONF-005 | All energy fields missing → confidence reduced by 15 |
| CONF-006 | isYardRequired missing → confidence reduced by 8 |
| CONF-007 | fenceNeeds missing → confidence reduced by 8 |
| CONF-008 | ownerExperience missing → confidence reduced by 8 |
| CONF-009 | sizeGroup missing → confidence reduced by 6 |
| CONF-010 | isSpecialNeeds missing → confidence reduced by 5 |
| CONF-011 | Confidence never goes below 0 |
| CONF-012 | Confidence never goes above 100 |

#### Ranking Tests

| Test ID | Description |
|---------|-------------|
| RANK-001 | Higher compatibility score ranks first |
| RANK-002 | Equal compatibility → higher confidence ranks first |
| RANK-003 | Equal compatibility and confidence → shorter distance ranks first |

#### Determinism Tests

| Test ID | Description |
|---------|-------------|
| DET-001 | Same profile + same dog → same score on repeated calls |
| DET-002 | Same profile + same dog → same label on repeated calls |
| DET-003 | Same profile + same dog → same confidence on repeated calls |
| DET-004 | Same profile + same dog → same breakdown order on repeated calls |

#### AI Safety Tests

| Test ID | Description |
|---------|-------------|
| AI-001 | Scoring engine makes no external HTTP calls |
| AI-002 | Scoring engine makes no calls to AI service |
| AI-003 | AI service cannot mutate or override the score object |
| AI-004 | Search result generation does not trigger AI calls |
| AI-005 | System returns valid result when AI service is unavailable |

### API / Integration Tests

| Test ID | Description |
|---------|-------------|
| API-001 | RescueGroups response is normalized to NormalizedDog before scoring |
| API-002 | Missing API fields are typed as null, not silently coerced to false |
| API-003 | Search returns results when given a valid location |
| API-004 | Search handles RescueGroups API error gracefully |

### Questionnaire Tests

| Test ID | Description |
|---------|-------------|
| QUEST-001 | Quick Match fields are all required |
| QUEST-002 | Improve Accuracy fields are all optional |
| QUEST-003 | Profile is persisted to database on submit |
| QUEST-004 | Profile update sets a "dirty" flag that triggers score recalculation |

### Anonymous User Tests

| Test ID | Description |
|---------|-------------|
| ANON-001 | Anonymous user sees dog listings |
| ANON-002 | Anonymous user sees compatibility teaser on card (not score) |
| ANON-003 | Anonymous user sees compatibility teaser on detail page (not score) |
| ANON-004 | Anonymous user clicking favorite is prompted to create account |
