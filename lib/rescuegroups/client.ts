import type { SearchDogsParams } from "@/lib/providers/types";
import {
  ProviderError,
  RateLimitError,
  type RescueGroupsApiResponse,
  type RescueGroupsApiShelter,
  type RescueGroupsRawDog,
} from "@/lib/rescuegroups/types";

const RG_BASE = "https://api.rescuegroups.org/v5";

export async function searchRescueGroupsDogs(
  params: SearchDogsParams
): Promise<{ dogs: Array<{ id: string; raw: RescueGroupsRawDog }>; hasMore: boolean }> {
  const apiKey = process.env.RESCUEGROUPS_API_KEY ?? "";
  const { zip, radius = 25, page = 1, limit = 20 } = params;
  const pageSize = Math.min(limit, 50);

  const res = await fetch(
    `${RG_BASE}/public/animals/search/available/dogs`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          filterRadius: { miles: radius, postalcode: zip },
          pagination: { pageNumber: page, pageSize },
        },
      }),
    }
  );

  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new ProviderError(`RescueGroups returned ${res.status}`);

  const json: RescueGroupsApiResponse = await res.json();

  const shelterMap = new Map<string, RescueGroupsApiShelter["attributes"]>();
  for (const included of json.included ?? []) {
    if (included.type === "shelters") {
      shelterMap.set(included.id, (included as RescueGroupsApiShelter).attributes);
    }
  }

  const dogs = (json.data ?? []).map((animal) => {
    const shelterId = Object.keys(shelterMap)[0];
    const shelterAttrs = shelterId ? shelterMap.get(shelterId) : undefined;

    const raw: RescueGroupsRawDog = {
      animals: { ...animal.attributes },
      shelters: shelterAttrs ?? null,
    };

    return { id: animal.id, raw };
  });

  const total = json.meta?.pagination?.total ?? 0;
  const hasMore = total > page * pageSize;

  return { dogs, hasMore };
}
