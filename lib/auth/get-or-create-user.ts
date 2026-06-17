import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  return prisma.user.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId, email },
    update: {},
  });
}
