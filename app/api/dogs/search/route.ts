import { NextRequest, NextResponse } from "next/server";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type { AdopterProfile, CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

type SearchResult = { dog: NormalizedDog; compatibility?: CompatibilityResult };

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // zip is optional — when omitted we search nationwide.
  const zip = searchParams.get("zip") ?? undefined;

  const radius = Number(searchParams.get("radius") ?? 25);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 12);
  const breed = searchParams.get("breed") ?? undefined;
  const ageGroup = searchParams.get("ageGroup") ?? undefined;
  const sizeGroup = searchParams.get("sizeGroup") ?? undefined;
  const sortParam = searchParams.get("sort");

  const user = await getOrCreateUser();
  const profile = user
    ? await prisma.adopterProfile.findUnique({ where: { userId: user.id } })
    : null;

  const useCompatibilitySort = profile !== null && sortParam !== "distance";
  const sort = useCompatibilitySort ? "best_match" : "distance";

  try {
    const { dogs, hasMore, total } = await searchRescueGroupsDogs({
      zip,
      radius,
      page,
      limit,
      breed,
      ageGroup,
      sizeGroup,
    });

    let results: SearchResult[];

    if (useCompatibilitySort) {
      results = dogs.map(({ id, raw }) => {
        const dog = normalizeRescueGroupsDog(raw, id, null);
        const compatibility = calculateCompatibility(
          profile as unknown as AdopterProfile,
          dog,
        );
        return { dog, compatibility };
      });
      results.sort((a, b) => {
        const scoreDiff =
          b.compatibility!.compatibilityScore - a.compatibility!.compatibilityScore;
        if (scoreDiff !== 0) return scoreDiff;
        const confDiff =
          b.compatibility!.confidenceScore - a.compatibility!.confidenceScore;
        if (confDiff !== 0) return confDiff;
        return (a.dog.distance ?? Infinity) - (b.dog.distance ?? Infinity);
      });
    } else {
      results = dogs
        .map(({ id, raw }) => ({ dog: normalizeRescueGroupsDog(raw, id, null) }))
        .sort((a, b) => (a.dog.distance ?? Infinity) - (b.dog.distance ?? Infinity));
    }

    return NextResponse.json({
      results,
      compatibility: profile
        ? { available: true }
        : {
            available: false,
            teaser: "Create a profile to unlock compatibility matching.",
          },
      sort,
      page,
      hasMore,
      total,
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Dog search unavailable" } },
      { status: 503 },
    );
  }
}
