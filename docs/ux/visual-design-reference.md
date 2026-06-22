# Visual Design Reference — Nuzzle

Status: Reference only — not a specification

This document captures the visual design system observed in the high-fidelity mockups. It is the primary reference for colors, typography, component patterns, and layout details during frontend implementation.

For interaction behavior and UX rules, see `docs/ux/ux-spec.md`.
For screen content hierarchy and layout structure, see `docs/ux/wireframe-spec.md`.

---

## Mockup Image Library

| File | Screen |
|------|--------|
| `mockups/01-mockup-homepage.png` | Screen 1 — Home Page |
| `mockups/02-mockup-browse-anon.png` | Screen 2 — Browse Dogs (Anonymous) |
| `mockups/03-mockup-browse-auth.png` | Screen 3 — Browse Dogs (Authenticated) |
| `mockups/04-mockup-dog-detail-anon.png` | Screen 4 — Dog Detail (Anonymous) |
| `mockups/05-mockup-dog-detail-auth.png` | Screen 5 — Dog Detail (Authenticated) |
| `mockups/06-mockup-questionnaire-1.png` | Screen 6 — Quick Match Questionnaire |
| `mockups/07-mockup-questionnaire-2.png` | Screen 7 — Expanded Questionnaire |
| `mockups/08-mockup-match-results.png` | Screen 8 — Match Results |
| `mockups/09-mockup-modal-save-favs.png` | Screen 9 — Account Creation Prompt |
| `mockups/10-mockup-user-dashboard.png` | Screen 10 — User Dashboard / Favorites |
| `mockups/11-mockup-edit-profile.png` | Screen 11 — Edit Profile |
| `mockups/12-mockup-login.png` | Screen 12 — Login |
| `mockups/13-mockup-signup.png` | Screen 13 — Sign Up |

Filenames are prefixed with the screen number from `docs/ux/wireframe-spec.md` for easy cross-reference.

---

## Design Direction

Nuzzle's visual design is **warm, approachable, and nature-connected** — designed to feel like a thoughtful adoption advisor rather than an e-commerce listing site.

Key characteristics:
- **Teal primary palette** — the brand color used for the logo, navigation, interactive elements, and primary actions
- **Botanical illustration theme** — decorative illustrated plants and flowers (soft pink and green) appear in page corners and between content sections to create a welcoming, organic feel
- **Card-based layouts** — content organized into clearly defined cards with rounded corners and subtle shadows
- **Mobile-first** — layouts designed at 375px with responsive expansion to two-column grids on larger viewports
- **High trust, low clutter** — ample whitespace; critical compatibility information is always visible without excessive scrolling

---

## Design Tokens (Observed)

Values are inferred from mockup analysis. Confirm exact hex values against rendered mockups before finalizing implementation.

### Colors

| Token | Approximate Value | Usage |
|-------|-----------------|-------|
| `primary` | Teal `#20A39E` | Logo, nav icons, primary buttons, active states, card header backgrounds |
| `primary-light` | Light teal `#E0F5F4` | Hover states, selected option backgrounds |
| `secondary-cta` | Purple `#7C3AED` | "Get My Compatibility Match" button (anonymous CTA only) |
| `surface` | White `#FFFFFF` | Card backgrounds, modal backgrounds |
| `background` | Light blue-white `#F0F8FA` | Page backgrounds, content area fills |
| `hero-background` | Pale cyan `#E8F4F8` | Hero section background on homepage |
| `text-primary` | Dark navy `#1E293B` | Headlines, dog names, primary labels |
| `text-secondary` | Medium gray `#64748B` | Breed, shelter name, distance, supporting text |
| `border` | Light gray `#E2E8F0` | Card borders, input borders, dividers |
| `match-high-bg` | Teal-green (bright) | High match score badge backgrounds (80%+) |
| `match-high-text` | Dark green | High match label and percentage text |
| `match-medium-bg` | Amber/orange | Medium match badge backgrounds (60–79%) |
| `match-medium-text` | Dark amber | Medium match label text |
| `match-low-bg` | Pink/coral | Low match badge backgrounds (<60%) |
| `match-low-text` | Dark red | Low match label text |
| `concern-indicator` | Orange `#F97316` | Potential concern bullet/icon color |
| `question-indicator` | Blue `#3B82F6` | Shelter question bullet/icon color |
| `botanical-pink` | Soft pink | Decorative floral illustration color |
| `botanical-green` | Soft green | Decorative leaf illustration color |

### Typography

