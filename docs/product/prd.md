# Product Requirements Document — Nuzzle MVP

**Agent**: John (Product Manager)
**Version**: 1.0
**Status**: Approved

---

## Product Vision

Nuzzle is a compatibility and decision-support layer for dog adoption. It is not a discovery app — it is a guidance tool that helps people make better adoption decisions, reducing return rates and improving outcomes for both adopters and dogs.

---

## Problem

Existing adoption platforms (Petfinder, Adopt-a-Pet) optimize for discovery and engagement. They surface thousands of dogs but provide little guidance on which dog actually fits a specific person's lifestyle. Adopters choose based on photos and proximity. Returns happen because of mismatched energy, incompatible household animals, or unmet training expectations — all preventable with better pre-adoption guidance.

---

## Core Hypothesis

Compatibility guidance, delivered at the point of decision, helps users make better adoption choices and reduces return rates.

---

## Primary Success Metric

Reduction in adoption return rate among Nuzzle users.

Secondary:
- Questionnaire completion rate
- Shelter redirect click-through rate
- User-reported adoption confidence

---

## User Personas

**Primary**: Prospective adopter — considering adoption, wants to make a responsible, lasting decision. May be first-time owner. May have specific household constraints.

**Anonymous visitor**: Browsing dogs without commitment. Must see enough value to create a profile.

---

## MVP Feature Set

### 1. Dog Browse & Search
- Search adoptable dogs by location (via RescueGroups API)
- Results show: photo, name, age, breed, match label, percentage, confidence label, 2–3 match reasons
- Default sort (profiled user): Best Match (compatibility desc → confidence desc → distance asc)
- Default sort (anonymous): Distance

### 2. Compatibility Questionnaire
Phase 1 — Quick Match (~2 min, required for compatibility):
- Home type (apartment / house)
- Children in home (yes / no)
- Cats in home (yes / no)
- Other dogs in home (yes / no)
- Activity level preference (low / moderate / high)
- Dog ownership experience (none / some / breed-specific)

Phase 2 — Improve Accuracy (~3 min, optional):
- Grooming tolerance
- Fence availability
- Yard availability
- Special needs willingness
- Distance preference
- Size preference

### 3. Compatibility Scoring
- Deterministic scoring engine (see `docs/architecture/compatibility-engine-spec.md`)
- Scores 0–100
- Match labels: Strong Match (85–100), Good Match (70–84), Possible Match (50–69), Low Match (0–49)
- Confidence score 0–100, displayed as High/Medium/Low
- Unknown shelter data gets partial credit + confidence reduction (never treated as disqualifying)

### 4. Dog Detail Page
- Full dog profile from RescueGroups
- Match label + percentage
- Confidence label + explanation of what data is missing
- Positive factors list
- Concerns list
- "Before You Apply" questions to ask the shelter
- AI-generated natural language explanation (with rule-based fallback)
- "Visit Shelter Listing" button (redirects to shelter's external page)

### 5. Anonymous User Experience
- Anonymous users can browse dogs without a profile
- Each dog card shows: "Compatibility Matching Available — Create your profile to see Match Score, Why this dog fits, Potential concerns"
- Dog Detail Page shows compatibility teaser with CTA: "Get My Compatibility Match"
- Teaser design: non-intrusive, informational, not guilt-inducing

### 6. Questionnaire → Account Creation Flow
Questionnaire → Show Results → User Favorites a Dog → Prompt Account Creation

NOT: Account Creation → Questionnaire → Results

### 7. Favorites
- Require account to save favorites
- Allow favoriting before completing questionnaire
- Anonymous user clicking favorite is prompted to create account
- Favorites accessible from user dashboard

### 8. Profile Updates
- User can update questionnaire answers at any time
- Score recalculates immediately on next view after profile update

---

## Compatibility Display Requirements

### Search Result Card
- Dog photo
- Name, age, breed
- Match label (e.g., "Strong Match")
- Match percentage (e.g., "91%")
- Confidence label (e.g., "✓ High Confidence")
- 2–3 key match reasons (e.g., "Good with cats", "Moderate energy", "Apartment friendly")

### Dog Detail Page — Compatibility Section
- Match label + percentage
- Confidence label with explanation
  - High: "This recommendation is based on detailed shelter information"
  - Low: Lists specific missing fields + "We recommend contacting the shelter before applying"
- Positive Factors (bulleted list)
- Concerns (bulleted list, shown even for strong matches if any exist)
- Questions to Ask the Shelter (shown when fields are unknown)
- AI explanation (natural language summary, generated only here)

---

## Ranking Rule

For profiled users, sort order is:
1. Compatibility score (descending)
2. Confidence score (descending, as tie-breaker)
3. Distance (ascending, final tie-breaker)

Compatibility and confidence are never merged into a single score for display. They remain separate.

---

## Breed Standard Gap-Filling

When shelter data is missing, Nuzzle may use well-known breed standards to infer values. When this happens:
- A visible disclosure badge appears on the relevant field
- The confidence score is reduced
- The inference is clearly labeled as "Based on breed standards, not shelter-reported data"

---

## AI Constraints

- AI generates explanation text only
- AI is called only on the Dog Detail Page
- AI is called after the score has been calculated
- AI cannot change the score
- The system functions fully without AI (rule-based fallback)

---

## V2 Features (Not Built in V1)

- Adoption outcome tracking (30-day and 90-day follow-up surveys)
- Multi-household profiles
- More accurate behavioral compatibility model
- Proprietary compatibility data
- Advanced breed-behavioral matching
- Shelter-side dashboard

---

## Out of Scope (V1)

- In-app adoption application
- Cat / other species
- Social/sharing features
- Gamification
- Breed popularity rankings
- Payment of any kind
