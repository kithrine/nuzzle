# Wireframe Layouts — Nuzzle

Version: 1.0
Status: Reference layouts for implementation

These are mobile-first text wireframes. Desktop expands to multi-column where noted.
These are architectural blueprints for UI implementation — not visual designs.

These layouts validate:
- Information hierarchy
- Layout structure
- Screen flow
- Content density

---

## Screen 1: Home Page

```
┌─────────────────────────────────────┐
│  🐾 Nuzzle          [Login]         │
├─────────────────────────────────────┤
│                                     │
│   Find a dog that fits              │
│   your lifestyle.                   │
│                                     │
│   Browse adoptable dogs and         │
│   receive personalized              │
│   compatibility matching.           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Browse Dogs          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Take Compatibility Profile]       │
│                                     │
├─────────────────────────────────────┤
│  Better     Honest      Fewer       │
│  Matches    Insights    Returns     │
├─────────────────────────────────────┤
│                                     │
│  HOW IT WORKS                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  1. Create Profile          │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  2. Get Match Scores        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  3. Find Your Dog           │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  FEATURED DOGS                      │
│                                     │
│  [Sample dog card - Charlie]        │
│  🟢 Strong Match  91%               │
│  ✓ High Confidence                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         PHOTO               │   │
│  │                             │   │
│  │  Charlie                    │   │
│  │  Young Labrador Mix         │   │
│  │                             │   │
│  │  [ View Details ]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         PHOTO               │   │
│  │                             │   │
│  │  Bella                      │   │
│  │  Adult Shepherd Mix         │   │
│  │                             │   │
│  │  [ View Details ]           │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  About · Contact · Privacy · Terms  │
└─────────────────────────────────────┘
```

---

## Screen 2: Search Results — Anonymous

```
┌─────────────────────────────────────┐
│  ← Browse Dogs                      │
└─────────────────────────────────────┘

[ ZIP Code                           ]

[ Radius ▼                           ]

[ Filters                            ]

247 Dogs Found

───────────────────────────────────────

┌─────────────────────────────────────┐
│              PHOTO                  │
├─────────────────────────────────────┤
│  Charlie                            │
│  Young • Medium • Labrador Mix      │
│                                     │
│  Shelter Name                       │
│  12 Miles Away                      │
│                                     │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│  Compatibility Matching Available   │
│  Create your profile to see:        │
│  ✓ Match Score                      │
│  ✓ Why this dog fits                │
│  ✓ Potential concerns               │
│  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│                                     │
│  [ Get My Match ]  [ View Details ] │
└─────────────────────────────────────┘
```

---

## Screen 3: Search Results — Authenticated

**Mobile (single column)**

```
┌─────────────────────────────────────┐
│  🐾 Nuzzle    Favorites   [Profile] │
├─────────────────────────────────────┤
│  Best Matches For You               │
│  Based on Your Profile              │
├─────────────────────────────────────┤
│  📍 [Enter location...    ] [25mi▾] │
│  Sort: Best Match ▼                 │
├─────────────────────────────────────┤
│  Showing Best Matches for You       │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │           PHOTO               │  │
│  ├───────────────────────────────┤  │
│  │  Charlie                      │  │
│  │  Young • Medium • Lab Mix     │  │
│  │                               │  │
│  │  🟢 Strong Match    91%       │  │
│  │  ✓ High Confidence            │  │
│  │                               │  │
│  │  Match Factors:               │  │
│  │  • Good with Cats             │  │
│  │  • Moderate Energy            │  │
│  │  • Fits Your Home             │  │
│  │                               │  │
│  │  ♡ Favorite    [ View Details]│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Desktop (2-column grid)**

```
┌─────────────────────────────────────┐
│  🐾 Nuzzle    Favorites   [Profile] │
├─────────────────────────────────────┤
│  📍 [Enter location...    ] [25mi▾] │
├─────────────────────────────────────┤
│  Showing Best Matches for You       │
├──────────────┬──────────────────────┤
│              │                      │
│  [Photo]     │  [Photo]             │
│  Charlie     │  Bella               │
│  Young•Med   │  Adult•Small         │
│  Lab Mix     │  Beagle Mix          │
│              │                      │
│  🟢 Strong   │  🟡 Good             │
│  Match  91%  │  Match  78%          │
│  ✓ High Conf │  🟡 Med Conf         │
│              │                      │
│  • Good w/   │  • Good with kids    │
│    cats      │  • Calm energy       │
│  • Mod energy│                      │
│              │                      │
├──────────────┼──────────────────────┤
│              │                      │
│  [Photo]     │  [Photo]             │
│  Rocket      │  ...                 │
│  Young•Lrg   │                      │
│  Husky       │                      │
│              │                      │
│  🔴 Low      │                      │
│  Match  28%  │                      │
│  🟢 High Conf│                      │
│              │                      │
│  • High      │                      │
│    energy    │                      │
│  • Needs yard│                      │
│              │                      │
└──────────────┴──────────────────────┘
```

---

## Screen 4: Dog Detail — Anonymous

```
┌─────────────────────────────────────┐
│  ← Charlie                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                                     │
│             PHOTO                   │
│                                     │
└─────────────────────────────────────┘

