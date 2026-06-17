import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";
import { generateExplanation, FALLBACK_EXPLANATION } from "@/lib/ai/explainer";
import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

const SCORE_VERSION = 1;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string; externalId: string }> },
) {
  const { provider, externalId } = await params;
  const body = (await (req as Request & { json(): Promise<unknown> }).json()) as {
    result: CompatibilityResult;
    dog: NormalizedDog;
  };

  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ explanation: FALLBACK_EXPLANATION });

  const profile = await prisma.adopterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ explanation: FALLBACK_EXPLANATION });

  const existingScore = await prisma.compatibilityScore.findFirst({
    where: {
      userId: user.id,
      dogProvider: provider,
      dogExternalId: externalId,
      profileVersion: profile.profileVersion,
      scoreVersion: SCORE_VERSION,
    },
    include: { aiExplanations: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (existingScore?.aiExplanations[0]) {
    const cached = existingScore.aiExplanations[0].explanationJson as { text: string };
    return NextResponse.json({ explanation: cached.text });
  }

  const explanation = await generateExplanation(body.result, body.dog);

  const score =
    existingScore ??
    (await prisma.compatibilityScore.create({
      data: {
        userId: user.id,
        dogProvider: provider,
        dogExternalId: externalId,
        profileVersion: profile.profileVersion,
        scoreVersion: SCORE_VERSION,
        compatibilityScore: body.result.compatibilityScore,
        matchLabel: body.result.matchLabel,
        confidenceScore: body.result.confidenceScore,
        confidenceLabel: body.result.confidenceLabel,
        scoreBreakdown: body.result.breakdown as unknown as Prisma.InputJsonValue,
        positiveFactors: body.result.positiveFactors as unknown as Prisma.InputJsonValue,
        concerns: body.result.concerns as unknown as Prisma.InputJsonValue,
        shelterQuestions: body.result.shelterQuestions as unknown as Prisma.InputJsonValue,
      },
    }));

  await prisma.aiExplanation.create({
    data: {
      compatibilityScoreId: score.id,
      model: "llama-3.3-70b-versatile",
      promptVersion: 1,
      explanationJson: { text: explanation },
    },
  });

  return NextResponse.json({ explanation });
}
