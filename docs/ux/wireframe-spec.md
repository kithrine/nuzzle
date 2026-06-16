# Wireframe Specification — Nuzzle

Version: 1.0
Status: Approved

See `docs/ux/wireframe-layouts.md` for detailed ASCII wireframe representations.

---

## Purpose

This document defines the layout structure, content hierarchy, screen composition, and interaction requirements for Nuzzle.

This document is the blueprint for low-fidelity wireframes and high-fidelity mockups.

**In scope**: Layout, hierarchy, information architecture, user flow, interaction behavior.
**Out of scope**: Colors, branding, typography details.

---

## Global Design Rules

### Mobile First

Primary target is iPhone-sized devices. All screens are designed mobile-first before desktop adaptation.

### Layout Philosophy

Prioritize:
1. Compatibility visibility
2. Ease of browsing
3. Adoption decision support

Avoid:
- Visual clutter
- Excessive scrolling
- Hidden compatibility information

---

## Navigation

**Anonymous:**
- Logo
- Browse Dogs
- Compatibility Profile
- Login

**Authenticated:**
- Logo
- Best Matches
- Browse Dogs
- Favorites
- Profile

**Desktop top nav**: Logo left, search bar center, primary actions right.

**Mobile bottom tab bar (anonymous)**: Home | Search | [Get My Match Score] | Login

**Mobile bottom tab bar (authenticated)**: Home | Search | ♡ Favorites | Profile

"Favorites" tab for anonymous users shows the account creation prompt instead of a list.

---

## Screen Inventory

1. Home Page
2. Search Results — Anonymous
3. Search Results — Authenticated
4. Dog Detail — Anonymous
5. Dog Detail — Authenticated
6. Quick Match Questionnaire
7. Expanded Questionnaire
8. Match Results
9. Account Creation Prompt
10. User Dashboard / Favorites
11. Profile Management / Edit Profile

---

## Screen 1: Home Page

**Goal**: Allow users to immediately understand the product value. Convert visitors to browsers, not to the questionnaire first.

**Layout order (top to bottom)**:

1. Header (logo, Browse Dogs, Login)
2. Hero section
   - Headline: "Find a dog that fits your lifestyle."
   - Subheadline: "Browse adoptable dogs and receive personalized compatibility matching."
   - Primary CTA: "Browse Dogs" → Search Results
   - Secondary CTA: "Create Compatibility Profile" → Questionnaire
3. Value proposition callouts (3 short items: Better Matches · Honest Insights · Fewer Returns)
4. How It Works (3 cards: Create Profile → Get Match Scores → Find Your Dog)
5. Featured Dogs — scrollable dog cards (Photo, Name, Breed, Age, View Details). Shows compatibility teasers to encourage profile creation.
6. Footer (About · Contact · Privacy · Terms)

**Key design decision**: Primary CTA is Browse, not the questionnaire. Prove value before asking for commitment.

---

## Screen 2: Search Results — Anonymous

**Goal**: Allow browsing while encouraging profile creation.

**Layout order**:

1. Search controls (Zip Code, Radius, Filters, Sort)
2. Results count (e.g., "247 Dogs Found")
3. Dog cards (see below)
4. Pagination (Previous / Next)

**Dog Card**:
- Photo (aspect ratio locked, no crop distortion)
- Name, breed, age, shelter, distance
- Compatibility teaser badge: "Create a profile to unlock: Match Score · Compatibility Explanation · Potential Concerns"
- Actions: "View Details" | "Get My Match"

**Interactions**:
- Full card is tappable → Dog Detail Page
- Tap favorite icon → account creation prompt
- Search bar change → re-fetches results
- Sort default: Distance

---

## Screen 3: Search Results — Authenticated

**Goal**: Highlight compatibility immediately.

**Header**: "Best Matches For You" / "Based on Your Profile"

**Layout order**:

1. Search controls (Zip Code, Radius, Filters; Default sort: Best Match)
2. Dog cards (see below)
3. Pagination