- **Page headline** ("Find a dog that fits your lifestyle."): Bold, large, tight line-height
- **Dog name (card + detail)**: Semibold, ~18px
- **Breed/age/distance (secondary info)**: Regular, ~13px, `text-secondary` color
- **Match label** ("Strong Match", "Good Match"): Bold, ~15px, displayed inside colored badge
- **Match percentage** ("91%"): Bold, ~22px, displayed inside badge alongside match label
- **Section headers** ("Why This Dog Fits", "Before You Apply"): Semibold, ~14–16px
- **Match factors / list items**: Regular, ~14px
- **Questionnaire question text**: Bold, ~18–20px
- **Questionnaire card header** (teal background): Medium-bold, white, ~15px
- **Button text**: Semibold, sentence case
- **Body / description text**: Regular, ~15px, `text-primary`

### Spacing and Shape

| Element | Value |
|---------|-------|
| Card border radius | ~12px |
| Button border radius | ~10px (full-width) / ~8px (inline) |
| Match badge border radius | ~6px (pill-adjacent, not fully rounded) |
| Questionnaire answer card border radius | ~10px |
| Card padding | ~16px |
| Match badge padding | ~8px 12px |
| Section spacing | ~24px between major sections |

---

## Screen 1: Home Page

![Home Page](mockups/01-mockup-homepage.png)

### Header / Navigation
- Nuzzle logo image (`public/images/logo.png` — heart + paw + botanical accents) left-aligned, "Nuzzle" wordmark beside it
- Right-aligned nav: "Browse Dogs" text link + "Log In" solid teal pill button
- Navigation is minimal and unobtrusive — hero content dominates

### Hero Section
- Light cyan background (`hero-background`)
- Left side: Large headline, subheadline, two CTA buttons stacked
  - **Primary CTA**: Solid teal filled button with paw icon — "Browse Dogs"
  - **Secondary CTA**: Outlined teal button — "Create Compatibility Profile"
- Right side: Photograph of a golden retriever (hero image, natural/warm)
- Decorative botanical illustrations (pink and green) at left and right edges

### "How It Works" Section
- Three-column layout with numbered circles (1, 2, 3)
- Each column: numbered icon, short bold title, one-line description
  1. Better Matches
  2. Honest Insights
  3. Fewer Returns

### Featured Dogs Section
- Heading "Featured Dogs" + "View All →" link to `/search`
- **8 real, adoptable dogs drawn nationwide** (live RescueGroups data), shown in a horizontal scrollable row. Each card shows:
  - Dog photo (`DogImage`, face never cropped)
  - Dog name bold
  - Breed · age in secondary text
  - "View Details" link → that dog's real detail page
  - (No compatibility percentage — the homepage is anonymous/marketing context.)
- **Functional carousel arrows** (`< >`) flank the row and scroll it left/right (`FeaturedCarousel` client wrapper owns the scroll ref).
- **Rotation + caching:** the featured set rotates every ~5 hours. A time-window seed (`featuredWindowSeed`) both varies which page is fetched and shuffles the picks (`pickFeatured`). The nationwide pool is cached at the **data layer** in `getFeaturedPool` (`unstable_cache`, `revalidate 18000`, seed-keyed cache key), so the RescueGroups call runs **at most once per 5-hour window regardless of render mode** (the RG search is a POST, which Next's fetch cache won't cache). The homepage also sets `revalidate = 18000` as a complementary full-route cache. The same 8 dogs are shown to everyone within a window.

### Profile Prompt Banner
- Teal background banner below featured dogs
- Text: "Complete your profile to unlock full match scores and personalized insights"
- Teal button with arrow: "Create Your Profile"

### Footer
- Nuzzle logo + tagline on left
- Navigation links: About · Contact · Privacy · Terms
- Social media icons on right

---

## Screen 2: Browse Dogs — Anonymous

![Browse Dogs — Anonymous](mockups/02-mockup-browse-anon.png)

### Layout
- Header with Nuzzle logo and navigation
- **Two-column card grid** on larger viewports (responsive to single-column on narrow mobile)
- Botanical illustrations in bottom corners (decorative)

### Dog Cards (Anonymous)
Each card shows:
- Large dog photo — **links to the dog's detail page** (in addition to "View Details"; the heart chip sits above the link and still toggles favorites)
- Dog name (bold)
- Breed + age + size descriptor (e.g., "Golden Retriever • Adult • 2 yrs")
- Location icon + distance (e.g., "18 miles away")
- **Compatibility percentage in a visible badge** (e.g., "96%", "89%")
- "Get Match Score" CTA button (purple `secondary-cta`, prominent)
- Heart icon (outline — not authenticated, cannot save)