○ ○ ○ ○

Charlie
Young Labrador Mix
Phoenix, AZ  •  Shelter Name

───────────────────────────────────────

ABOUT
Dog description text...

───────────────────────────────────────

COMPATIBILITY

Want to know if this dog fits
your lifestyle?

Unlock:
✓ Match Score
✓ Match Explanation
✓ Potential Concerns
✓ Shelter Questions

───────────────────────────────────────

[ Get My Compatibility Match ]

───────────────────────────────────────

[ Visit Shelter Listing ]
```

---

## Screen 5: Dog Detail — Authenticated (High Confidence)

```
┌─────────────────────────────────────┐
│  ← Back to Results        [♡ Save] │
├─────────────────────────────────────┤
│                                     │
│  [Large Dog Photo — full width]     │
│                                     │
├─────────────────────────────────────┤
│  Charlie                            │
│  Young • Medium • Labrador Mix      │
│  Happy Paws Rescue  •  3.2 mi away  │
│                                     │
│  ♡ Favorite                         │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🟢 Strong Match      91%     │  │
│  │  ✓ High Confidence            │  │
│  │                               │  │
│  │  This recommendation is based │  │
│  │  on detailed shelter info.    │  │
│  │                               │  │
│  │  Why Charlie fits:            │  │
│  │  ✓ Good with cats             │  │
│  │  ✓ Moderate energy match      │  │
│  │  ✓ No yard required           │  │
│  │  ✓ Apartment friendly         │  │
│  │                               │  │
│  │  Potential Concerns:          │  │
│  │  ⚠ Needs daily walks (45min+) │  │
│  │  ⚠ Child compatibility unknown│  │
│  │                               │  │
│  │  Questions to Ask:            │  │
│  │  • Has Charlie lived w/ kids? │  │
│  │  • Daily exercise needs?      │  │
│  │                               │  │
│  │  [AI explanation paragraph]   │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  About Charlie                      │
│  [Shelter description text...]      │
├─────────────────────────────────────┤
│  Before You Apply                   │
│  Ask the shelter:                   │
│  • Has Charlie been tested w/ cats? │
│  • How much exercise does he need?  │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │    Visit Shelter Listing  →   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Screen 5b: Dog Detail — Authenticated (Low Confidence Variant)

```
  ┌───────────────────────────────┐
  │  🟢 Strong Match      91%     │
  │  🔴 Low Confidence    [Why?]  │
  │                               │
  │  Some important information   │
  │  is missing:                  │
  │  • Cat compatibility unknown  │
  │  • Yard requirements unknown  │
  │  • Exercise needs unknown     │
  │                               │
  │  We recommend contacting the  │
  │  shelter before applying.     │
  │                               │
  │  Why Charlie may fit:         │
  │  ✓ No known issues w/ dogs    │
  │  ✓ Small to medium size       │
  └───────────────────────────────┘
```

---

## Screen 6: Quick Match Questionnaire

**Step 1 of 6**

```
┌─────────────────────────────────────┐
│  ←          Step 1 of 6            │
│  ████░░░░░░░░░░░░░░░░░░░░░░░        │
│                                     │
│  What type of home do you live in?  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏢  Apartment              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏡  House                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏠  Other                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Why we ask: Some dogs need more    │
│  space than apartments allow.       │
│                                     │
└─────────────────────────────────────┘
```

**Step 2 of 6**

```
Do you have children in your home?

○ Yes
○ No

[ Continue ]
```

**Step 3 of 6**

```
Do you have cats?

○ Yes
○ No

[ Continue ]
```

**Step 4 of 6**

```
Do you have other dogs?

○ Yes
○ No

[ Continue ]
```

**Step 5 of 6**

```
How active is your lifestyle?

○ Low
○ Moderate
○ High

[ Continue ]
```

**Step 6 of 6**

```
What's your dog ownership experience?

○ First-Time Owner
○ Previous Dog Owner
○ Breed Experience

[ Generate My Matches ]
```

---

## Post-Questionnaire Results Prompt

```
┌─────────────────────────────────────┐
│                                     │
│        Your matches are ready!      │
│                                     │
│   We found dogs that fit your       │
│   lifestyle.                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       See My Matches        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Want even better matches?          │
│  [Answer 6 more questions →]        │
│                                     │
│  You can update your profile        │
│  at any time.                       │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 7: Expanded Questionnaire

```
┌─────────────────────────────────────┐
│  Improve Match Accuracy             │
└─────────────────────────────────────┘

Yard Available?
○ Yes
○ No

───────────────────────────────────────

Fence Available?
○ Yes
○ No

───────────────────────────────────────

Grooming Tolerance?
○ Low
○ Moderate
○ High

───────────────────────────────────────

Size Preference?
○ Small
○ Medium
○ Large
○ X-Large
○ No Preference

───────────────────────────────────────

Special Needs Willingness?
○ Yes
○ No
○ Open to It

───────────────────────────────────────

Distance Preference

[ ●────────────────── ] 25 miles

