# UX Specification v1.0 — Nuzzle

Status: Approved

---

## Purpose

This document defines the user experience requirements, user flows, interaction principles, navigation structure, screen designs, accessibility requirements, and acceptance criteria for Nuzzle.

This document is the source of truth for frontend implementation.

For visual design reference (color mockups, design tokens, component patterns), see `docs/ux/visual-design-reference.md`.

---

## UX Mission

Nuzzle should feel like a **thoughtful adoption advisor** — not a dating app, not an e-commerce store.

The compatibility engine produces insights. The UX job is to make those insights feel trustworthy, not just impressive.

Trust is built through:
- **Explanation** — why the score is what it is
- **Transparency** — what data is missing
- **Honesty** — showing concerns, not hiding them
- **Confidence labeling** — signaling data quality

---

## Core UX Principles

**Principle 1: Compatibility Is The Product**
Nuzzle is not primarily a dog search platform. It is a compatibility and decision-support platform. The interface should consistently reinforce the value of compatibility matching.

**Principle 2: Browsing Before Signup**
Users must be able to browse dogs before creating an account. The platform must demonstrate value before requesting registration. The questionnaire is friction — present it as a path to better results, never as a gate to browsing.

**Principle 3: Explanations Matter More Than Scores**
Compatibility percentages create curiosity. Compatibility explanations create trust. Explanations should be emphasized over percentages. "Strong Match" is more scannable and actionable than "91%."

**Principle 4: Confidence Communicates Uncertainty**
Confidence scores exist to communicate recommendation reliability. Confidence must never be confused with compatibility. Confidence is always shown as a human label (High / Medium / Low) — never a raw number.

**Principle 5: Uncertainty Is Useful Information**
Missing shelter data is not a failure state — it is information. Display it clearly and use it to generate shelter questions.

**Principle 6: Low Match Dogs Get Explanations**
Hiding bad matches does not reduce returns — explaining them does. Low match dogs always appear in results with an explanation of why they are a poor fit.

**Principle 7: Mobile First**
All UX decisions must be validated on mobile before desktop. The baseline is 375px (iPhone SE).

---

## Navigation Structure

### Anonymous Users

```
Top Nav:
  Nuzzle (logo → home)
  [Browse Dogs]
  [Compatibility Profile]
  [Login]

Mobile Bottom Tab Bar:
  Home | Search | [Get My Match Score] | Login
```

### Authenticated Users

```
Top Nav:
  Nuzzle (logo → home)
  [Best Matches]
  [Browse Dogs]
  [Favorites]
  [Profile]

Mobile Bottom Tab Bar:
  Home | Search | ♡ Favorites | Profile
```

---

## User Flows

### Flow 1: Anonymous Browse → Questionnaire → Account Creation

```
Landing Page (Browse CTA prominent, Questionnaire CTA secondary)
        ↓
Search Results (dogs visible, compatibility teasers on cards, distance sort)
        ↓
Dog Detail Page (compatibility gated with teaser)
        ↓
User clicks "Get My Compatibility Match"
        ↓
Quick Match Questionnaire (~2 min, required) — answers held in localStorage while anonymous
        ↓
On completion → Account creation (/signup)
        ↓
After sign-up → returns to /questionnaire, which auto-creates the profile from the stored answers
        ↓
Best Matches (nationwide, ranked by compatibility); profile persisted to database
```

(Favoriting a dog while anonymous also triggers account creation via the Screen 9 modal — an independent entry point.)

### Flow 2: Personalized Matching (First-Time Profiled User)

Two orderings, same destination:

```
Account-first:  Sign Up → /questionnaire (forced redirect) → complete → Best Matches
Questionnaire-first:  /questionnaire (anonymous) → complete → Sign Up → resume → Best Matches
        ↓
Best Matches (nationwide, scored, sorted by compatibility)
        ↓
Dog Detail Page (full compatibility breakdown)
        ↓
Favorite Dog → Visit Shelter Listing (external redirect)
```

### Flow 3: Returning User

```
Login
        ↓
Best Matches (profile loaded, scores shown)
        ↓
Dog Detail Page with full breakdown
        ↓
"Visit Shelter Listing" → external redirect
```

### Flow 4: Profile Update

```
User Dashboard → Edit Profile
        ↓
/questionnaire edit mode: "Your Profile" summary → "Edit Your Profile" form (pre-filled)
        ↓
User updates answers → Save Changes
        ↓
Profile version incremented
        ↓
Return to the profile summary (no forced redirect); scores reflect the updated profile on next view
```

---

## Screen Inventory

| Screen | Auth Required | Notes |
|--------|--------------|-------|
| Homepage / Landing | No | Primary CTA: Browse Dogs |
| Search Results | No | Scores visible for profiled users only |
| Dog Detail Page | No | Full score visible for profiled users only |
| Quick Match Questionnaire | No | Stored in session until account created |
| Improve Accuracy Questionnaire | Yes | Builds on Quick Match |
| Account Creation | No | Triggered by favoriting or explicit choice |
| Login | No | |
| User Dashboard / Favorites | Yes | |
| Edit Profile | Yes | |

