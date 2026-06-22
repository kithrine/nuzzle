import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { QuestionnaireClient } from "./QuestionnaireClient";

export default async function QuestionnairePage() {
  const user = await getOrCreateUser();
  const [profile, clerkUser] = await Promise.all([
    user ? prisma.adopterProfile.findUnique({ where: { userId: user.id } }) : Promise.resolve(null),
    user ? currentUser() : Promise.resolve(null),
  ]);

  // A logged-in user who already has a profile lands in edit mode; everyone
  // else (anonymous or no profile yet) gets the creation flow.
  const initialProfile = profile
    ? {
        homeType: profile.homeType,
        hasChildren: profile.hasChildren,
        hasCats: profile.hasCats,
        hasOtherDogs: profile.hasOtherDogs,
        activityLevel: profile.activityLevel,
        experienceLevel: profile.experienceLevel,
        groomingTolerance: profile.groomingTolerance,
        hasFence: profile.hasFence,
        hasYard: profile.hasYard,
        specialNeedsWilling: profile.specialNeedsWilling,
        maxDistance: profile.maxDistance,
        sizePreference: profile.sizePreference,
        profileVersion: profile.profileVersion,
        updatedAt: profile.updatedAt.toISOString(),
      }
    : null;

  return (
    <Suspense>
      <QuestionnaireClient
        initialProfile={initialProfile}
        firstName={user?.firstName ?? clerkUser?.firstName ?? "there"}
      />
    </Suspense>
  );
}
