import OpenAI from "openai";
import type { CompatibilityResult, NormalizedDog } from "@/lib/compatibility/types";

export const FALLBACK_EXPLANATION =
  "This recommendation is based on your profile preferences and the available shelter information for this dog.";

function buildPrompt(result: CompatibilityResult, dog: NormalizedDog): string {
  const factors = result.positiveFactors.join("; ") || "none noted";
  const concerns = result.concerns.join("; ") || "none noted";
  return (
    `Write a 2-3 sentence natural-language explanation for why ${dog.name ?? "this dog"} ` +
    `may be a ${result.matchLabel} for this adopter. ` +
    `Positive factors: ${factors}. Concerns: ${concerns}. ` +
    `Be constructive and encouraging. Do not mention a numeric score directly.`
  );
}

export async function generateExplanation(
  result: CompatibilityResult,
  dog: NormalizedDog,
): Promise<string> {
  try {
    const client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
    const completion = await client.chat.completions.create({
      model: "grok-3-mini",
      messages: [{ role: "user", content: buildPrompt(result, dog) }],
      max_tokens: 200,
    });
    return completion.choices[0]?.message?.content?.trim() ?? FALLBACK_EXPLANATION;
  } catch {
    return FALLBACK_EXPLANATION;
  }
}