### Sorting / Filtering
- Sort and filter controls visible at top
- Anonymous default sort: Distance
- Profiled sort: best match by default; **setting a ZIP switches to nearest-first** (distance), with match scores still shown

---

## Screen 3: Browse Dogs — Authenticated

![Browse Dogs — Authenticated](mockups/03-mockup-browse-auth.png)

### Header
- User profile avatar (circular) appears in top-right nav — indicates authenticated state
- "Browse Dogs" label with icon

### Dog Cards (Authenticated)
Each card shows:
- Dog photo
- Dog name with heart icon (solid — can save to favorites)
- Breed, age, size, distance
- **Match score badge** (color-coded by tier):
  - 80%+: Teal/green badge
  - 60–79%: Orange/amber badge
  - <60%: Pink/coral badge
- Confidence label (text)
- Primary teal CTA button

### Layout
- Same two-column grid as anonymous browse
- Botanical corner illustrations persist

---

## Screen 4: Dog Detail — Anonymous

![Dog Detail — Anonymous](mockups/04-mockup-dog-detail-anon.png)

### Header
- "< Back to results" link top-left
- Logo and nav top-right (Browse Dogs, Log In)

### Photo Section
- Large hero image of the dog (dominant, high quality). Like all dog images, it uses the `DogImage` treatment — `object-contain` over a blurred backdrop of the same photo so the **whole dog/face is always visible (never cropped)**.
- Thumbnail gallery stacked vertically on the right (up to 4 thumbnails). **Interactive**: clicking a thumbnail makes it the hero (active thumbnail highlighted with a teal ring).
- When a dog has **more than 4 photos**, the 4th thumbnail becomes a **"View all (+N)"** button that opens a **lightbox/carousel** modal — full-screen dark overlay, `object-contain` image, Prev/Next, a "current / total" counter, and a close button; dismissed via the X, click-outside, or Escape (← / → navigate).

### Dog Info
- Dog name (large bold) with heart icon outline (unauthenticated — cannot save)
- Breed + age + gender (e.g., "German Shepherd • Adult • 3 yrs • Female")
- Shelter name with location pin icon
- Distance (e.g., "18 miles away")

### Compatibility Teaser Card (Anonymous)
- "Compatibility Analysis Available" header with lock icon
- "Create your profile to see:" with checklist:
  - Match Score
  - Match Explanation
  - Potential Concerns
  - Questions to Ask the Shelter
- **Primary CTA**: Full-width purple (`secondary-cta`) button — "Get My Compatibility Match"

### About Section
- "About [Dog Name]" heading
- Shelter-provided description paragraph

### Shelter Box
- Shelter name and info
- "Visit Shelter Listing" button (outlined teal)

### Botanical Elements
- Decorative green and pink plant illustration in bottom-right corner

---

## Screen 5: Dog Detail — Authenticated

![Dog Detail — Authenticated](mockups/05-mockup-dog-detail-auth.png)

### Header
- Same back navigation
- User avatar in top-right (authenticated)

### Dog Info
- Same as anonymous layout
- Heart icon is filled/solid (can save favorites)

### Compatibility Card (Unlocked)
- **"EXCELLENT MATCH"** badge (or equivalent match label in teal/green)
- Large match percentage: "96%"
- Three-column content breakdown:
  1. **"Why This Dog Fits"** — bulleted list with green check icons (positive compatibility factors)
  2. **"Potential Concerns"** — bulleted list with orange warning icons
  3. Match detail with icons and descriptions

### AI Insight Section
- "AI Insight" header
- Detailed paragraph about personality and compatibility
- Separate from the structured breakdown

