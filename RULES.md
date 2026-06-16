# RULES.md — Nuzzle Non-Negotiable Development Rules

These rules take precedence over convenience, speed, assumptions, or AI suggestions.
Any agent working on this codebase must follow them.

---

## Rule 1: TDD Is Mandatory

For every feature:

1. Write the test
2. Verify the test fails
3. Implement the feature
4. Verify the test passes
5. Refactor if needed

No production code should be written before the corresponding test exists.

Test cases for the compatibility engine are enumerated in `docs/product/user-stories-tdd-plan.md`.
The engine test suite must also cover every case in `docs/architecture/compatibility-engine-spec.md` Section 10.

---

## Rule 2: Spec-Driven Development

Implementation must follow approved specifications. If implementation and specification disagree: **STOP**. Update the specification or request clarification. Do not guess.

Required references:

| Area | Document |
|------|---------|
| Product requirements | `docs/product/prd.md` |
| System design | `docs/architecture/architecture.md` |
| Compatibility scoring | `docs/architecture/compatibility-engine-spec.md` |
| Database & API | `docs/architecture/database-api-contract.md` |
| UI & flows | `docs/ux/ux-spec.md` |

**Source of truth hierarchy** (when documents conflict): Compatibility Engine Spec → Database & API Contract → Architecture Doc → PRD → Implementation.

Implementation must never override specifications.

---

## Rule 3: No AI Scoring

AI is forbidden from: compatibility scoring, ranking calculations, confidence calculations, weight assignment.

AI may only: generate explanations, improve readability, summarize compatibility results.

AI must not be called during search result generation. AI explanations are generated only when a user opens a Dog Detail Page.

---

## Rule 4: Deterministic Compatibility

The same inputs must always produce the same outputs. No randomness. No model inference. No hidden weighting.

Same user profile + same dog data = same score, label, confidence, and breakdown, every time.

---

## Rule 5: Pure Compatibility Engine

The compatibility engine must be a pure function:

```ts
calculateCompatibility(userProfile: AdopterProfile, dog: NormalizedDog): CompatibilityResult
```

Must NOT: access databases, call APIs, call AI, modify state.

Must: accept inputs, return outputs. Only.

---

## Rule 6: Provider Isolation

RescueGroups field names must not leak outside the provider layer. All API responses are mapped to `NormalizedDog` before any scoring logic runs. Business logic must use `NormalizedDog`, not raw API responses.

---

## Rule 7: Unknown Does Not Mean False

Missing shelter data must never be interpreted as negative.

Unknown values: reduce confidence, generate shelter questions.

Unknown values do **not** become `false` or `0`. If a field is unknown, the engine awards partial credit and reduces confidence. It never penalizes the dog for missing shelter data.

---

## Rule 8: Confidence and Compatibility Are Always Separate

Confidence and compatibility are separate scores. They are never merged into a single public-facing number. They are displayed separately.

Confidence measures data completeness. Compatibility measures lifestyle fit. These are different concepts.

---

## Rule 9: System Must Function Without AI

If the AI explanation service is unavailable, the app still works. Users see rule-based explanations instead. The AI call is a progressive enhancement, not a dependency.

The system must never be in a broken state because the AI provider is down.

---

## Rule 10: Product Flow Requirements

- **Anonymous users can browse dogs.** They see a compatibility teaser (not the actual score) on Dog Detail Pages.
- **The questionnaire comes before account creation**, not after. Users complete the questionnaire, see results, and are prompted to create an account when they try to save a favorite.
- **Favorites require an account.** Favoriting a dog triggers account creation if the user is anonymous.
- **Profile updates immediately invalidate scores.** When a user changes their profile, compatibility scores must recalculate on next view.

---

## Rule 11: UX Display Requirements

- **Match labels are shown before percentages.** "Strong Match" is more prominent than "91%".
- **Confidence is shown as a human label** (High / Medium / Low), not a raw number, on cards and in the UI.
- **Low match dogs still get an explanation.** They are not hidden — they get an explanation of why they are a poor fit.
- **The questionnaire is split into Quick Match (required, ~2 min) and Improve Accuracy (optional, ~3 min additional).** Do not combine them into one long form.
- **The "Before You Apply" section must appear on every Dog Detail Page** where data is missing or partial. See `docs/ux/ux-spec.md`.

---

## Rule 12: Mobile First

All UI decisions must be evaluated on mobile before desktop. See `docs/ux/wireframe-layouts.md` for mobile wireframes.

---

## Rule 13: Accessibility

Every UI feature must support: keyboard navigation, screen readers, focus states, WCAG AA compliance.

Status indicators (match labels, confidence labels) must never rely solely on color.

---

## Rule 14: Analytics First

Track meaningful user actions before shipping each feature. Required events: Questionnaire Started, Questionnaire Completed, Search Performed, Dog Viewed, Compatibility Viewed, Favorite Added, Shelter Clicked.

---

## Rule 15: No Scope Creep

MVP includes: dog search, profiles, compatibility scoring, confidence scoring, explanations, favorites.

MVP excludes: social features, messaging, shelter portals, machine learning, adoption workflows, multi-household profiles, adoption outcome tracking.

Do not implement excluded features. See `AGENTS.md` for the full V2 list.

---

## Rule 16: API Resilience

All provider integrations must handle: failures, timeouts, invalid responses, rate limits (429).

The application must fail gracefully. RescueGroups unavailable → 503 with message, not crash. AI unavailable → rule-based fallback, not error.

---

## Rule 17: Favor Simplicity

Choose simpler architecture, fewer services, fewer dependencies — unless complexity provides measurable value.

---

# Rule 18: Documentation Synchronization

Documentation is part of the product.

Whenever behavior changes, the corresponding documentation must be updated.

Examples:

- Compatibility logic changes
  → Update compatibility-engine-spec.md

- Database schema changes
  → Update database-api-contract.md

- API contract changes
  → Update database-api-contract.md

- User stories change
  → Update user-stories-tdd-plan.md

- Sprint scope changes
  → Update sprint-plan.md

- UX behavior changes
  → Update ux-spec.md

- Wireframe changes
  → Update wireframe-spec.md and wireframe-layouts.md

Documentation updates must occur in the same change set as the implementation.

A task is not complete if documentation is outdated.

---

## Rule 19: Definition of Done

A task is complete only when all of the following are true:

- Specification exists and matches implementation
- Tests exist (written before or alongside implementation)
- Tests pass
- Code is implemented
- Lint passes
- TypeScript types pass (`npx tsc --noEmit`)
- Acceptance criteria from `docs/stories/development-story-pack.md` are met
- Documentation is updated if behavior changed
- Documentation reviewed for consistency
- No specification conflicts introduced

---

## Rule 20: Testing Framework

Use **Vitest + React Testing Library + Playwright**. Do not use Jest.

AI safety tests must verify: the scoring engine never calls AI, AI cannot mutate the score, and search result generation does not trigger AI calls.

---

## Naming Conventions

- App name: **Nuzzle**
- Internal type: `AdopterProfile` (not `UserProfile`)
- Internal type: `NormalizedDog` (not `Dog` or `RescueDog`)
- Internal type: `CompatibilityResult` (not `ScoreResult` or `MatchResult`)
