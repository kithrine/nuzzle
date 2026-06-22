import { NextRequest, NextResponse } from "next/server";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type { AdopterProfile, CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

// Results depend on the signed-in user's profile, so this response must never be
// cached or shared across sessions — otherwise a guest can be served a logged-in
// user's scored results, or a profile's scores stay stale after an edit.
export const dynamic = "force-dynamic";

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

  const profiled = profile !== null;
  // Profiled users get best-match order by default; setting a ZIP (a location
  // search) switches to nearest-first. Anonymous users are always distance-sorted.
  const distanceSort = !profiled || Boolean(zip) || sortParam === "distance";
  const sort = distanceSort ? "distance" : "best_match";

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

    // Always score profiled users so cards show match info in either order.
    const results: SearchResult[] = dogs.map(({ id, raw }) => {
      const dog = normalizeRescueGroupsDog(raw, id, null);
      const compatibility = profiled
        ? calculateCompatibility(profile as unknown as AdopterProfile, dog)
        : undefined;
      return { dog, compatibility };
    });

    if (distanceSort) {
      // Nearest first; compatibility breaks ties when available.
      results.sort((a, b) => {
        const distDiff = (a.dog.distance ?? Infinity) - (b.dog.distance ?? Infinity);
        if (distDiff !== 0) return distDiff;
        return (
          (b.compatibility?.compatibilityScore ?? -1) -
          (a.compatibility?.compatibilityScore ?? -1)
        );
      });
    } else {
      // Best match: compatibility → confidence → distance.
      results.sort((a, b) => {
        const scoreDiff =
          b.compatibility!.compatibilityScore - a.compatibility!.compatibilityScore;
        if (scoreDiff !== 0) return scoreDiff;
        const confDiff =
          b.compatibility!.confidenceScore - a.compatibility!.confidenceScore;
        if (confDiff !== 0) return confDiff;
        return (a.dog.distance ?? Infinity) - (b.dog.distance ?? Infinity);
      });
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
    }, { headers: { "Cache-Control": "no-store" } });
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
