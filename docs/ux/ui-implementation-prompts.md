# Nuzzle UI/UX Implementation Prompts

Use this document to implement the visual styling of all 13 screens in order.
Copy each prompt block and paste it directly into Claude Code.

---

## Status

- **Phase 1 — Complete:** Design tokens (`app/globals.css`), `TopNav`, `BottomTabBar`, `NuzzleLogo` (`components/layout/`), root layout shell (`app/layout.tsx`), login/signup page cleanup.
- **Prompts 1–9 below** cover all remaining screens.

---

## Global Context (applies to every prompt)

The following is already true and does NOT need to be re-done in any prompt:

- **Tailwind v4** — no `tailwind.config.ts`. All design tokens are in `app/globals.css` as an `@theme {}` block and automatically become Tailwind utility classes.
- **Available token classes:** `bg-primary` (#20A39E teal), `bg-primary-light` (#E0F5F4), `bg-secondary-cta` (#7C3AED purple), `bg-surface` (#FFFFFF), `bg-background` (#F0F8FA), `bg-hero-bg` (#E8F4F8), `text-text-primary` (#1E293B), `text-text-secondary` (#64748B), `text-primary`, `border-border` (#E2E8F0), `bg-match-high-bg` + `text-match-high-text`, `bg-match-medium-bg` + `text-match-medium-text`, `bg-match-low-bg` + `text-match-low-text`, `text-concern` (#F97316 orange), `text-question` (#3B82F6 blue).
- **Radius token classes:** `rounded-card` (12px), `rounded-button-full` (10px), `rounded-button-inline` (8px), `rounded-badge` (6px).
- **TopNav and BottomTabBar are already in `app/layout.tsx`** and appear on every page. Do NOT add another nav or header in any page component.
- **BottomTabBar is mobile-only** (`md:hidden`). It is fixed at the bottom of the screen. The layout wrapper already adds `pb-16 md:pb-0` so page content is not hidden behind it.
- **TopNav is 64px tall** (`h-16`). Account for this when using `min-h-screen` in any page by writing `min-h-[calc(100vh-4rem)]` instead.
- **Mockup images are desktop layouts** (except Screens 6 & 7 which are already mobile). Infer clean mobile-first responsive behavior for all screens (single column, full-width elements, stacked layouts).

---

## Prompt 1 — Homepage

**Screens:** Screen 1 (Home Page)
**Files to edit:** `app/page.tsx`
**After completing:** Run `npm test` to confirm no regressions, then commit.

```
Implement the full visual design for the Nuzzle homepage (Screen 1).

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/01-mockup-homepage.png` — the visual reference (desktop layout)
- `docs/ux/visual-design-reference.md` — find the "Screen 1: Home Page" section
- `docs/ux/wireframe-spec.md` — find the "Screen 1: Home Page" section

Edit `app/page.tsx`. The root layout already provides TopNav and BottomTabBar — do not add another header. Design tokens are in `app/globals.css` (`@theme {}` block) and are available as Tailwind utility classes (e.g. `bg-primary`, `text-text-secondary`, `rounded-card`).

Implement these sections top to bottom:

1. **Hero section** (`bg-hero-bg`): Large headline "Find a dog that fits your lifestyle." (`text-text-primary`, bold, large), subheadline "Browse adoptable dogs and receive personalized compatibility matching." (`text-text-secondary`). Two CTA buttons: "Browse Dogs" → `/search` (`bg-primary text-white rounded-button-full px-6 py-3 font-semibold`), "Create Compatibility Profile" → `/questionnaire` (outlined teal or `bg-secondary-cta text-white rounded-button-full`). On desktop, show a hero dog photo on the right side. On mobile, stack headline above CTAs, hide or stack the photo below.

2. **Value proposition strip**: 3 short callout items inline ("Better Matches · Honest Insights · Fewer Returns") or as small icon cards. Keep it compact.

3. **How It Works**: 3 numbered `bg-surface rounded-card shadow-sm` cards in a row (desktop) / stacked (mobile): "Create Your Profile", "Get Match Scores", "Find Your Dog". Each has a number badge, short title, and 1-sentence description.

4. **Featured Dogs**: A static 2–3 card placeholder row using hardcoded sample dog data (name, breed, placeholder image, "View Details" link → `/search`). Use the same DogCard layout from the mockup but with static data — no API call needed here. Label the section "Featured Dogs".

5. **Footer**: Centered row of 4 text links (`text-text-secondary text-sm`): About · Contact · Privacy · Terms. Separated by `·` or a divider. `bg-surface border-t border-border` background.

Responsive rules: mobile-first. Single column for all sections. Full-width CTA buttons on mobile. Center-align hero text on mobile, left-align on desktop (md:text-left). The mockup is a desktop view — infer sensible mobile stacking.

After implementing, run `npm test` to confirm 151 tests still pass. Then commit.
```

---

## Prompt 2 — DogCard Component

**Screens:** Screens 2, 3, 5, 8, 10 (anywhere a dog card appears)
**Files to edit:** `components/DogCard.tsx`
**After completing:** Run `npm test`, then commit.

```
Style the DogCard component (`components/DogCard.tsx`). This component is used on Browse, Dog Detail, Favorites, and Match Results pages — getting it right here means all those pages inherit the correct card design.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/02-mockup-browse-anon.png` — shows the anonymous card state
- `docs/ux/mockups/03-mockup-browse-auth.png` — shows the authenticated card state with match scores
- `docs/ux/visual-design-reference.md` — find "Screen 2", "Screen 3", and the "Component Patterns" section (Match Badge, Compatibility Teaser)
- `docs/ux/wireframe-spec.md` — find "Screen 2: Search Results — Anonymous" and "Screen 3: Search Results — Authenticated"

Read `components/DogCard.tsx` first to understand its current props and structure before changing anything.

The card has two visual states based on whether `matchScore` (or similar prop) is present:

**Anonymous state (no match score):**
- `bg-surface rounded-card` card with photo on top (aspect-ratio locked, no crop distortion)
- Dog name (bold, `text-text-primary`), breed + age + distance (`text-text-secondary text-sm`)
- Compatibility teaser badge: dashed-border or muted-background pill reading "Create a profile to unlock your match score" with a lock icon
- "Get My Match" → `/questionnaire` button (`bg-secondary-cta text-white rounded-button-inline text-sm`)
- Outline heart icon (FavoriteButton, unsaved state)
- "View Details" link → dog detail page

**Authenticated state (match score present):**
- Same photo + name + breed + distance layout
- Match badge (full-width or prominent): color-coded by tier using tokens:
  - 80%+: `bg-match-high-bg text-match-high-text` — label "Strong Match"
  - 60–79%: `bg-match-medium-bg text-match-medium-text` — label "Good Match"
  - <60%: `bg-match-low-bg text-match-low-text` — label "Low Match"
- Confidence label below badge (`text-sm text-text-secondary`)
- Up to 3 match factor pills (e.g. "Good with Cats", "Apartment Friendly")
- Solid heart icon (favorited state if applicable)
- "View Details" teal link button

**Responsive:** Single column on mobile, 2-column grid when used in the Browse page (the grid is set by the parent, not the card). The card itself should be full-width within its grid cell.

After styling, run `npm test` to confirm the existing DogCard tests pass. Then commit.
```

---

## Prompt 3 — Browse Dogs + Search Filters

**Screens:** Screen 2 (Browse Anonymous), Screen 3 (Browse Authenticated), Screen 8 (Match Results)
**Files to edit:** `components/SearchFilters.tsx`, `components/SearchResults.tsx`, `app/search/page.tsx`
**After completing:** Run `npm test`, then commit.

```
Style the Browse Dogs pages and search controls. This covers three related screens that share the same route `/search`.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/02-mockup-browse-anon.png` — anonymous browse layout
- `docs/ux/mockups/03-mockup-browse-auth.png` — authenticated browse layout with match scores
- `docs/ux/mockups/08-mockup-match-results.png` — match results (same as Screen 3 with "Your Best Matches" heading)
- `docs/ux/visual-design-reference.md` — find "Screen 2", "Screen 3", "Screen 8"
- `docs/ux/wireframe-spec.md` — find "Screen 2", "Screen 3", "Screen 8"

Read `components/SearchFilters.tsx`, `components/SearchResults.tsx`, and `app/search/page.tsx` before writing any code.

**SearchFilters component (`components/SearchFilters.tsx`):**
- `bg-surface border-b border-border` sticky or static filter bar at the top of the results page
- Inputs in a horizontal row on desktop, collapsible or stacked on mobile: Zip Code (text input), Radius (dropdown: 10/25/50/100 mi), Breed (optional filter), Age group chips, Size group chips
- Input/select styling: `border border-border rounded-button-inline px-3 py-2 text-sm bg-surface`
- "Search" or filter apply button: `bg-primary text-white rounded-button-inline px-4 py-2 text-sm`

**SearchResults component (`components/SearchResults.tsx`):**
- Results count header: "247 Dogs Found" or "Best Matches For You" (auth) — `text-text-primary font-semibold text-lg`
- 2-column responsive grid: `grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6`
- Empty state: centered message with "Browse Dogs" CTA if no results
- The dog cards within are rendered by `DogCard` (already styled in Prompt 2)

**Screen 8 — Match Results header variant:**
After the questionnaire completes and the user is redirected to `/search`, the heading should read "Your Best Matches" with a subline "Profile Complete · [N] Strong Matches Found". Look at how `app/search/page.tsx` receives and passes data to determine where to conditionally show this heading. Add a `source` query param (`?source=questionnaire`) or similar to toggle between the default "Browse" heading and the "Your Best Matches" heading.

**Page layout (`app/search/page.tsx`):**
- `bg-background min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto`
- SearchFilters at top, then results heading, then SearchResults grid below

After styling, run `npm test` to confirm no regressions. Then commit.
```

---

## Prompt 4 — Dog Detail Pages

**Screens:** Screen 4 (Dog Detail Anonymous), Screen 5 (Dog Detail Authenticated)
**Files to edit:** `app/dogs/[provider]/[externalId]/page.tsx` and its client component (look inside `app/dogs/[provider]/[externalId]/` for any `*Client.tsx` file)
**After completing:** Run `npm test`, then commit.

```
Style the Dog Detail pages. This is one route that renders two different layouts depending on auth state.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/04-mockup-dog-detail-anon.png` — anonymous layout
- `docs/ux/mockups/05-mockup-dog-detail-auth.png` — authenticated layout with compatibility card
- `docs/ux/visual-design-reference.md` — find "Screen 4: Dog Detail — Anonymous" and "Screen 5: Dog Detail — Authenticated"
- `docs/ux/wireframe-spec.md` — find "Screen 4" and "Screen 5"

Read ALL files inside `app/dogs/[provider]/[externalId]/` before writing any code to understand the current data flow and component structure.

**Shared layout (both states):**
- Full-width hero dog photo (aspect-ratio locked, `object-cover`). Below it, a thumbnail strip of 3–4 smaller photos (horizontal scroll on mobile).
- Dog name (`text-2xl font-bold text-text-primary`) + heart icon (FavoriteButton) inline
- Secondary info row: breed · age · gender · shelter name · distance — all `text-text-secondary text-sm`

**Screen 4 — Anonymous:**
- Compatibility teaser card (`bg-surface rounded-card border border-border p-6`): Lock icon, heading "Compatibility Analysis Available", subtext listing "Match Score · Match Explanation · Potential Concerns · Questions to Ask the Shelter", primary CTA "Get My Compatibility Match" → `/questionnaire` (`bg-secondary-cta text-white rounded-button-full w-full py-3 font-semibold`)
- "About [Name]" section: shelter description text, `text-text-primary`
- "Visit Shelter Listing" button: outlined teal (`border-2 border-primary text-primary rounded-button-full px-6 py-3 font-semibold`)

**Screen 5 — Authenticated:**
- Compatibility card (`bg-primary/5 or bg-primary-light rounded-card border border-primary/20 p-6`):
  - Match badge: color-coded by tier (use `bg-match-high-bg text-match-high-text` etc.)
  - Match percentage (large number, bold)
  - Confidence label (`text-text-secondary text-sm`), tappable (opens explanation)
  - "Why This Dog Fits" — bulleted list with green check icons (`text-match-high-text`)
  - "Potential Concerns" — bulleted list with orange warning icons (`text-concern`); hide section if list is empty
  - AI explanation paragraph (`text-text-secondary italic`)
- "Before You Apply" section: only shown when some fields are unknown. Heading + bulleted questions using dog's name. Questions in `text-question` (blue). Collapsible on mobile (`<details>/<summary>`), always open on desktop.
- "Visit Shelter Listing" button: full-width, filled teal (`bg-primary text-white rounded-button-full w-full py-3 font-semibold`). This button click is tracked for analytics — do not remove any existing onClick handlers.

After styling, run `npm test`. Then commit.
```

---

## Prompt 5 — Questionnaire

**Screens:** Screen 6 (Quick Match Questionnaire), Screen 7 (Expanded Questionnaire)
**Files to edit:** `app/questionnaire/QuestionnaireClient.tsx`
**After completing:** Run `npm test`, then commit.

```
Style the questionnaire flow. This is a multi-step form that currently renders unstyled semantic HTML.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/06-mockup-questionnaire-1.png` — Quick Match questionnaire (mobile-optimized layout)
- `docs/ux/mockups/07-mockup-questionnaire-2.png` — Expanded questionnaire
- `docs/ux/visual-design-reference.md` — find "Screen 6: Quick Match Questionnaire" and "Screen 7: Expanded Questionnaire"
- `docs/ux/wireframe-spec.md` — find "Screen 6" and "Screen 7"

Read `app/questionnaire/QuestionnaireClient.tsx` in full before writing any code — it has many steps and sub-components.

**Page layout:** `bg-background min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-8`

**Progress indicator:** Replace the current `<p>Step N of 6</p>` text with a row of dots (not a progress bar): 6 dots, the current step's dot is filled teal (`bg-primary`), completed steps are smaller filled teal, future steps are `bg-border`. Center-aligned at top.

**Question card structure** (for each step):
- Outer card: `bg-surface rounded-card shadow-sm overflow-hidden max-w-lg w-full mx-auto`
- Card header: `bg-primary text-white px-6 py-4` — question text (`font-semibold text-lg`) + optional icon (right side, white SVG)
- Card body: `px-6 py-4` — answer options as large tap-target buttons
- Card footer: `px-6 py-4 border-t border-border flex gap-3`— Back button (outlined, `border border-border text-text-secondary`) + Continue/Next button (`bg-primary text-white rounded-button-inline px-6 py-2 font-semibold disabled:opacity-50`)

**Answer option buttons:**
- Each option is a full-width button: `border border-border rounded-button-inline px-4 py-3 text-left flex items-center gap-3 text-text-primary hover:border-primary hover:bg-primary-light transition-colors`
- Selected state: `border-primary bg-primary-light text-primary font-medium`
- For Yes/No and multiple-choice radio questions, each option is one of these buttons (replace native radio inputs)

**Post-phase-1 screen ("Your matches are ready!"):**
- `bg-surface rounded-card p-8 text-center max-w-md mx-auto`
- Heading in `text-text-primary font-bold text-2xl`
- "See My Matches" → teal full button, "Answer 8 more questions →" → outlined teal button
- Small print: `text-text-secondary text-sm`

**Botanical decoration:** Add subtle SVG botanical elements (leaves, stems) at the bottom corners of the page using `text-botanical-green` and `text-botanical-pink`. These should be `position: absolute` / `fixed`, decorative only (`aria-hidden="true"`), and not interfere with the form content.

After styling, run `npm test` to confirm the QuestionnaireClient tests pass. Then commit.
```

---

## Prompt 6 — Account Creation Modal

**Screens:** Screen 9 (Account Creation Prompt)
**Files to edit:** `components/FavoriteButton.tsx`
**After completing:** Run `npm test` (the existing `login-prompt` test must still pass), then commit.

```
Upgrade the account creation prompt in FavoriteButton from a plain text span to a proper bottom-sheet modal.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/09-mockup-modal-save-favs.png` — the full modal design
- `docs/ux/visual-design-reference.md` — find "Screen 9: Account Creation Prompt"
- `docs/ux/wireframe-spec.md` — find "Screen 9: Account Creation Prompt"
- `components/FavoriteButton.tsx` — read the full current implementation
- `__tests__/components/favorite-button.test.tsx` — read all tests before changing anything

**Critical constraint:** The existing test checks for `data-testid="login-prompt"`. This attribute MUST remain on the modal container element so the test keeps passing.

**Current behavior to preserve:**
- Anonymous user clicks heart → `showPrompt` state becomes `true` → prompt appears
- "Maybe Later" closes the prompt (`setShowPrompt(false)`)
- The prompt does NOT perform sign-in itself — it links to `/signup`

**Replace the existing `<span data-testid="login-prompt">` with this modal structure:**

When `showPrompt` is true, render:
1. **Dark overlay:** `fixed inset-0 z-50 bg-black/50` — clicking it triggers `setShowPrompt(false)`
2. **Bottom sheet:** `fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[20px] px-6 pt-6 pb-10 shadow-xl max-w-lg mx-auto` — this is the `data-testid="login-prompt"` element
   - Drag handle: `w-12 h-1 bg-border rounded-full mx-auto mb-6`
   - NuzzleLogo (import from `components/layout/NuzzleLogo`) + "Nuzzle" wordmark centered
   - Heading: "Save [dog name] to your favorites" — use the dog name from props if available, otherwise "this dog". Bold, `text-text-primary text-xl text-center mt-4`
   - Subtext: "Create a free account to save your matches and come back anytime." `text-text-secondary text-sm text-center mt-2 mb-6`
   - Email input (`border border-border rounded-button-inline px-4 py-3 w-full`) with email icon
   - Password input (same styling) with lock icon
   - "Create Account" button → links to `/signup` (`bg-primary text-white rounded-button-full w-full py-3 font-semibold mt-4`)
   - "Maybe Later" text button (`text-text-secondary text-sm text-center mt-3 w-full`) → `setShowPrompt(false)`

The email/password inputs in this modal are purely visual (no form submission logic) — the button navigates to `/signup` where Clerk handles actual account creation.

After implementing, run `npm test` — specifically verify the FavoriteButton tests still pass (login-prompt testid must be present). Then commit.
```

---

## Prompt 7 — Favorites Dashboard

**Screens:** Screen 10 (User Dashboard / Favorites)
**Files to edit:** `app/favorites/page.tsx`
**After completing:** Run `npm test`, then commit.

```
Style the Favorites dashboard page.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/10-mockup-user-dashboard.png` — the full dashboard layout
- `docs/ux/visual-design-reference.md` — find "Screen 10: User Dashboard / Favorites"
- `docs/ux/wireframe-spec.md` — find "Screen 10: User Dashboard / Favorites"
- `app/favorites/page.tsx` — read the current implementation including how favorites data is fetched

**Page layout:** `bg-background min-h-[calc(100vh-4rem)]`

**Desktop layout (md+):** Two-column: left sidebar ~240px wide, right main content fills rest. `flex gap-8 max-w-7xl mx-auto px-6 py-8`

**Left sidebar (desktop only, hidden on mobile):**
- User greeting: "Welcome back, [first name]" — pull user name from Clerk's `currentUser()` or session. `text-text-primary font-semibold text-lg mb-6`
- Navigation list with these items (current page "Saved Dogs" is active):
  - "Saved Dogs" — `text-primary font-medium` when active, `text-text-secondary` otherwise
  - "Edit Profile" → `/questionnaire`
  - "Notification Preferences" → (placeholder, no route needed yet)
- Each nav item: `flex items-center gap-2 px-3 py-2 rounded-button-inline text-sm`; active item: `bg-primary-light text-primary font-medium`

**Main content:**
- Section heading: "Saved Dogs" (`text-2xl font-bold text-text-primary mb-6`)
- Saved dog cards in a vertical list (not a grid): each card is `bg-surface rounded-card border border-border p-4 flex gap-4 mb-4`
  - Photo: `w-24 h-24 rounded-button-inline object-cover flex-shrink-0`
  - Right side: dog name (bold), breed + age + gender + size (`text-text-secondary text-sm`), shelter + distance (`text-text-secondary text-xs`), match badge (color-coded by tier), "View Details" → `/dogs/[provider]/[externalId]` (`text-primary text-sm font-medium`)
  - Remove button: `×` or trash icon, top-right of card — calls DELETE `/api/favorites/[provider]/[externalId]`
- **Empty state:** If no favorites, show centered: dog paw illustration (inline SVG or emoji placeholder), heading "You haven't saved any dogs yet", "Browse Dogs" CTA → `/search` (`bg-primary text-white rounded-button-full px-6 py-3`)

**Mobile:** Hide sidebar. Show only the main content in a single column with `px-4 py-6`.

After styling, run `npm test`. Then commit.
```

---

## Prompt 8 — Edit Profile

**Screens:** Screen 11 (Profile Management / Edit Profile)
**Files to edit:** `app/questionnaire/page.tsx`, `app/questionnaire/QuestionnaireClient.tsx`
**After completing:** Run `npm test`, then commit.

```
Implement the Edit Profile screen (Screen 11). This screen is accessed when an authenticated user who already has a profile visits `/questionnaire`.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/11-mockup-edit-profile.png` — the full edit profile layout
- `docs/ux/visual-design-reference.md` — find "Screen 11: Profile Management / Edit Profile"
- `docs/ux/wireframe-spec.md` — find "Screen 11: Profile Management / Edit Profile"
- `app/questionnaire/page.tsx` — understand how the page loads and what data it fetches
- `app/questionnaire/QuestionnaireClient.tsx` — understand the existing step/phase structure fully before modifying

The questionnaire currently always shows the creation flow. You need to add an "edit mode" that shows the read-only profile summary + edit form when the user already has a saved profile. Determine if the existing API (`/api/profile` GET) returns whether a profile exists, and use that to decide which view to show.

**Edit mode layout (two-column on desktop, stacked on mobile):**

Left sidebar — "Your Profile" read-only summary:
- `bg-surface rounded-card border border-border p-6` in a `~280px` wide column
- Heading "Your Profile" (`font-semibold text-text-primary mb-4`)
- List each current answer as a labeled row: label (`text-text-secondary text-sm`) + value (`text-text-primary font-medium`) + green checkmark icon (`text-match-high-text`)
- Fields: Home Type, Children, Cats, Other Dogs, Activity Level, Experience Level (Phase 1), then Grooming, Yard, Fence, Special Needs, Max Distance, Size Preference (Phase 2, if filled)
- "Improve Accuracy" link at bottom → triggers Phase 2 form

Right main — "Edit Your Profile" form:
- `bg-surface rounded-card border border-border p-6`
- Form pre-filled with current answers
- Divided into 3 labeled sections with a green checkmark next to each section heading when all fields in that section are complete:
  - Section 1: Quick Match fields (home type, children, cats, other dogs, activity level, experience)
  - Section 2: Additional details (grooming, yard, fence, special needs)
  - Section 3: Preferences (size, distance)
- Each field uses the same styled input/radio/select pattern as the questionnaire cards (Prompt 5)
- "Save Changes" button at bottom: `bg-primary text-white rounded-button-full w-full py-3 font-semibold`
- On save: call PATCH or PUT `/api/profile`, then show a brief "Saved!" confirmation

If the edit mode requires significant restructuring of QuestionnaireClient, prefer adding an `editMode` prop or checking a `?edit=true` query param to switch between creation flow and edit mode — do not break the existing creation flow that the questionnaire tests cover.

After implementing, run `npm test` to confirm no regressions. Then commit.
```

---

## Prompt 9 — Login & Sign Up Polish

**Screens:** Screen 12 (Login), Screen 13 (Sign Up)
**Files to edit:** `app/login/[[...login]]/page.tsx`, `app/signup/[[...signup]]/page.tsx`
**After completing:** Run `npm test`, then commit.

```
Verify and polish the Login and Sign Up pages (Screens 12 & 13). Phase 1 already handled the major cleanup (removed redundant logo headers, applied Clerk appearance tokens, centered layout). This prompt is a final visual pass.

Read these files before writing any code:
- RULES.md
- AGENTS.md
- `docs/ux/mockups/12-mockup-login.png` — login page reference
- `docs/ux/mockups/13-mockup-signup.png` — sign up page reference
- `docs/ux/visual-design-reference.md` — find "Screen 12: Login" and "Screen 13: Sign Up"
- `app/login/[[...login]]/page.tsx` — read current state
- `app/signup/[[...signup]]/page.tsx` — read current state

Current state of both pages after Phase 1:
- `bg-background` page background ✓
- Clerk component centered with `flex items-center justify-center min-h-[calc(100vh-4rem)]` ✓
- Clerk `appearance` customization: `colorPrimary: "#20A39E"`, `colorBackground: "#FFFFFF"`, `borderRadius: "12px"`, `fontFamily: "inherit"` ✓
- TopNav and BottomTabBar present via root layout ✓

Check the mockups against the current implementation and make any needed adjustments:
1. Verify the Clerk card is visually centered and has appropriate padding (`px-4 py-12`) so it doesn't crowd the TopNav on mobile
2. Verify `bg-background` (#F0F8FA) is visible around the Clerk card on the page
3. If the mockup shows any supplementary elements outside the Clerk card (e.g. a tagline or decorative element below the card), add those

No new functionality needed. The Clerk component handles all form logic, validation, and redirect behavior via the env vars (`NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/search`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/questionnaire`).

