# AGENTS.md — Nuzzle AI Coding Agent Guide

This file is the source of truth for any AI coding agent working on Nuzzle.
Read this before touching any code.

---

## Project Overview

**App name**: Nuzzle

**Mission**: Help prospective adopters find dogs that genuinely fit their household and lifestyle through transparent compatibility scoring, confidence scoring, and adoption guidance.

**Primary goal**: Reduce adoption return rates by helping users make better adoption decisions.

**Success metric**: Increase successful adoptions and reduce return rates through improved adopter-dog compatibility.

---

## Product Philosophy

This is **not** primarily a dog search platform. This is a **compatibility and decision-support platform** that happens to display adoptable dogs.

The compatibility experience is the core product. Browsing dogs is secondary.

Every feature decision should answer:
> "Will this help someone make a better adoption decision?"

The application should prioritize transparency, trust, and explainability.

---

## MVP Scope

**Included**: Browse adoptable dogs, RescueGroups integration, compatibility questionnaire, deterministic compatibility engine, confidence scoring, structured compatibility explanations, AI-generated explanation summaries, favorites, shelter redirects, analytics foundation.

**Excluded**: Adoption applications, shelter dashboards, multi-household profiles, machine learning recommendations, AI-generated scoring, direct shelter messaging, social features, adoption outcome tracking (V2).

---

## Core Architecture Principle

The compatibility engine is **deterministic and pure**. It is a function:

```ts
calculateCompatibility(userProfile: AdopterProfile, dog: NormalizedDog): CompatibilityResult
```

- No database calls inside it
- No API calls inside it
- No AI calls inside it
- No side effects
- Same input → same output, always

**Data flow**: RescueGroups API → Provider Layer → Normalization Layer → Compatibility Engine → Explanation Layer → User Interface

AI is used **only** for generating natural-language explanations on the Dog Detail Page, after the score has already been calculated. AI never calculates, influences, or mutates scores.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma + Neon |
| Styling | Tailwind CSS |
| Auth | Clerk |
| External API | RescueGroups API |
| AI Provider | Groq |
| Testing | Vitest + React Testing Library + Playwright |

---

## UX Principles

1. Browsing before signup
2. Compatibility is the product
3. Explanations matter more than percentages
4. Confidence communicates uncertainty
5. Mobile-first design
6. Accessibility is mandatory
7. Anonymous browsing must be frictionless

---

## Development Workflow

Every feature must follow this order — never skip to implementation:

**Documentation → Specification → Tests → Implementation → Refactor → Documentation Verification**

---

## Current Development Phase

**Phase**: MVP Implementation

**Priority order**:
1. Foundation
2. RescueGroups Integration
3. Authentication
4. Compatibility Questionnaire
5. Compatibility Engine
6. Confidence Engine
7. Search Ranking
8. Dog Detail Experience
9. AI Explanations
10. Analytics

---

## Source of Truth Hierarchy

When documentation conflicts, this order governs:

1. `docs/architecture/compatibility-engine-spec.md`
2. `docs/architecture/database-api-contract.md`
3. `docs/architecture/architecture.md`
4. `docs/product/prd.md`
5. Implementation

**Implementation must never override specifications.**

---

## Agent Responsibilities

- **Product decisions** → follow `docs/product/prd.md`
- **Architecture decisions** → follow `docs/architecture/architecture.md`
- **Scoring decisions** → follow `docs/architecture/compatibility-engine-spec.md`
- **Database decisions** → follow `docs/architecture/database-api-contract.md`
- **UI decisions** → follow `docs/ux/ux-spec.md`

Do not invent requirements. Do not invent scoring logic. Do not expand scope without explicit approval.

---

## What To Read Before Working on Each Area

| Area | Read First |
|------|-----------|
| Compatibility scoring | `docs/architecture/compatibility-engine-spec.md` |
| Database schema | `docs/architecture/database-api-contract.md` |
| UI screens | `docs/ux/ux-spec.md` + `docs/ux/wireframe-spec.md` |
| Visual design / styling | `docs/ux/visual-design-reference.md` |
| Product requirements | `docs/product/prd.md` |
| Sprint stories | `docs/stories/development-story-pack.md` |
| System design | `docs/architecture/architecture.md` |

---

## Documentation Responsibilities

AI agents must treat documentation as a first-class artifact.

If behavior changes, the corresponding specification must be updated.

Code and documentation must remain synchronized.

Outdated documentation is considered a defect.

When uncertain which document should be updated:

1. Update the most specific document available.
2. Reference related documents that may also require changes.
3. Never leave implementation behavior undocumented.

---

## Docs Structure

