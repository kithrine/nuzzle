import type { SearchDogsParams } from "@/lib/providers/types";
import {
  ProviderError,
  RateLimitError,
  type RescueGroupsApiResponse,
  type RescueGroupsApiPicture,
  type RescueGroupsApiOrg,
  type RescueGroupsRawDog,
} from "@/lib/rescuegroups/types";

const RG_BASE = "https://api.rescuegroups.org/v5";

// RG v5 picture size fields vary; pick the first usable URL.
function extractPictureUrl(attrs: RescueGroupsApiPicture["attributes"]): string | null {
  return (
    attrs?.large?.url ??
    attrs?.original?.url ??
    attrs?.small?.url ??
    attrs?.url ??
    null
  );
}

export async function searchRescueGroupsDogs(
  params: SearchDogsParams
): Promise<{ dogs: Array<{ id: string; raw: RescueGroupsRawDog }>; hasMore: boolean; total?: number }> {
  const apiKey = process.env.RESCUEGROUPS_API_KEY ?? "";
  const { zip, radius = 25, page = 1, limit = 20, breed, ageGroup, sizeGroup } = params;
  const pageSize = Math.min(limit, 50);

  type FilterField = { fieldName: string; operation: string; criteria: string };
  const filterFields: FilterField[] = [];
  if (ageGroup) filterFields.push({ fieldName: "animals.ageGroup", operation: "equals", criteria: ageGroup });
  if (sizeGroup) filterFields.push({ fieldName: "animals.sizeGroup", operation: "equals", criteria: sizeGroup });
  if (breed) filterFields.push({ fieldName: "animals.breedPrimary", operation: "contains", criteria: breed });

  // Location filter only when a zip is supplied; otherwise search nationwide.
  const requestData: Record<string, unknown> = {};
  if (zip) requestData.filterRadius = { miles: radius, postalcode: zip };
  if (filterFields.length > 0) requestData.filterFields = filterFields;

  // RG v5 paginates via query params (limit/page), not the request body.
  const res = await fetch(
    `${RG_BASE}/public/animals/search/available/dogs?include=pictures,orgs&limit=${pageSize}&page=${page}`,
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

  const orgMap = new Map<string, RescueGroupsApiOrg["attributes"]>();
  const pictureMap = new Map<string, string>();
  for (const included of json.included ?? []) {
    if (included.type === "orgs") {
      orgMap.set(included.id, (included as RescueGroupsApiOrg).attributes);
    } else if (included.type === "pictures") {
      const url = extractPictureUrl((included as RescueGroupsApiPicture).attributes);
      if (url) pictureMap.set(included.id, url);
    }
  }

  const dogs = (json.data ?? []).map((animal) => {
    const orgId = animal.relationships?.orgs?.data?.[0]?.id;
    const org = orgId ? orgMap.get(orgId) : undefined;

    const photos = (animal.relationships?.pictures?.data ?? [])
      .map((ref) => pictureMap.get(ref.id))
      .filter((url): url is string => Boolean(url));

    const raw: RescueGroupsRawDog = {
      animals: { ...animal.attributes, photos },
      shelters: org ? { name: org.name, adoptionUrl: org.url } : null,
    };

    return { id: animal.id, raw };
  });

  // RG v5 exposes the total match count as `meta.count` (with `meta.pagination.total`
  // kept as a fallback for older shapes).
  const total = json.meta?.count ?? json.meta?.pagination?.total ?? 0;
  const hasMore = page * pageSize < total;

  return { dogs, hasMore, total };
}

export async function getRescueGroupsDog(
  externalId: string,
): Promise<{ id: string; raw: RescueGroupsRawDog } | null> {
  const apiKey = process.env.RESCUEGROUPS_API_KEY ?? "";
  const res = await fetch(
    `${RG_BASE}/public/animals/${externalId}?include=pictures,orgs`,
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

  const json: RescueGroupsApiResponse = await res.json();

  // The single-animal endpoint returns `data` as an array, same as search.
  const animal = Array.isArray(json.data) ? json.data[0] : json.data;
  if (!animal) return null;

  let org: RescueGroupsApiOrg["attributes"] | undefined;
  const photos: string[] = [];
  for (const inc of json.included ?? []) {
    if (inc.type === "orgs") {
      org = org ?? (inc as RescueGroupsApiOrg).attributes;
    } else if (inc.type === "pictures") {
      // Single-animal fetch: every included picture belongs to this dog.
      const url = extractPictureUrl((inc as RescueGroupsApiPicture).attributes);
      if (url) photos.push(url);
    }
  }

  const raw: RescueGroupsRawDog = {
    animals: { ...animal.attributes, photos },
    shelters: org ? { name: org.name, adoptionUrl: org.url } : null,
  };

  return { id: animal.id, raw };
}
