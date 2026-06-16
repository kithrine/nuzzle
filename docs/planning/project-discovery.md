# Project Discovery — Nuzzle

**Agent**: Mary (Business Analyst)
**Status**: Approved

---

## Core Concept

Nuzzle is a dog adoption compatibility matching app that helps prospective adopters find dogs that genuinely fit their lifestyle — reducing failed adoptions and return rates.

The app sits on top of existing adoption listing data (via the RescueGroups API) and adds a compatibility and decision-support layer that existing platforms like Petfinder do not provide.

---

## Problem Statement

Dog adoption return rates are a significant problem for shelters and dogs alike. The root cause is often not a bad adopter — it is a bad match. Adopters choose dogs based on photos, proximity, or emotional impulse rather than lifestyle fit. Shelters lack the tools to surface compatibility information clearly. Existing discovery apps optimize for engagement, not adoption outcomes.

---

## Target Users

**Primary user**: A prospective dog adopter who wants to make a responsible, lasting adoption decision.

Characteristics:
- May be a first-time dog owner
- Wants to be confident before committing
- May have specific household constraints (kids, cats, apartment, no yard)
- Will benefit from honest guidance, including when a dog is not a good fit

**Secondary stakeholder**: Shelters (indirectly benefit from better-matched adoptions)

---

## Value Proposition

Nuzzle is a compatibility and decision-support layer for dog adoption — not just another dog discovery app.

It helps users:
- Understand why a dog does or does not fit their lifestyle
- Make informed decisions rather than impulse adoptions
- Ask better questions before applying
- Avoid adopting a dog they will need to return

---

## Primary Success Metric

**Reduce adoption return rates.**

Secondary metrics:
- Adoption completion rate (of users who applied via Nuzzle)
- User-reported confidence in their adoption decision
- Questionnaire completion rate

Note: Measuring return rates requires a post-adoption follow-up mechanism (documented as a V2 feature). For V1, proxy metrics will be used.

---

## Key Differentiators

1. **Compatibility scoring with explanation** — not just a match percentage, but reasons why
2. **Confidence scoring** — transparent about data quality and missing shelter information
3. **Decision support** — "Before You Apply" questions for each dog
4. **Concern surfacing** — highlights potential friction points proactively
5. **Breed standard gap-filling** — when shelter profiles are sparse, known breed standards are used to fill in data gaps, with a clear disclosure label

---

## Breed Standard Data Disclosure Rule

When a dog's shelter profile lacks information about energy level, trainability, kid/cat/dog compatibility, etc., Nuzzle may supplement with well-known breed standards. When this happens:

- A visible alert/badge must indicate which fields were inferred from breed standards
- These inferences must lower the confidence score
- The user must understand this is general breed information, not specific to this dog

---

## Risks and Assumptions

| Risk | Mitigation |
|------|-----------|
| RescueGroups API data is often incomplete | Unknown fields get partial credit + confidence reduction, never treated as disqualifying |
| Users may not complete questionnaire | Split into Quick Match (required) + Improve Accuracy (optional) |
| Users may overtrust the score | Display confidence prominently; surface data gaps clearly |
| Return-rate reduction is hard to measure in V1 | Use proxy metrics; V2 adds follow-up surveys |
| Shelters may have inconsistent data formats | Normalization layer maps API fields to internal types before scoring |

---

## Out of Scope (V1)

- Cat adoption
- Shelter-side dashboard
- In-app adoption application
- Social features / sharing
- Gamification
- Breed popularity rankings
- Multi-household profiles
- Adoption outcome tracking (V2)

---

## Adoption Flow (V1)

Users are redirected to the shelter's external listing to complete their adoption application. Nuzzle does not handle the adoption transaction itself in V1.
