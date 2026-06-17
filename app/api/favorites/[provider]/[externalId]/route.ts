import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string; externalId: string }> },
) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const { provider, externalId } = await params;
  const { count } = await prisma.favorite.deleteMany({
    where: { userId: user.id, provider, externalId },
  });

  if (count === 0) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Favorite not found" } }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