```
docs/
  planning/
    project-discovery.md        ← Business analyst output, core concept
    sprint-plan.md              ← Sprint 1 story breakdown
  product/
    prd.md                      ← MVP Product Requirements Document
    user-stories-tdd-plan.md    ← User stories + TDD test plan
  architecture/
    architecture.md             ← System architecture overview
    compatibility-engine-spec.md ← Scoring rules, weights, confidence logic
    database-api-contract.md    ← Schema + API contracts
  stories/
    development-story-pack.md   ← Build-ready story pack
  ops/
    clerk-production-setup.md   ← Clerk prod instance + domain/DNS setup (auth email delivery)
  ux/
    ux-spec.md                  ← User flows, screen inventory, UX rules
    wireframe-spec.md           ← Screen-by-screen wireframe specifications
    wireframe-layouts.md        ← Detailed layout descriptions
    visual-design-reference.md  ← Color mockups, design tokens, component patterns
    mockups/
      mockup-color.png          ← Full-color mockup (5 screens)
      mockup-wireframe.png      ← Labeled grayscale wireframe (5 screens)
AGENTS.md                       ← This file
RULES.md                        ← Hard rules all agents must follow
```

---

## Key Decisions Already Made (Do Not Revisit Without Reason)

| Decision | Resolution |
|----------|-----------|
| Primary success metric | Reduce adoption return rates |
| Compatibility engine | Deterministic, pure function — no AI in scoring |
| AI role | Explanation text only, Dog Detail Page only |
| AI provider | Groq |
| Auth provider | Clerk |
| Testing framework | Vitest + React Testing Library + Playwright |
| Anonymous users | Can browse; see compatibility teaser, not full score |
| Questionnaire timing | Questionnaire → results → then prompt account creation |
| Favorites | Require account; allow before questionnaire |
| Score refresh | Immediate when user updates profile |
| Unknown dog data | Never treat as false; award partial credit, reduce confidence |
| Sort order (profiled, no ZIP) | Compatibility desc → Confidence desc → Distance asc |
| Sort order (profiled, ZIP set) | Distance asc (nearest first) → Compatibility desc tiebreak (scores still shown) |
| Sort order (anonymous) | Distance |
| Confidence display | Human labels (High/Medium/Low) not raw numbers on cards |
| Match display on card | Label + percentage + confidence label + 2–3 match reasons |
| V2 features | Documented separately; do not build in V1 |

---

## Non-Negotiable Product Rules

- Compatibility scores must be explainable
- Unknown data must never be treated as false
- Confidence and compatibility are separate concepts — never merged into one display score
- Search results must never trigger AI generation
- AI explanations are generated only on dog detail pages
- Compatibility ranking order: Compatibility Score → Confidence Score → Distance. **Exception:** when the user sets a ZIP (a location search), order by Distance first (nearest), with compatibility breaking ties — match scores are still shown.

---

## TDD Requirements

This project uses spec-driven TDD. For every new feature:

1. Read the relevant spec doc
2. Write tests first — never after
3. Write **minimal stubs** for every module the tests import (so imports resolve and tests actually run)
4. Run the tests — verify they fail with `Tests: N failed` (assertion failures, not import errors)
5. Capture the red screenshot with `capture.mjs`
6. Replace stubs with the real implementation
7. Run tests — verify they pass with `Tests: N passed`
8. Capture the green screenshot with `capture.mjs`
9. Save both screenshots to `docs/tdd-screenshots/` and embed them in `docs/tdd-screenshots/[story-id].md`
10. Tests must cover the cases listed in `docs/product/user-stories-tdd-plan.md`
11. The compatibility engine must have 100% coverage of scoring and confidence cases

**Critical:** a red screenshot that shows `Tests: no tests` is not a valid red screenshot — it means the module graph failed to resolve before any tests ran. Always use stubs to get real assertion failures before capturing.

**Screenshot format** (`docs/tdd-screenshots/[story-id].md`):

```markdown
## SCORE-001: Kids compatibility — match

**What this test verifies:** User has kids, dog isKidsOk = true → score is 18/18

### Red (failing — before implementation)
![SCORE-001 red](SCORE-001-red.png)

### Green (passing — after implementation)
![SCORE-001 green](SCORE-001-green.png)
```

See `RULES.md` Rule 1 for the complete screenshot workflow.

---

## V2 Placeholder

V2 features are documented but not built. They include: adoption outcome tracking (follow-up surveys at 30/90 days), multi-household profiles, more accurate compatibility model with proprietary behavioral data, and advanced behavioral matching.

Do not build V2 features in V1 unless explicitly instructed.
