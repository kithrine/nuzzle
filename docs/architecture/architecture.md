# System Architecture — Nuzzle

**Agent**: Winston (Architect)
**Status**: Approved

---

## Architecture Overview

Nuzzle is a Next.js full-stack application with a PostgreSQL database and integration with the RescueGroups API. The core architectural principle is that compatibility scoring is **fully decoupled from AI and all external services**.

```
┌─────────────────────────────────────┐
│           Next.js App               │
│  (App Router, React Server Components)
│                                     │
│  ┌───────────────┐  ┌────────────┐  │
│  │  Search/Browse │  │ Dog Detail │  │
│  │  (Server)      │  │ (Server)   │  │
│  └───────┬───────┘  └─────┬──────┘  │
│          │                │         │
│  ┌───────▼────────────────▼──────┐  │
│  │       API Route Layer         │  │
│  └───────┬───────────────┬───────┘  │
│          │               │          │
│  ┌───────▼──────┐ ┌──────▼───────┐  │
│  │ RescueGroups │ │ Compatibility │  │
│  │ API Client   │ │ Engine        │  │
│  └───────┬──────┘ └──────┬───────┘  │
│          │               │          │
│  ┌───────▼───────────────▼───────┐  │
│  │         PostgreSQL / Prisma   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌────────────────────────────────┐  │
│  │   AI Explanation Service       │  │
│  │   (Dog Detail Page only)       │  │
│  │   (Never called during scoring)│  │
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma & Neon |
| Styling | Tailwind CSS |
| External API | RescueGroups API |
| Auth | Clerk |
| AI Provider | Groq — explanation only |
| Testing | Vitest + React Testing Library + Playwright |

---

## Folder Structure

```
nuzzle/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Homepage / search
│   ├── dogs/
│   │   └── [id]/
│   │       └── page.tsx        # Dog Detail Page
│   ├── questionnaire/
│   │   └── page.tsx            # Questionnaire flow
│   ├── dashboard/
│   │   └── page.tsx            # User favorites + profile
│   └── api/
│       ├── dogs/route.ts       # Dog search endpoint
│       ├── compatibility/route.ts
│       └── auth/route.ts
├── lib/
│   ├── compatibility/
│   │   ├── engine.ts           # Pure scoring function
│   │   ├── types.ts            # AdopterProfile, NormalizedDog, CompatibilityResult
│   │   └── normalize.ts        # RescueGroups → NormalizedDog mapper
│   ├── rescuegroups/
│   │   └── client.ts           # RescueGroups API client
│   ├── ai/
│   │   └── explainer.ts        # AI explanation service (with fallback)
│   └── db/
│       └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma
├── __tests__/
│   ├── compatibility/
│   │   ├── engine.test.ts
│   │   ├── confidence.test.ts
│   │   └── ranking.test.ts
│   └── api/
│       └── dogs.test.ts
└── docs/                       # All planning docs
```

---

## Core Data Flow

### Search Flow (Profiled User)

```
User searches by location
        ↓
RescueGroups API returns dog listings
        ↓
Each dog is normalized to NormalizedDog
        ↓
calculateCompatibility(profile, normalizedDog) called for each dog
        ↓
Results sorted: compatibility desc → confidence desc → distance asc
        ↓
Search results rendered with score, label, confidence, 2–3 reasons
```

### Dog Detail Flow

```
User opens dog detail page
        ↓
Dog data fetched + normalized
        ↓
calculateCompatibility(profile, normalizedDog) called
        ↓
CompatibilityResult generated (score, confidence, factors, concerns, questions)
        ↓
AI Explanation Service called with CompatibilityResult
  (if AI unavailable → fallback to rule-based explanation text)
        ↓
Dog Detail Page rendered
```

---

## Compatibility Engine

See `docs/architecture/compatibility-engine-spec.md` for full specification.

Key constraints:
- Pure function: `calculateCompatibility(AdopterProfile, NormalizedDog): CompatibilityResult`
- No external calls of any kind
- Deterministic: same input → same output
- AI is called **after** the engine, not inside it

---

## Database Schema (Overview)

See `docs/architecture/database-api-contract.md` for full schema.

Models:
- `User` — authentication and identity
- `AdopterProfile` — questionnaire answers, profile version
- `Favorite` — user ↔ dog association
- `DogCache` — optional: cached/normalized dog data

`profile_version` on `AdopterProfile` is incremented on any update. This is used to detect when scores need to be recalculated.

---

## AI Explanation Service

Location: `lib/ai/explainer.ts`

Contract:
```ts
generateExplanation(result: CompatibilityResult, dog: NormalizedDog): Promise<string>
```

Constraints:
- Called only on Dog Detail Page
- Called after score is calculated
- Returns explanation string or throws
- Calling code must handle failure gracefully (fall back to rule-based text)
- Cannot modify the `CompatibilityResult` object passed to it

---

## RescueGroups Integration

- All API responses are mapped through `lib/compatibility/normalize.ts` before any other use
- Unmapped or missing fields become `null` in `NormalizedDog` — never coerced to `false` or `0`
- Normalization is tested independently from scoring

---

## Anonymous vs Authenticated Behavior

| Feature | Anonymous | Authenticated |
|---------|----------|--------------|
| Browse dogs | ✅ | ✅ |
| See dog photos / name / breed | ✅ | ✅ |
| See compatibility score | ❌ (teaser) | ✅ |
| See match explanation | ❌ (teaser) | ✅ |
| Sort by compatibility | ❌ (distance sort) | ✅ |
| Favorite dogs | ❌ (prompt to create account) | ✅ |
| Complete questionnaire | ✅ (stored in session) | ✅ (stored in DB) |

---

## Profile Version & Score Refresh

When a user updates their profile:
1. `profile_version` is incremented in the database
2. Any cached compatibility scores (if implemented) are invalidated
3. On next page view, scores recalculate using the updated profile

In V1, scores are calculated on-demand (not precomputed). No score precomputation.

---

## V2 Architecture Notes

V2 additions (not built now):
- Adoption outcome tracking schema additions (adoption events, follow-up surveys)
- More sophisticated scoring model (may require ML inference service)
- Proprietary behavioral dataset storage