---

## Landing Page

### Hero Section

**Headline**: Find a dog that fits your lifestyle.

**Subheadline**: Browse adoptable dogs and receive personalized compatibility matching.

**Primary CTA**: Browse Dogs → Search Results

**Secondary CTA**: Create Compatibility Profile → Questionnaire

**Design note**: Primary CTA is browsing, NOT the questionnaire. Let users in before asking for their time.

### How It Works Section

Three-step explanation (below the hero):
1. Create Profile
2. Get Match Scores
3. Find Your Dog

### Featured Dogs Section

Display 8 real, adoptable dogs drawn nationwide. The set rotates every ~5 hours (window-seeded selection). The nationwide pool is cached at the data layer (`unstable_cache`, 5h, seed-keyed), so the RescueGroups call runs at most once per window regardless of render mode — repeat visitors see fresh dogs without per-request API churn. A horizontal carousel with functional left/right arrows. Encourages browsing and demonstrates the product before signup.

---

## Search Results Page

### Anonymous User Card

```
[Dog Photo]
Charlie
Young • Medium • Labrador Mix

─────────────────────────────
Compatibility Matching Available
Create your profile to see:
✓ Match Score
✓ Why this dog fits
✓ Potential concerns
─────────────────────────────
[View Details]
```

### Profiled User Card

```
[Dog Photo]
Charlie
Young • Medium • Labrador Mix

🟢 Strong Match
91%  ✓ High Confidence

• Good with cats
• Moderate energy
• Apartment friendly

[View Details]
```

### Card Design Rules

- Match label is more visually prominent than the percentage
- Confidence is shown as a colored label, not a number
- 2–3 match reasons shown as short phrases (not full sentences)
- Low match cards are not hidden — they appear with their explanation snippets
- Sort label shown: "Showing Your Matches" (nationwide / profiled) / "Showing Nearby Dogs" (when a zip filter is applied)

### Confidence Color Coding

- 🟢 High Confidence
- 🟡 Medium Confidence
- 🔴 Low Confidence

Status indicators must never rely on color alone — always include a text label.

### Default Sort Order

Profiled users:
1. Compatibility score (descending)
2. Confidence score (descending)
3. Distance (ascending)

Anonymous users:
1. Distance (ascending)

---

## Dog Detail Page

The most important screen in the application. This is where trust is won or lost.

### Layout (top to bottom)

1. Dog photos (large, full-width)
2. Name, age, breed, shelter name, distance
3. Compatibility Card
4. Shelter description
5. "Before You Apply" section (shelter questions)
6. "Visit Shelter Listing" button

### Compatibility Card — Profiled User (High Confidence)

```
┌─────────────────────────────────────┐
│  🟢 Strong Match    91%             │
│  ✓ High Confidence                  │
│                                     │
│  Why Charlie fits your lifestyle:   │
│  ✓ Good with cats                   │
│  ✓ Moderate energy matches yours    │
│  ✓ Does not require a fenced yard   │
│                                     │
│  Potential Concerns:                │
│  ⚠ Needs daily exercise             │
│                                     │
│  [AI-generated explanation text]    │
└─────────────────────────────────────┘
```

### Compatibility Card — Profiled User (Low Confidence)

```
┌─────────────────────────────────────┐
│  🟢 Strong Match    91%             │
│  🔴 Low Confidence                  │
│                                     │
│  Some important information is      │
│  missing:                           │
│  • Cat compatibility unknown        │
│  • Yard requirements unknown        │
│                                     │
│  We recommend asking the shelter    │
│  before applying.                   │
└─────────────────────────────────────┘
```

### Compatibility Card — Anonymous User

```
┌─────────────────────────────────────┐
│  Compatibility Analysis Available   │
│                                     │
│  Create your profile to see:        │
│  ✓ Match Score                      │
│  ✓ Compatibility Explanation        │
│  ✓ Potential Concerns               │
│  ✓ Questions to Ask the Shelter     │
│                                     │
│  [Get My Compatibility Match]       │
└─────────────────────────────────────┘
```

### Compatibility Section Required Elements

- Compatibility score (0–100) and match label
- Confidence label (High / Medium / Low) with explanation
- Match Factors: "Why This Dog Fits" — bulleted positive factors
- Potential Concerns — bulleted list (shown even on strong matches if any exist)
- Questions to Ask the Shelter — bulleted list (shown when fields are unknown)
- AI-generated explanation text (below structured breakdown)

### "Before You Apply" Section