### Expandable "Before You Apply" Section
- Collapsible section header with chevron/arrow indicator
- "We recommend asking the shelter:"
- Bulleted dog-specific questions (uses dog's name)

### Shelter Information
- "Visit Shelter Listing" button (teal, full-width)
- Shelter hours, distance, contact details

---

## Screen 6: Quick Match Questionnaire

![Quick Match Questionnaire](mockups/06-mockup-questionnaire-1.png)

### Overall Layout
- Progress indicator: Dots (not a bar) showing step position — filled dot = current/completed, outlined = remaining
- Nuzzle logo centered in header
- Multiple question cards visible simultaneously (horizontal scroll or multi-card overview on wider screens)

### Question Card Structure
Each card follows an identical visual pattern:
- **Teal header block** (with question icon + question text in white)
- **White body** with interactive answer options (radio buttons, checkboxes)
- **Teal footer** with "Next" button

### Questions Shown (Screen 6)
1. "What's your main lifestyle?" — Apartment / House / Other (with icons)
2. "Are there children in your home?" — Yes / No
3. "Do you have any pets?" — Yes / No / pet type checkboxes
4. "What's your household activity level?" — Low / Moderate / High (with descriptions)

### Design Details
- Large, clear answer options with icons
- Selected state: Teal highlight / filled radio
- Unselected state: Light gray border, empty radio
- Botanical decorative elements at bottom of page

---

## Screen 7: Expanded Questionnaire

![Expanded Questionnaire](mockups/07-mockup-questionnaire-2.png)

### Layout
- Same card structure and progress dot indicator as Screen 6
- Multiple question cards visible showing the optional improvement phase
- "Why more questions matter?" informational card integrated
- "Your information is secure" privacy reassurance card

### Questions Shown (Screen 7)
1. "What's your grooming preference?" — Low / Medium / High maintenance (with icons)
2. "Do you have a yard?" — Yes / No
3. "Are you open to a dog with unknown history?" — Yes / No / Maybe
4. "Are you new to dog ownership?" — Yes / No
5. "What's your preferred dog size/weight?" — Small / Medium / Large / X-Large (with icons)

### Preview Card
- At end of questionnaire: small preview card "Your matches" with sample dog photos
- "View Matches" CTA button

---

## Screen 8: Match Results

![Match Results](mockups/08-mockup-match-results.png)

Match Results (Screen 8) shares the same visual layout as Browse Dogs — Authenticated (Screen 3): a two-column card grid with color-coded match badges, confidence labels, and teal CTA buttons. The distinction is context — results are filtered and ranked by the user's compatibility profile rather than a general browse. Refer to the Screen 3 component patterns for implementation.

---

## Screen 9: Account Creation Prompt (Save Favorites Modal)

![Account Creation Prompt](mockups/09-mockup-modal-save-favs.png)

### Presentation
- **Bottom-sheet style on mobile** — slides up from bottom, does not cover full screen
- Dog detail page visible behind with dark semi-transparent overlay
- Rounded top corners on modal card

### Modal Header
- Nuzzle logo image centered

### Content
- Heading: "Save [Dog Name] to your favorites"
- Subheading: "Create a free account to save your matches and come back anytime."
- **No inline form fields.** Account creation happens on `/signup` (Clerk owns it), so the modal does not show email/password inputs — it routes the user there.

### Actions
- **Primary**: Full-width solid teal button — "Create Account" → `/signup`
- **Secondary**: "Maybe Later" text link (smaller, gray, dismisses modal)

### Notes
- Optimized for mobile thumb reach (bottom-anchored)
- Full-width button for easy tap interaction

---

## Screen 10: User Dashboard / Favorites

![User Dashboard / Favorites](mockups/10-mockup-user-dashboard.png)

### Layout (Two-Panel)
- **Left sidebar** (`DashboardSidebar`, desktop only, hidden on mobile): greeting + navigation menu, **sticky** so the links stay in view while the main column scrolls
  - Greeting text: "Welcome back, [first name]" (from Clerk)
  - Menu: Saved Dogs (active), Edit Profile → `/questionnaire`, Notification Preferences (placeholder)
  - **Decorative samoyed art** (`/images/sidenav-samoyed.png`, rounded) anchored at the **bottom** of the sticky sidebar
- **Main content area**: dashboard header + matches banner + count/sort row + saved dogs list
  - **Header row**: "Saved Dogs" heading (filled heart) + subtitle ("Your favorite dogs and their compatibility matches.") + status line ("✓ Profile: Complete · Last updated: Today"); an outlined **"Edit Profile"** button sits at the top-right (in addition to the sidebar link).
  - **Matches banner** (shown when a profile exists): award/ribbon icon + "We're finding great matches for you!" + supporting line + a "Learn how matches work" link.
  - **Count + Sort row**: "{N} Saved Dogs" on the left; a **"Sort by"** control on the right (Best Match default / Recently Saved), backed by a `?sort=` query param.
- **Footer line**: "🔒 Your data is private and never shared."

### Saved Dogs List
Horizontal-layout cards (stacked vertically), each showing:
- Square thumbnail photo (left) — **links to the dog's detail page** (in addition to "View Details")
- Dog name with filled heart icon
- Breed, age, gender, size
- Shelter name with location icon + distance
- **Trait chips** (up to 3, derived from the dog's normalized traits — e.g., "Moderate Energy", "Good with Cats", "Good with Dogs", "Family Friendly")
- **2-line description preview** (clamped)
- Match score badge (color-coded by tier, e.g., "96% MATCH") + confidence label ("{High/Medium/Low} Confidence")
- "View Details" button (teal)
- **× remove button** (top-right) — deletes the favorite (`DELETE /api/favorites/[provider]/[externalId]`) and refreshes the list; shows a **"Remove from favorites" tooltip** on hover (`aria-label` kept for screen readers)

### Match Score Colors in Dashboard
Use the canonical app-wide 3-tier system (see "Component Patterns → Match Badge") — the same thresholds as the search cards and detail page; the dashboard does not define its own scheme:
- **High (≥80%)**: teal/green (`match-high`)
- **Medium (60–79%)**: amber/orange (`match-medium`)
- **Low (<60%)**: pink/coral (`match-low`)

### Empty State
- Friendly illustration of a dog
- "You haven't saved any dogs yet"
- "Browse Dogs" teal button

### Footer Navigation
- Bottom tab bar with Home / Browse / Saved / Profile sections
- Active section highlighted in teal

---

## Screen 11: Edit Profile

![Edit Profile](mockups/11-mockup-edit-profile.png)

**Entry**: edit mode is shown when an **authenticated user who already has a profile** visits `/questionnaire` (detected server-side). Anonymous / no-profile users get the creation questionnaire instead.

### Layout
- **Left sidebar** (desktop only): the **same `DashboardSidebar` as Screen 10** (greeting + nav), with **"Edit Profile" active**.
- **Main content**: a **two-view flow** (not two side-by-side panels) — a read-only "Your Profile" summary that switches to an "Edit Your Profile" form.

### View 1 — "Your Profile" summary
- "‹ Back to Saved Dogs" link
- Status card: green check + "Profile Complete" + "Last updated: {date} · Version {n}" (with a small flowers accent)
- "Current Profile Summary": each answer as a labeled row (icon + label + value, with an Activity/Experience sub-description) and a green checkmark
- Tip banner: "The more we know, the better the match. Answer a few more questions…"
- "What would you like to do?": two action cards — **Edit Profile** (→ form) and **Improve Accuracy** (→ form, scrolled to Phase 2)
- Bottom banner: "You can update your profile anytime."

### View 2 — "Edit Your Profile" form
- "‹ Cancel" link; "Edit Your Profile" heading
- A **"Your Name"** section at the top (editable First/Last name → stored on the User, shown in the sidebar greeting)
- 2-step indicator (① Phase 1 · Quick Match (6) —— ② Additional (8))
- **Section "Phase 1: Quick Match"** and **Section "Phase 2: Additional Details (Optional)"**, each with a green checkmark when all its fields are complete
- Phase 2 controls (`<select>` unless noted): grooming commitment, **Yard (Fenced / Unfenced / No yard — one question)**, special needs (Yes / No / Maybe), **Age preference**, **Sex preference**, size, **hours alone**, and a **distance slider that snaps to 5/10/25/50/100 mi with a live readout**. Phase 1 uses a **segmented control** for Activity Level and **radio buttons** for Experience Level.
- Confirmation banner: "Your profile will be updated to Version {n+1} · Your matches may update based on your changes."

### Actions
- "Save Changes" (teal, full-width) → `PUT /api/profile` (increments `profileVersion`) → brief "Saved!" confirmation, returns to the summary view (no forced redirect)
- "Cancel" (outlined) → back to the summary view

### Footer Navigation
- Bottom nav bar with Profile tab active (teal highlight)

---

## Screen 12: Login

![Login](mockups/12-mockup-login.png)

### Shell Layout
- **Full-bleed background image**: `public/images/login-bg.png` (a meadow scene with dogs and flowers) covers the content area via `next/image` `fill object-cover`; `#F0F8FA` is the fallback color
- A **centered header above the card**: Nuzzle logo (paw-heart + wordmark) + tagline "Better matches. Happier tails."
- Clerk `<SignIn />` component centered below the header, with a `shadow-xl` card so it lifts off the photo
- TopNav and BottomTabBar remain present (so the TopNav logo also shows at the top-left)

### Clerk Component Appearance
Customized via the `appearance` prop:
```typescript
{
  variables: {
    colorPrimary: "#20A39E",
    colorBackground: "#FFFFFF",
    borderRadius: "12px",
    fontFamily: "inherit",
  },
}
```
- Primary button, links, and focus rings use teal `#20A39E`
- Card background is white on the `#F0F8FA` page
- Border radius matches the app-wide `~12px` card style
- Font inherits Geist Sans from the root layout

### Responsive
- Desktop: form card `~400px` max-width, centered
- Mobile: card fills width with `16px` horizontal page padding; Clerk's component is responsive by default

### Notes
- The auth screens use the full-bleed `login-bg.png` photo background + the centered logo/tagline header (above) — they are the most illustrative screens in the app
- TopNav and BottomTabBar are visible on this page, same as all other screens

---

## Screen 13: Sign Up

![Sign Up](mockups/13-mockup-signup.png)

### Shell Layout
Same as Screen 12: full-bleed `login-bg.png` background, centered Nuzzle logo + "Better matches. Happier tails." tagline above the Clerk card.

Clerk `<SignUp />` component replaces `<SignIn />`.

### Post-Signup Redirect
Users are sent to `/questionnaire` immediately after account creation, so they can build their compatibility profile before browsing.

### Notes
- This is the deliberate signup path for users who click in from the nav. The contextual signup path (Screen 9 modal) is used when a user tries to favorite a dog while anonymous — those two flows are independent and both remain in the design.
- The Clerk component includes a built-in "Already have an account? Log in" link that routes to `/login`.

---

## Component Patterns

### Match Badge (Search Cards, Detail Page, Dashboard)

```
┌────────────────────────┐
│  Strong Match    91%   │  ← color-coded background by tier
└────────────────────────┘
  High Confidence         ← text label, matching tier color
```

Tiers:
- High (80%+): Teal/green background
- Medium (60–79%): Amber/orange background
- Low (<60%): Pink/coral background

Confidence always rendered as text label ("High Confidence", "Medium Confidence", "Low Confidence") — never a raw number.

### Compatibility Teaser (Anonymous Cards + Detail)

```
┌ - - - - - - - - - - - - - - - - ┐
│  🔒 Compatibility Analysis Available    │
│  Create your profile to see:      │
│  ✓ Match Score                    │
│  ✓ Compatibility Explanation      │
│  ✓ Potential Concerns             │
│  ✓ Questions to Ask the Shelter   │
│  [ Get My Compatibility Match ]   │  ← purple filled button
└ - - - - - - - - - - - - - - - - ┘
```

### Questionnaire Answer Card

```
┌──────────────────────────────────────┐  ← teal header
│  [icon]  Question text               │
├──────────────────────────────────────┤  ← white body
│  ○ Option A                          │
│  ○ Option B                          │
│  ● Option C  (selected — teal)       │
├──────────────────────────────────────┤  ← teal footer
│          [ Next ]                    │
└──────────────────────────────────────┘
```

### Primary Button
- Solid teal fill (`primary`)
- White text, semibold
- ~10px border radius
- Full-width on mobile

### Secondary Button (Outlined)
- Teal border, teal text, transparent fill
- Used for secondary page actions (e.g., "Visit Shelter Listing" on anonymous detail page)

### Anonymous CTA Button (Compatibility)
- Solid purple fill (`secondary-cta`)
- White text
- Used exclusively for "Get My Compatibility Match" call-to-action

### Dog Photo Cards
- Square or near-square photo
- Rounded corners (~12px)
- Subtle drop shadow
- Match score badge overlaid top-right (on browse grid) or shown below (on list view)
- **Image treatment (`DogImage`)**: every dog photo shows the **whole image** (`object-contain`) over a **blurred, zoomed copy of the same photo** as the backdrop. The frame stays full but the dog's face is **never cropped**. Used on browse/match cards, featured cards, favorites, and the detail hero/thumbnails.

### Active Filter Chips (Search / Matches)
- When breed/age/size/location filters are applied, each appears as a small teal chip (`bg-primary-light text-primary`, `rounded-badge`) with an ✕ to remove just that filter, plus a "Clear all filters" text button.
- Sits between the filter bar and the results. Removing a chip or clearing re-runs the search and returns the user to their overall list (a profiled user's full compatibility-ranked matches; an anonymous user's nationwide list).

### Loading Skeletons (dog lists)
- While dog cards load, the UI shows animated placeholder cards (`DogCardSkeleton` — `animate-pulse`, mirrors the DogCard photo + text shell) instead of a blank area or a plain "Loading…" line.
- `DogCardSkeletonGrid` renders these in the same responsive grid as results (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) and carries a screen-reader loading status (`role="status"`, accessible name "Loading dogs"). Individual skeletons are `aria-hidden`.
- Used on **Search / Matches** (in-page loading state) and as route-level loaders on **Favorites** (`favorites/loading.tsx`, dashboard shell) and **Dog Detail** (`loading.tsx`, hero + info + compatibility shell).

### Favorite Heart (`FavoriteButton`)
- A lucide `Heart` icon — `size 22` on dog cards (in a `w-10 h-10` chip), `size 26` next to the name on the Dog Detail page.
- **Unfavorited:** outline heart (`fill="none"`, stroke inherits `currentColor` — teal in the card chip).
- **Favorited:** **filled red** (`#EF4444`) and stays red as the persistent favorited state, paired with `aria-pressed` (never color-only — Rule 13).
- Clicking to favorite plays a brief **pop** animation (`animate-heart-pop`, scale 1 → 1.35 → 1), disabled under `prefers-reduced-motion`.
- Anonymous click still opens the Screen 9 account-creation sheet (`login-prompt`) and performs no fetch.

---

## Motion & Interaction

Subtle motion makes the app feel responsive and alive. **All motion is gated behind `prefers-reduced-motion`** — users who opt out get no transforms/transitions (Rule 13). Utilities live in `app/globals.css`.

### Hover micro-interactions (site-wide)
- **`.hover-press`** — buttons & links: a small lift (`translateY(-1px)`) + soft shadow on hover, and a press (`scale(.98)`) on `:active`. Applied to primary CTAs across the app (hero CTAs, Get My Match / View Details, Log In, Create Account, search submit, pagination, Edit Profile, Browse Dogs, etc.).
- **`.hover-lift`** — cards: a larger lift (`translateY(-3px)`) + shadow on hover. Applied to the dog cards (browse/match), featured cards, and saved-dog cards.
- Both are additive to existing `hover:opacity`/`hover:bg` styles; they don't change behavior.

### Scroll reveals (homepage)
- The `Reveal` component (`components/Reveal.tsx`, IntersectionObserver) wraps each homepage section (value props, how it works, featured dogs, profile banner). Sections **fade + slide in when scrolled into view and fade back out when scrolled away** — both directions, since the observer fires on enter and exit. Classes: `.reveal` (hidden) / `.reveal-in` (shown).
- Degrades gracefully: under `prefers-reduced-motion`, or where IntersectionObserver is unavailable, content shows immediately.

### Hero parallax (homepage)
- The homepage hero background image drifts subtly as the page scrolls (`.hero-parallax`, CSS scroll-driven `animation-timeline: scroll()`). Progressive enhancement — browsers without scroll-driven-animation support render it static; disabled under reduced motion. A baseline `scale(1.08)` keeps the frame covered through the drift.

### Page fade-in (all routes)
- Page content fades + slides in on arrival (`.page-fade`). A `PageTransition` client wrapper in the root layout is keyed by `usePathname()`, so the fade replays on every client-side navigation (not just hard loads). Scroll reveals and parallax remain homepage-only; this gentle fade applies everywhere. Disabled under reduced motion.

---

## Botanical Design Theme

Illustrated botanical elements appear throughout the UI as decorative accents. They are purely decorative and must not interfere with interactive content.

**Usage locations:**
- Homepage: Left and right edges of hero section; bottom of page between sections
- Browse pages: Bottom-left and bottom-right corners
- Dog detail page: Bottom-right corner of page
- Questionnaire: Between question cards; at bottom of page

**Illustration style:**
- Hand-drawn / illustrated appearance (not photographic)
- Color palette: Soft pink (#FFB3C6 range) and soft green (#A8D5A2 range)
- Mix of leaves, flowers, and stems
- Used at different scales (large corner accents vs. small inline dividers)

**Implementation note:** These are decorative `<img>` or CSS background images — they must have `aria-hidden="true"` and empty alt text to remain invisible to screen readers.

---

## Navigation

### Bottom Tab Bar (Mobile)

| Tab | Anonymous | Authenticated |
|-----|-----------|--------------|
| Home (house icon) | Visible | Visible |
| Search (magnifier icon) | Visible | Visible |
| Favorites (heart icon) | Triggers account creation prompt | Visible — opens Dashboard |
| Profile (person icon) | Triggers account creation prompt | Visible — opens Edit Profile |

Active tab: Teal fill on icon. Inactive tabs: Gray outline icon.

### Top Nav

| Element | Anonymous | Authenticated |
|---------|-----------|--------------|
| Nuzzle logo image (`public/images/logo.png`) | Visible | Visible |
| "Home" link (→ `/`) | Visible | Visible |
| "Browse Dogs" link (→ `/search`) | Visible | Visible |
| "Dashboard" link (→ `/favorites`) | Hidden | Visible |
| "Log In" pill button (teal) | Visible | Hidden |
| User avatar (circular) | Hidden | Visible — top right |

Desktop links (`md+`) highlight the active route (teal) via `usePathname()`; on mobile the `BottomTabBar` provides Home / Browse / Favorites / Profile.

---

## Responsive / Mobile-First Guidance

The mockups for Screens 1–5, 9–11 represent **desktop layouts** (~1200–1440px). Screens 6–7 (questionnaire) are already mobile-optimized. All screens must be responsive per RULES.md Rule 12 (mobile-first, 375px baseline). Infer mobile behavior from the desktop mockups as follows:

### Screen 1 — Homepage
- **Hero**: Desktop splits headline/CTAs (left) + dog photo (right). Mobile: Stack vertically — headline → CTAs → dog photo below; photo becomes full-width below the buttons.
- **How It Works**: Desktop 3-column row. Mobile: Stack into a single column (1, 2, 3 vertically).
- **Featured Dogs**: Desktop horizontal carousel with working `< >` arrows. Mobile: horizontal scroll/swipe (arrows still present).
- **Profile Prompt Banner**: Full-width at all breakpoints.

### Screen 2 — Browse Anonymous
- **Dog cards**: Desktop 2-column grid. Mobile (375px): Single-column, full-width cards stacked vertically. Tablet (~768px): 2-column grid.
- **Filter controls**: Desktop inline row. Mobile: Collapsed behind a "Filters" button that opens a bottom sheet.
- **Botanical illustrations**: Desktop corners. Mobile: Hide or reduce to a single small accent to preserve content space.

### Screen 3 — Browse Authenticated
- Same responsive rules as Screen 2.
- Match badges must remain fully readable at single-column width; score + label on the same row or stacked (label above, percentage large below).

### Screen 4 — Dog Detail Anonymous
- **Photo + thumbnail gallery**: Desktop shows large photo with thumbnail column on right. Mobile: Full-width hero photo; thumbnail strip becomes a horizontal scroll row below the main photo; dots indicator replaces thumbnails on narrow screens.
- **Info panel**: Stacks naturally to single column on mobile.
- **Compatibility teaser**: Full-width at all sizes.

### Screen 5 — Dog Detail Authenticated
- Same photo collapse as Screen 4.
- **Compatibility card breakdown**: Desktop shows a 3-column layout ("Why This Dog Fits" / "Potential Concerns" / match details). Mobile: Stack all three into a single column, each section as a labeled block.
- **"Before You Apply"**: Collapsible on mobile (open by default), always expanded on desktop.

### Screen 8 — Match Results
- Same responsive rules as Screen 3 (Browse Authenticated) — identical layout.

### Screen 9 — Account Creation Prompt
- Designed as a **bottom sheet / slide-up modal on mobile** (already inferred as mobile-native from the mockup). Desktop: Centered modal overlay, ~480px max-width card.

### Screen 10 — User Dashboard / Favorites
- **Sidebar + main content**: Desktop shows left sidebar (~280px) + main content area. Mobile: Sidebar collapses — navigation becomes a horizontal tab row at top (Saved Dogs | Edit Profile | Settings) or uses the bottom tab bar exclusively.
- **Saved dog cards**: Desktop horizontal layout (photo left, info right). Mobile: Same layout works at single column — photo stays left at ~80px, info text wraps.

### Screen 11 — Edit Profile
- **Two-column layout**: Desktop shows profile summary sidebar (left) + edit form (right). Mobile: Stack vertically — summary panel collapses to a compact banner or accordions above the form.
- Form fields: All inputs naturally go full-width on mobile.

### General Responsive Rules
- Base breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop)
- Botanical corner illustrations: Visible on tablet+, hidden or heavily reduced on mobile to avoid crowding content
- Bottom tab bar: Visible only on mobile (<768px); desktop uses top nav only
- All touch targets: Minimum 44×44px on mobile
- No horizontal scroll on any content at 375px

---

## Notes and Constraints

### App Name
The correct app name is **Nuzzle**. Any UI text or image assets reading "PawMatch" are remnants from an earlier design iteration and must not be used in implementation.

### "Share with Family" Button
A "Share with Family" button appeared in earlier mockups. It is **not specified** in `ux-spec.md`, `wireframe-spec.md`, or `database-api-contract.md`. Do not implement this feature until a story is added to `docs/stories/development-story-pack.md`.

### Questionnaire Question Order
`docs/ux/ux-spec.md` is the source of truth for questionnaire question order (Home Type first, per RULES.md Rule 2). If any mockup image shows a different ordering, the spec takes precedence.

### PII in eventData
No analytics events should include personal information. The `track()` utility in `lib/analytics/track.ts` enforces this at the API level.

---

## References

Read alongside this document:
- `docs/ux/ux-spec.md` — interaction rules, user flows, UX principles (source of truth for behavior)
- `docs/ux/wireframe-spec.md` — screen-by-screen content hierarchy and layout structure
- `docs/ux/wireframe-layouts.md` — detailed ASCII wireframe layouts
