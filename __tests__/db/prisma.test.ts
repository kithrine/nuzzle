// @vitest-environment node
//
// Real Postgres integration test — no mocking. The acceptance criteria for
// Story 1.2 literally requires "Prisma client connects without throwing"
// and schema validation against live tables, so this hits the real Neon
// database configured via DATABASE_URL.
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";

// Unique per test run so repeated runs never collide on @unique constraints
// (User.clerkUserId, User.email, Favorite/@@unique, DogCache/@@unique).
const TEST_RUN_ID = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createdUserIds: string[] = [];
const createdDogCacheIds: string[] = [];

afterAll(async () => {
  // CompatibilityScore.user and AnalyticsEvent.user are NOT onDelete:
  // Cascade in the canonical schema (only AdopterProfile.user and
  // Favorite.user are) — children must be deleted before the parent User,
  // in FK-safe order, or this would either orphan rows or fail on the FK
  // constraint.
  await prisma.aiExplanation.deleteMany({
    where: { compatibilityScore: { userId: { in: createdUserIds } } },
  });
  await prisma.compatibilityScore.deleteMany({
    where: { userId: { in: createdUserIds } },
  });
  await prisma.analyticsEvent.deleteMany({
    where: { userId: { in: createdUserIds } },
  });
  // Deleting User cascades to AdopterProfile and Favorite.
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.dogCache.deleteMany({
    where: { id: { in: createdDogCacheIds } },
  });
  await prisma.$disconnect();
});

describe("Database layer (Story 1.2)", () => {
  it("Prisma client connects without throwing", async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });

  it("creates a user with clerkUserId and email", async () => {
    const user = await prisma.user.create({
      data: {
        clerkUserId: `clerk_${TEST_RUN_ID}`,
        email: `${TEST_RUN_ID}@example.test`,
      },
    });
    createdUserIds.push(user.id);

    expect(user.id).toBeTruthy();
    expect(user.clerkUserId).toBe(`clerk_${TEST_RUN_ID}`);
    expect(user.email).toBe(`${TEST_RUN_ID}@example.test`);
  });

  it("creates a profile linked to a user, with profileVersion defaulting to 1", async () => {
    const user = await prisma.user.create({
      data: {
        clerkUserId: `clerk_${TEST_RUN_ID}-profile`,
        email: `profile-${TEST_RUN_ID}@example.test`,
      },
    });
    createdUserIds.push(user.id);

    const profile = await prisma.adopterProfile.create({
      data: {
        userId: user.id,
        homeType: "House",
        hasChildren: false,
        hasCats: false,
        hasOtherDogs: false,
        activityLevel: "Moderate",
        experienceLevel: "Species",
      },
    });

    expect(profile.userId).toBe(user.id);
    expect(profile.profileVersion).toBe(1);
  });

  it("has all required fields on all models (schema validation)", async () => {
    const user = await prisma.user.create({
      data: {
        clerkUserId: `clerk_${TEST_RUN_ID}-schema`,
        email: `schema-${TEST_RUN_ID}@example.test`,
      },
    });
    createdUserIds.push(user.id);

    const profile = await prisma.adopterProfile.create({
      data: {
        userId: user.id,
        homeType: "Apartment",
        hasChildren: true,
        hasCats: true,
        hasOtherDogs: false,
        activityLevel: "High",
        experienceLevel: "Breed",
        groomingTolerance: "Low",
        coatPreference: "Short",
        breedPreference: "No Preference",
        hasFence: true,
        hasYard: true,
        specialNeedsWilling: false,
        maxDistance: 25,
        sizePreference: "Medium",
      },
    });

    const score = await prisma.compatibilityScore.create({
      data: {
        userId: user.id,
        dogProvider: "rescuegroups",
        dogExternalId: `ext-${TEST_RUN_ID}`,
        profileVersion: profile.profileVersion,
        compatibilityScore: 91,
        matchLabel: "Strong Match",
        confidenceScore: 80,
        confidenceLabel: "High",
        scoreBreakdown: {},
        positiveFactors: [],
        concerns: [],
        shelterQuestions: [],
      },
    });

    const explanation = await prisma.aiExplanation.create({
      data: {
        compatibilityScoreId: score.id,
        model: "gpt-4o",
        promptVersion: 1,
        explanationJson: {},
      },
    });

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        provider: "rescuegroups",
        externalId: `ext-${TEST_RUN_ID}`,
      },
    });

    const event = await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventName: "questionnaire_started",
        eventData: {},
      },
    });

    const dogCache = await prisma.dogCache.create({
      data: {
        provider: "rescuegroups",
        externalId: `ext-${TEST_RUN_ID}`,
        name: "Test Dog",
        normalizedData: {},
        lastSyncedAt: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });
    createdDogCacheIds.push(dogCache.id);

    expect(profile.id).toBeTruthy();
    expect(score.id).toBeTruthy();
    expect(explanation.compatibilityScoreId).toBe(score.id);
    expect(favorite.id).toBeTruthy();
    expect(event.id).toBeTruthy();
    expect(dogCache.id).toBeTruthy();
  });
});
