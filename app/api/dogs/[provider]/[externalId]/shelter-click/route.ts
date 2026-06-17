import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { getRescueGroupsDog } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; externalId: string }> },
) {
  const { provider, externalId } = await params;

  const user = await getOrCreateUser();
  const body = await req.json().catch(() => ({}));
  const { anonymousId } = (body ?? {}) as { anonymousId?: string };

  if (provider !== "rescuegroups") {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Provider not supported" } },
      { status: 404 },
    );
  }

  const dogData = await getRescueGroupsDog(externalId);
  if (!dogData) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Dog not found" } },
      { status: 404 },
    );
  }

  const dog = normalizeRescueGroupsDog(dogData.raw, externalId, null);
  const { shelterUrl } = dog;

  if (!shelterUrl) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No shelter URL available" } },
      { status: 404 },
    );
  }

  await prisma.analyticsEvent.create({
    data: {
      userId: user?.id ?? null,
      anonymousId: user ? null : (anonymousId ?? null),
      eventName: "shelter_click",
      eventData: { provider, externalId, shelterUrl },
    },
  });

  return NextResponse.json({ shelterUrl });
}