Appears when any shelter fields are unknown. Questions are dog-specific (use the dog's name).

```
Before You Apply
─────────────────────────────────────
We recommend asking the shelter:

• Has Charlie lived with or been tested around cats?
• How much daily exercise does Charlie currently need?
• Does Charlie require a fenced yard?
```

### Actions

- **Visit Shelter Listing** — opens shelter URL in new tab; click is tracked
- **Favorite** — saves dog (authenticated) or prompts account creation (anonymous)

---

## Questionnaire Flow

### Onboarding — Name (first screen)

Before Phase 1, a short card asks the user's first/last name ("Welcome! What should we call you?"). Optional and skippable, but it personalizes the dashboard ("Welcome back, {firstName}"). Stored on the `User` (seeded from Clerk if available, editable later on the profile page). For the questionnaire-first flow the name is carried in the pending profile and saved on resume.

### Phase 1 — Quick Match (~2 min, required)

Progress indicator visible throughout. One question per screen on mobile.

**Questions**:
1. What type of home do you live in? (Apartment / House / Other)
2. Do you have children in your home? (Yes / No)
3. Do you have cats? (Yes / No)
4. Do you have other dogs? (Yes / No)
5. How active is your lifestyle? (Low / Moderate / High)
6. What's your experience level with dogs? (First-time owner / Experienced owner / Breed-specific experience)

After Phase 1:
→ Show results immediately (no account required)
→ Prompt to continue to Phase 2 to improve accuracy

### Phase 2 — Improve Accuracy (~2–3 min, optional, 8 questions)

These now feed the rebalanced compatibility engine (Grooming, Age, and Sex were added as scored categories).

**Questions**:
7. How much grooming are you comfortable with? (Low / Moderate / High) — scored vs the dog's coat/grooming needs
8. Do you have a yard? (Fenced yard / Unfenced yard / No yard) — one question that sets both yard + fence
9. Are you open to adopting a dog with special needs? (Yes / No / Maybe)
10. Any age preference? (Puppy / Young / Adult / Senior / No preference) — scored vs the dog's age
11. Any sex preference? (Male / Female / No preference) — scored vs the dog's sex
12. Do you have a size preference? (Small / Medium / Large / X-Large / No Preference)
13. How long is your dog alone on a typical day? (Under 4h / 4–8h / 8h+) — soft signal (not in the % score; informs guidance)
14. Preferred adoption distance — slider that snaps to 5 / 10 / 25 / 50 / 100 miles with a live readout

---

## Questionnaire UX Rules

- Never show the questionnaire as a gate to browsing
- Phase 1 framing: "Answer 6 quick questions to see how dogs match your lifestyle"
- Phase 2 framing: "Improve your match accuracy — 8 more optional questions"
- No question should feel like a disqualification
- "First-time owner" must not feel shameful — it is the majority of adopters
- Questionnaire comes before account creation; account creation prompt comes after results are shown

---

## Concern Display Rules

- Concerns are shown even for Strong Match dogs
- Concerns are phrased constructively, never as warnings:
  - ✅ "This dog may need more daily exercise than your profile suggests."
  - ❌ "WARNING: High energy dog. Not suitable."
- Low match dogs show concerns prominently but are never hidden from results
- Low match dogs include a "See Better Matches" shortcut

---

## Empty States

| State | Message |
|-------|---------|
| No search results | "No dogs found near [location]. Try expanding your search radius." |
| No strong matches | "We couldn't find strong matches using your current profile. Try adjusting your preferences." |
| Provider failure | "Unable to load dogs at this time. Please try again later." |
| No favorites | "You haven't saved any dogs yet. Browse dogs to get started." (with Browse CTA) |

---

## Mobile-First Requirements

- All layouts must function at 375px width (iPhone SE baseline)
- Bottom tab navigation on mobile
- Dog cards are full-width on mobile
- Compatibility card is collapsible on mobile (expanded by default)
- "Before You Apply" section is collapsible on mobile
- Questionnaire is one question per screen on mobile
- Primary actions ("Visit Shelter Listing", "Favorite") must remain visible without excessive scrolling

---

## Accessibility Requirements

- All interactive elements meet WCAG 2.1 AA
- Color is never the only indicator — confidence labels always have text + icon
- Match labels are screen-reader friendly (e.g., "Strong Match, 91 percent")
- Images have descriptive alt text
- Questionnaire is keyboard-navigable
- Focus management on questionnaire step transitions
- Status indicators ("High Confidence", "Strong Match") include text, not color only

---

## UX Success Criteria

### Anonymous Users
- Can browse immediately without any signup prompt
- Understand the compatibility value proposition from the teaser

### Registered Users
- Can complete Phase 1 profile in under 3 minutes
- Can view personalized matches immediately after questionnaire

### Trust
- Scores are explainable — users understand why a dog scored as it did
- Confidence is understandable — users know when data is missing
- Missing information is shown transparently, not hidden

### Conversion
- Value demonstrated before signup is requested
- Account creation occurs naturally at a moment of engagement (favoriting)

---

## Future UX Considerations (Excluded from MVP)

These may be revisited in future versions:
- Household profiles (multiple adopter preferences per account)
- Adoption outcome tracking and follow-up flows
- Shelter messaging
- AI adoption advisor / conversational interface