**Dog Card**:
- Photo
- Name, breed, age, distance
- Match label (large, colored by tier)
- Match percentage
- Confidence label (colored)
- Match factors (max 3 visible): e.g., "Good with Cats · Moderate Energy · Apartment Friendly"
- Actions: "Favorite" | "View Details"

**Interactions**:
- Full card is tappable → Dog Detail Page
- Tap favorite icon → saves immediately
- Sort label: "Showing Best Matches for You"

---

## Screen 4: Dog Detail — Anonymous

**Goal**: Demonstrate compatibility value; drive questionnaire conversion.

**Layout order (scroll)**:

1. Photo gallery (large, full-width)
2. Dog overview (name, age, breed, shelter name, distance)
3. Compatibility teaser card:
   - "Compatibility Analysis Available"
   - "Create your profile to see: Match Score · Match Explanation · Potential Concerns · Questions to Ask the Shelter"
   - Primary CTA: "Get My Compatibility Match" → Questionnaire
4. About Dog (shelter description)
5. Visit Shelter Listing button

---

## Screen 5: Dog Detail — Authenticated

**Goal**: Provide complete recommendation experience and build trust.

**Layout order (scroll)**:

1. Photo gallery (large, full-width)
2. Dog overview (name, age, breed, shelter name, distance)
3. Compatibility Card (see below)
4. About Dog (shelter description)
5. "Before You Apply" section (see below)
6. "Visit Shelter Listing" button (filled, full-width on mobile; click tracked for analytics)

**Compatibility Card**:
- Match label (large, colored by tier)
- Match percentage
- Confidence label (colored, tappable → opens Confidence Explanation Modal)
- Confidence explanation: 1–2 sentences about what data is/isn't present
- "Why This Dog Fits" — bulleted list with check icons
- Potential Concerns — bulleted list with warning icons (section hidden if no concerns)
- AI-generated explanation paragraph (if available)
- Fallback: structured rule-based text (if AI unavailable; no error message shown)

**"Before You Apply" Section**:
- Only shown when any dog fields are `"Unknown"`
- Heading: "Before You Apply"
- Subheading: "We recommend asking the shelter:"
- Bulleted questions using the dog's name (e.g., "Has [name] been tested around cats?")
- Collapsible on mobile (open by default); always visible on desktop

---

## Screen 6: Quick Match Questionnaire

**Goal**: Collect minimum information to generate compatibility scores in under 3 minutes.

**Layout**:
- Progress bar at top (steps 1–6)
- One question per screen on mobile
- Question headline
- Answer options (large tap targets)
- "Next" button
- "Skip for now" option (allowed but not recommended)

**Questions** (6 screens):
1. Home type: Apartment / House / Other
2. Children in home: Yes / No
3. Cats in home: Yes / No
4. Other dogs: Yes / No
5. Activity level: Low / Moderate / High (with brief descriptions)
6. Experience: First-time owner / I've owned dogs before / I have experience with specific breeds

**Final action**: "Generate My Matches"

**Post-questionnaire screen**:
- "Your matches are ready!"
- "See My Matches" → Search Results (with scores now showing)
- "Answer 6 more questions to improve accuracy" → Expanded Questionnaire
- Small print: "You can always update your profile later"

---

## Screen 7: Expanded Questionnaire

**Goal**: Optional additional questions to improve recommendation quality and increase confidence scores.

**Layout**: Same pattern as Quick Match (progress bar, one question per screen on mobile).

**Questions** (6 screens):
1. Grooming tolerance: Low / Moderate / High
2. Fenced yard: Yes / No
3. Yard (unfenced ok): Yes / No
4. Special needs: Yes / No / Open to it
5. Distance preference: slider or dropdown (miles)
6. Size preference: Small / Medium / Large / X-Large / No Preference

**Final action**: "Improve My Matches"

