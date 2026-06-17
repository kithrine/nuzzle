import { NextRequest, NextResponse } from "next/server";
import { searchRescueGroupsDogs } from "@/lib/rescuegroups/client";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const zip = searchParams.get("zip");
  if (!zip) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "zip is required" } },
      { status: 422 }
    );
  }

  const radius = Number(searchParams.get("radius") ?? 25);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const breed = searchParams.get("breed") ?? undefined;
  const ageGroup = searchParams.get("ageGroup") ?? undefined;
  const sizeGroup = searchParams.get("sizeGroup") ?? undefined;

  try {
    const { dogs, hasMore } = await searchRescueGroupsDogs({
      zip,
      radius,
      page,
      limit,
      breed,
      ageGroup,
      sizeGroup,
    });

    const results = dogs.map(({ id, raw }) => ({
      dog: normalizeRescueGroupsDog(raw, id, null),
    }));

    return NextResponse.json({
      results,
      compatibility: {
        available: false,
        teaser: "Create a profile to unlock compatibility matching.",
      },
      page,
      hasMore,
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Dog search unavailable" } },
      { status: 503 }
    );
  }
}
