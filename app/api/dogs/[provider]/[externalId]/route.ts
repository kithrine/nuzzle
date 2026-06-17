import { NextRequest, NextResponse } from "next/server";
import { getRescueGroupsDog } from "@/lib/rescuegroups/client";
import { RateLimitError } from "@/lib/rescuegroups/types";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import type { AdopterProfile } from "@/lib/compatibility/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string; externalId: string }> },
) {
  const { provider, externalId } = await params;

  if (provider !== "rescuegroups") {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  try {
    const dogData = await getRescueGroupsDog(externalId);
    if (!dogData) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    const dog = normalizeRescueGroupsDog(dogData.raw, externalId, null);

    const user = await getOrCreateUser();
    const profile = user
      ? await prisma.adopterProfile.findUnique({ where: { userId: user.id } })
      : null;

    if (profile) {
      const result = calculateCompatibility(
        profile as unknown as AdopterProfile,
        dog,
      );
      return NextResponse.json({ dog, compatibility: { available: true, result } });
    }

    return NextResponse.json({
      dog,
      compatibility: {
        available: false,
        teaser: "Create a profile to unlock compatibility matching.",
      },
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: { code: "PROVIDER_ERROR", message: "Dog detail unavailable" } },
      { status: 503 },
    );
  }
}
