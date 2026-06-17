import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const body = await req.json();
  const { provider, externalId } = body ?? {};
  if (!provider || !externalId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "provider and externalId are required" } },
      { status: 422 },
    );
  }

  try {
    const favorite = await prisma.favorite.create({
      data: { userId: user.id, provider, externalId },
    });
    return NextResponse.json(
      { id: favorite.id, provider: favorite.provider, externalId: favorite.externalId, createdAt: favorite.createdAt },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: { code: "DUPLICATE", message: "Already favorited" } },
        { status: 409 },
      );
    }
    throw e;
  }
}

export async function GET(_req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}
