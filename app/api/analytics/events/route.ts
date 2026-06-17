import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getOrCreateUser } from "@/lib/auth/get-or-create-user";
import { prisma } from "@/lib/db/prisma";

const VALID_EVENT_NAMES = new Set([
  "questionnaire_started",
  "questionnaire_completed",
  "questionnaire_updated",
  "search_performed",
  "filter_applied",
  "dog_viewed",
  "compatibility_viewed",
  "explanation_viewed",
  "favorite_added",
  "favorite_removed",
  "shelter_click",
]);

const PII_KEYS = new Set(["email", "phone", "password"]);

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  const body = await req.json().catch(() => ({}));
  const { eventName, eventData, anonymousId } = (body ?? {}) as {
    eventName?: string;
    eventData?: Record<string, unknown>;
    anonymousId?: string;
  };

  if (!eventName || !VALID_EVENT_NAMES.has(eventName)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `Invalid eventName. Must be one of: ${[...VALID_EVENT_NAMES].join(", ")}`,
        },
      },
      { status: 422 },
    );
  }

  const safeEventData = eventData ?? {};
  const piiFound = Object.keys(safeEventData).filter((k) => PII_KEYS.has(k));
  if (piiFound.length > 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `eventData must not contain PII fields: ${piiFound.join(", ")}`,
        },
      },
      { status: 422 },
    );
  }

  await prisma.analyticsEvent.create({
    data: {
      userId: user?.id ?? null,
      anonymousId: user ? null : (anonymousId ?? null),
      eventName,
      eventData: safeEventData as Prisma.InputJsonObject,
    },
  });

  return new Response(null, { status: 201 });
}