After reviewing, run `npm test`. Then commit.
```

---

## Quick Reference

| Prompt | Screen(s) | Route | Primary File(s) |
|--------|-----------|-------|-----------------|
| 1 | Screen 1 — Homepage | `/` | `app/page.tsx` |
| 2 | Screens 2, 3, 5, 8, 10 — DogCard | (shared component) | `components/DogCard.tsx` |
| 3 | Screens 2, 3, 8 — Browse + Filters | `/search` | `components/SearchFilters.tsx`, `components/SearchResults.tsx`, `app/search/page.tsx` |
| 4 | Screens 4, 5 — Dog Detail | `/dogs/[provider]/[externalId]` | `app/dogs/[provider]/[externalId]/page.tsx` + client component |
| 5 | Screens 6, 7 — Questionnaire | `/questionnaire` | `app/questionnaire/QuestionnaireClient.tsx` |
| 6 | Screen 9 — Account Creation Modal | (triggered anywhere) | `components/FavoriteButton.tsx` |
| 7 | Screen 10 — Favorites Dashboard | `/favorites` | `app/favorites/page.tsx` |
| 8 | Screen 11 — Edit Profile | `/questionnaire` (edit mode) | `app/questionnaire/page.tsx`, `QuestionnaireClient.tsx` |
| 9 | Screens 12, 13 — Login / Sign Up | `/login`, `/signup` | `app/login/.../page.tsx`, `app/signup/.../page.tsx` |
