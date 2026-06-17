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
  const { zip, radius = 25, page = 1, limit = 20, breed, ageGroup, sizeGroup } = params;
  const pageSize = Math.min(limit, 50);

  type FilterField = { fieldName: string; operation: string; criteria: string };
  const filterFields: FilterField[] = [];
  if (ageGroup) filterFields.push({ fieldName: "animals.ageGroup", operation: "equals", criteria: ageGroup });
  if (sizeGroup) filterFields.push({ fieldName: "animals.sizeGroup", operation: "equals", criteria: sizeGroup });
  if (breed) filterFields.push({ fieldName: "animals.breeds.primary", operation: "contains", criteria: breed });

  const requestData: Record<string, unknown> = {
    filterRadius: { miles: radius, postalcode: zip },
    pagination: { pageNumber: page, pageSize },
  };
  if (filterFields.length > 0) requestData.filterFields = filterFields;

  const res = await fetch(
    `${RG_BASE}/public/animals/search/available/dogs`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({ data: requestData }),
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

export async function getRescueGroupsDog(
  externalId: string,
): Promise<{ id: string; raw: RescueGroupsRawDog } | null> {
  const apiKey = process.env.RESCUEGROUPS_API_KEY ?? "";
  const res = await fetch(
    `${RG_BASE}/public/animals/${externalId}?include=shelters`,
    {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/vnd.api+json",
      },
    },
  );

  if (res.status === 404) return null;
  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new ProviderError(`RescueGroups returned ${res.status}`);

  const json = await res.json();

  const shelterMap = new Map<string, RescueGroupsApiShelter["attributes"]>();
  for (const inc of json.included ?? []) {
    if (inc.type === "shelters") {
      shelterMap.set(inc.id, (inc as RescueGroupsApiShelter).attributes);
    }
  }

  const shelterAttrs = shelterMap.values().next().value as
    | RescueGroupsApiShelter["attributes"]
    | undefined;

  const raw: RescueGroupsRawDog = {
    animals: { ...json.data.attributes },
    shelters: shelterAttrs ?? null,
  };

  return { id: json.data.id, raw };
}
