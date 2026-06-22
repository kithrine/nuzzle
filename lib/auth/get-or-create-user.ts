import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  // Seed name from Clerk on first creation (may be null if Clerk didn't collect
  // it); never overwrite on update so in-app name edits stick.
  return prisma.user.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    },
    update: {},
  });
}
