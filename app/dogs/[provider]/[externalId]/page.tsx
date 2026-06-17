import { notFound } from "next/navigation";
import { getRescueGroupsDog } from "@/lib/rescuegroups/client";
import { normalizeRescueGroupsDog } from "@/lib/compatibility/normalize";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { calculateCompatibility } from "@/lib/compatibility/engine";
import { generateExplanation } from "@/lib/ai/explainer";
import type { AdopterProfile } from "@/lib/compatibility/types";
import { DogDetailClient } from "./DogDetailClient";

export default async function DogDetailPage({
  params,
}: {
  params: Promise<{ provider: string; externalId: string }>;
}) {
  const { provider, externalId } = await params;

  if (provider !== "rescuegroups") notFound();

  const dogData = await getRescueGroupsDog(externalId);
  if (!dogData) notFound();

  const dog = normalizeRescueGroupsDog(dogData.raw, externalId, null);

  const user = await getOrCreateUser();
  const profile = user
    ? await prisma.adopterProfile.findUnique({ where: { userId: user.id } })
    : null;

  const compatibility = profile
    ? {
        available: true as const,
        result: calculateCompatibility(profile as unknown as AdopterProfile, dog),
      }
    : {
        available: false as const,
        teaser: "Create a profile to unlock compatibility matching.",
      };

  let explanation: string | null = null;
  if (profile && compatibility.available) {
    explanation = await generateExplanation(compatibility.result, dog);
  }

  return <DogDetailClient dog={dog} compatibility={compatibility} explanation={explanation} />;
}
