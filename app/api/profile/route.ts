import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.adopterProfile.findUnique({ where: { userId: user.id } });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { homeType, hasChildren, hasCats, hasOtherDogs, activityLevel, experienceLevel } = body;

  if (
    homeType == null ||
    hasChildren == null ||
    hasCats == null ||
    hasOtherDogs == null ||
    activityLevel == null ||
    experienceLevel == null
  ) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "All Phase 1 fields are required" } },
      { status: 422 }
    );
  }

  const profile = await prisma.adopterProfile.create({
    data: {
      userId: user.id,
      homeType,
      hasChildren,
      hasCats,
      hasOtherDogs,
      activityLevel,
      experienceLevel,
      groomingTolerance: body.groomingTolerance ?? undefined,
      hasFence: body.hasFence ?? undefined,
      hasYard: body.hasYard ?? undefined,
      specialNeedsWilling: body.specialNeedsWilling ?? undefined,
      maxDistance: body.maxDistance ?? undefined,
      sizePreference: body.sizePreference ?? undefined,
    },
  });

  return NextResponse.json({ profileVersion: profile.profileVersion }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const profile = await prisma.adopterProfile.update({
    where: { userId: user.id },
    data: { ...body, profileVersion: { increment: 1 } },
  });

  return NextResponse.json({ profileVersion: profile.profileVersion });
}