**Post-questionnaire screen**:
- "Your matches just got better!"
- "See Updated Matches" → Search Results

---

## Screen 8: Match Results

**Goal**: Display personalized recommendations immediately after questionnaire completion.

**Header**: "Your Best Matches"

**Summary line**: "Profile Complete · [N] Strong Matches Found"

**Content**: Same dog card structure as Screen 3 (Authenticated Search Results), sorted by compatibility desc → confidence desc → distance asc.

---

## Screen 9: Account Creation Prompt

**Goal**: Convert engaged users to accounts at the right moment — after value is delivered.

**Trigger**: User attempts to favorite a dog without an account.

**Design**:
- NOT a full-page modal takeover
- Contextual sheet (slides up from bottom on mobile)
- Heading: "Save [dog name] to your favorites"
- Subheading: "Create a free account to save your matches and come back anytime."
- Email input
- Password input
- "Create Account" button
- "Maybe Later" dismiss

**After account creation**:
- The dog that triggered the prompt is automatically saved as a favorite
- User is returned to the dog they were viewing — no redirect to dashboard

---

## Screen 10: User Dashboard / Favorites

**Goal**: Let users review saved dogs and manage their profile.

**Layout**:
- Header: "Saved Dogs"
- Favorites list (same card format as authenticated search results, showing current compatibility score and labels)
- "Edit Profile" link

**Favorite card**:
- Photo
- Name
- Match label
- Confidence label
- "View Details"
- Remove favorite (swipe left on mobile, X button on desktop)

**Empty state**: "You haven't saved any dogs yet. Browse dogs to get started." with Browse CTA.

---

## Screen 11: Profile Management / Edit Profile

**Goal**: Allow users to review and update questionnaire answers.

**Current Profile Summary** (read-only view):
- Children / Cats / Dogs / Activity Level / Experience Level / Home Type

**Actions**: "Edit Profile" | "Improve Accuracy" (opens Expanded Questionnaire)

**Edit form**:
- Pre-filled with current answers
- Two-phase structure (Phase 1 and Phase 2 sections)
- "Save Changes" button
- On save: profile version increments; return to previous page (no forced redirect)

---

## Modal: Confidence Explanation

**Trigger**: User taps the confidence label on Dog Detail Page (Authenticated).

**Purpose**: Explain what confidence means and why it's labeled as it is for this specific dog.

**High Confidence example**:
> "This recommendation is based on detailed shelter information, including activity level, compatibility information, and experience requirements."

**Low Confidence example**:
> "Some important information is unavailable for this dog: cat compatibility, yard requirements. We recommend contacting the shelter before applying."

---

## Empty & Error States

| State | Treatment |
|-------|-----------|
| No search results | "No dogs found near [location]. Try expanding your search radius." |
| No strong matches | "We couldn't find strong matches using your current profile. Try adjusting your preferences." |
| RescueGroups API error | "Unable to load dogs at this time. Please try again later." |
| AI explanation unavailable | Show rule-based explanation; no error message shown to user |
| Profile not completed | Teaser badge on dog cards + gentle nudge in nav |
| No favorites | Empty state with "Browse Dogs" CTA |

---

## Accessibility Requirements

See `docs/ux/ux-spec.md` for full accessibility requirements. Summary for wireframing:

- All interactive components support keyboard navigation, visible focus states, and screen readers
- Status indicators must include text labels (never color alone)
  - Examples: "Strong Match", "Good Match", "Low Confidence"
- Confidence labels are tappable for explanation — tap target must meet minimum size requirements

---

## Wireframe Approval Criteria

The wireframe set is approved when:

- All 11 screens exist
- Mobile layouts are validated at 375px
- Compatibility hierarchy is clear on dog cards and detail page
- Confidence explanation modal is accessible
- Anonymous browsing works end-to-end without account creation
- Personalized recommendations are visible to profiled users
- Account creation prompt appears only on first favorite attempt
- Accessibility requirements are satisfied
