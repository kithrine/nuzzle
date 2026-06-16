# Sprint 1 Plan — Nuzzle MVP

**Agent**: Sarah (Product Owner)
**Approach**: Spec-driven development + TDD
**Status**: Approved for development

---

## Sprint Goal

Deliver a working MVP that validates the core hypothesis:

> Does compatibility guidance help people make better adoption decisions?

By end of sprint, a user can:
- Browse adoptable dogs from RescueGroups
- Complete a compatibility questionnaire
- Receive a scored, explained compatibility result for each dog
- View a Dog Detail Page with full match breakdown
- Be redirected to the shelter listing to apply

---

## Sprint Stories (Priority Order)

### Story 1 — Initialize Next.js Project
Set up Next.js app with TypeScript, ESLint, Prettier, Tailwind CSS, and folder structure matching the architecture doc.

Acceptance criteria:
- `npm run dev` works
- TypeScript strict mode enabled
- Folder structure matches architecture doc

### Story 2 — Configure PostgreSQL & Prisma
Set up database connection, Prisma schema (initial), and migration pipeline.

Acceptance criteria:
- Database connects locally
- Prisma schema includes User, AdopterProfile, Favorite models
- Migration runs cleanly

### Story 3 — Integrate RescueGroups Search
Implement RescueGroups API client. Normalize API response to `NormalizedDog` type. Display dog listing with photo, name, age, breed.

Acceptance criteria:
- Search by location works
- Response is normalized before any further processing
- Unknown fields are explicitly typed as `null | undefined`, never silently coerced

### Story 4 — Create Adopter Questionnaire
Build two-phase questionnaire: Quick Match (required) and Improve Accuracy (optional). Store profile in database.

Acceptance criteria:
- Quick Match questions: home type, kids, cats, dogs, activity level, experience level
- Improve Accuracy questions: grooming tolerance, fence, yard, special needs, distance, size preference
- Profile persists across sessions
- Profile can be updated; update triggers score refresh flag

### Story 5 — Build Compatibility Engine
Implement `calculateCompatibility(profile, dog)` as a pure function per the compatibility engine spec.

Acceptance criteria:
- All TDD test cases from `docs/architecture/compatibility-engine-spec.md` Section 10 pass
- Engine makes zero external calls
- Returns `CompatibilityResult` with score, label, confidence, breakdown, positiveFactors, concerns, shelterQuestions
- Determinism test passes

### Story 6 — Display Match Scores in Search Results
Show compatibility card on each search result. Show match label, percentage, confidence label, and 2–3 match reasons.

Acceptance criteria:
- Profiled users see: label, percentage, confidence label, 2–3 reasons
- Anonymous users see: teaser ("Create profile to unlock compatibility")
- Sort order: compatibility desc → confidence desc → distance asc (profiled)
- Sort order: distance (anonymous)

### Story 7 — Dog Detail Page
Full dog profile with compatibility breakdown, concerns, confidence explanation, and shelter questions.

Acceptance criteria:
- Photo, name, age, breed, description
- Match label + percentage + confidence label
- Confidence explanation (what data was missing, if any)
- Positive factors list
- Concerns list
- "Before You Apply" shelter questions section
- "Visit Shelter Listing" button (external redirect)

### Story 8 — AI Explanation Service
Add AI-generated natural language explanation to Dog Detail Page. Fallback to rule-based explanation if AI is unavailable.

Acceptance criteria:
- AI explanation appears on Dog Detail Page only
- System functions fully without AI (fallback to structured rule-based text)
- AI is never called during scoring
- AI cannot mutate or override score
- AI safety tests pass

### Story 9 — Favorites
Allow logged-in users to favorite dogs. Favoriting while anonymous prompts account creation.

Acceptance criteria:
- Users can favorite/unfavorite from search card and dog detail page
- Anonymous user clicking favorite is prompted to create account
- Favorites persist across sessions
- Favorites are accessible from user dashboard

### Story 10 — Analytics (Basic)
Track key events: questionnaire completion, dog views, shelter redirects, favorites.

Acceptance criteria:
- Questionnaire completion tracked (Quick Match vs full)
- Dog detail page views tracked
- Shelter redirect clicks tracked
- Favorites tracked

---

## Won't Do (V1)

- Adoption outcome tracking / follow-up surveys (V2)
- Multi-household profiles (V2)
- In-app adoption application
- Shelter-side dashboard
- Social/sharing features
- Gamification
- AI in search results (AI is Dog Detail Page only)

---

## Definition of Done

- Story is implemented
- Tests written alongside or before implementation (TDD)
- All tests pass
- TypeScript has no errors
- Spec doc requirements are met
- No AI called during scoring or search (verified by AI safety tests)