───────────────────────────────────────

[ Improve My Matches ]
```

---

## Screen 8: Match Results

```
┌─────────────────────────────────────┐
│  Your Best Matches                  │
└─────────────────────────────────────┘

Profile Complete
12 Strong Matches Found

───────────────────────────────────────

┌─────────────────────────────────────┐
│           PHOTO                     │
├─────────────────────────────────────┤
│  Charlie                            │
│  Young • Medium • Lab Mix           │
│                                     │
│  🟢 Strong Match    91%             │
│  ✓ High Confidence                  │
│                                     │
│  • Good with Cats                   │
│  • Moderate Energy                  │
│  • Apartment Friendly               │
│                                     │
│  ♡ Favorite         [ View Details ]│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           PHOTO                     │
├─────────────────────────────────────┤
│  Bella                              │
│  Adult • Small • Beagle Mix         │
│                                     │
│  🟡 Good Match      84%             │
│  ✓ High Confidence                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           PHOTO                     │
├─────────────────────────────────────┤
│  Luna                               │
│  Young • Medium • Border Collie     │
│                                     │
│  🟡 Good Match      80%             │
│  🟡 Medium Confidence               │
└─────────────────────────────────────┘
```

---

## Screen 9: Account Creation Prompt (Favorites Trigger)

```
┌─────────────────────────────────────┐
│                           ✕ dismiss │
│                                     │
│  Save Charlie to your favorites     │
│                                     │
│  Create a free account to save      │
│  your matches and come back         │
│  anytime.                           │
│                                     │
│  [Email address.................]   │
│  [Password........................]  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Create Account        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Already have an account? [Login]   │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 10: User Dashboard / Favorites

(Mobile — sidebar collapses; desktop adds a left sidebar with greeting + nav.)

```
┌─────────────────────────────────────┐
│  🐾 Nuzzle               [Profile] │
├─────────────────────────────────────┤
│  ♥ Saved Dogs          [Edit Profile]│
│  Your favorite dogs & matches.      │
│  ✓ Profile: Complete · Updated Today│
├─────────────────────────────────────┤
│  🎀 We're finding great matches!    │
│     ... Learn how matches work ›    │
├─────────────────────────────────────┤
│  3 Saved Dogs       Sort by:[Best ▾]│
├─────────────────────────────────────┤
│ [Photo]  Charlie ♥          🟢 91%  │
│          Lab · Young · M · Med  MATCH│
│          📍 Shelter · 5 mi   ✓ High │
│          [Mod Energy][Good w/Cats]  │
│          Friendly pup who loves...  │
│          [View Details]         [✕] │
├─────────────────────────────────────┤
│  Home   Search   ♡ Saved  Profile  │
└─────────────────────────────────────┘
```

**Empty State**

```
┌─────────────────────────────────────┐
│  Saved Dogs                         │
├─────────────────────────────────────┤
│                                     │
│  You haven't saved any dogs yet.    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Browse Dogs           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 11: Profile Management

```
┌─────────────────────────────────────┐
│  Compatibility Profile              │
└─────────────────────────────────────┘

Current Profile

Children:    Yes
Cats:        No
Dogs:        Yes
Activity:    Moderate
Experience:  Previous Owner
Home Type:   House

───────────────────────────────────────

[ Edit Profile ]

[ Improve Accuracy ]
```

---

## Modal: Confidence Explanation

**High Confidence**

```
┌─────────────────────────────────────┐
│  ✓ High Confidence                  │
│                                     │
│  This recommendation is based on    │
│  detailed shelter information:      │
│                                     │
│  ✓ Cat compatibility                │
│  ✓ Activity level                   │
│  ✓ Experience requirements          │
│  ✓ Housing requirements             │
│                                     │
└─────────────────────────────────────┘
```

**Low Confidence**

```
┌─────────────────────────────────────┐
│  🔴 Low Confidence                  │
│                                     │
│  Important information is missing:  │
│                                     │
│  • Cat compatibility unknown        │
│  • Yard requirements unknown        │
│  • Exercise requirements unknown    │
│                                     │
│  We recommend contacting the        │
│  shelter before applying.           │
│                                     │
└─────────────────────────────────────┘
```

---

## Mobile UX Validation Checklist

All layouts must satisfy:

- ✓ Compatibility visible without excessive scrolling
- ✓ Primary actions visible without scrolling
- ✓ Anonymous users can browse immediately
- ✓ Profiled users see recommendation value immediately
- ✓ Confidence labeling is understandable
- ✓ Accessibility requirements can be implemented
- ✓ No horizontal scrolling at 375px
- ✓ Match factors limited to 2–3 per card

---

## Wireframe Completion Criteria

The wireframe set is considered complete when:

- All 11 MVP screens are represented
- Anonymous and authenticated states are documented for Search Results and Dog Detail
- Mobile layouts are validated at 375px
- Compatibility hierarchy is clear on cards and detail page
- Confidence hierarchy is preserved (never merged with compatibility)
- Post-questionnaire and account creation flows are covered
- Confidence explanation modal is present
- Empty states are documented
