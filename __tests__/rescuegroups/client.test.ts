// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { searchRescueGroupsDogs, getRescueGroupsDog } from "@/lib/rescuegroups/client";

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchRescueGroupsDogs — pictures", () => {
  it("requests pictures and maps included photos to each dog by relationship", async () => {
    const fetchMock = mockFetchOnce(200, {
      data: [
        {
          id: "rg-1",
          type: "animals",
          attributes: { name: "Rex" },
          relationships: { pictures: { data: [{ id: "pic-1", type: "pictures" }] } },
        },
      ],
      included: [
        { id: "pic-1", type: "pictures", attributes: { large: { url: "https://img.test/rex.jpg" } } },
      ],
      meta: { pagination: { total: 1 } },
    });

    const { dogs } = await searchRescueGroupsDogs({ zip: "10001" });

    expect(dogs[0].raw.animals.photos).toEqual(["https://img.test/rex.jpg"]);
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("include=pictures");
  });
});

describe("searchRescueGroupsDogs — pagination & location", () => {
  it("no zip → nationwide (no filterRadius), query-param pagination, total from meta.count", async () => {
    const fetchMock = mockFetchOnce(200, { data: [], meta: { count: 33084 } });

    const { hasMore, total } = await searchRescueGroupsDogs({ page: 1, limit: 12 });

    const url = fetchMock.mock.calls[0][0] as string;
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(url).toContain("limit=12");
    expect(url).toContain("page=1");
    expect(body.data.filterRadius).toBeUndefined();
    expect(total).toBe(33084);
    expect(hasMore).toBe(true); // 1 * 12 < 33084
  });

  it("with zip → filterRadius included in the request body", async () => {
    const fetchMock = mockFetchOnce(200, { data: [], meta: { count: 5 } });

    await searchRescueGroupsDogs({ zip: "10001", radius: 50, page: 1, limit: 12 });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.data.filterRadius).toEqual({ miles: 50, postalcode: "10001" });
  });
});

describe("searchRescueGroupsDogs — filters", () => {
  it("sends breed/age/size under data.filters (the key RescueGroups honors)", async () => {
    const fetchMock = mockFetchOnce(200, { data: [], meta: { count: 0 } });

    await searchRescueGroupsDogs({
      breed: "Labrador",
      ageGroup: "Senior",
      sizeGroup: "Small",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    // RG ignores `filterFields`; the correct key is `filters`.
    expect(body.data.filterFields).toBeUndefined();
    expect(body.data.filters).toEqual(
      expect.arrayContaining([
        { fieldName: "animals.breedPrimary", operation: "contains", criteria: "Labrador" },
        { fieldName: "animals.ageGroup", operation: "equals", criteria: "Senior" },
        { fieldName: "animals.sizeGroup", operation: "equals", criteria: "Small" },
      ]),
    );
  });

  it("omits filters entirely when none are provided", async () => {
    const fetchMock = mockFetchOnce(200, { data: [], meta: { count: 0 } });

    await searchRescueGroupsDogs({ zip: "10001" });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.data.filters).toBeUndefined();
  });
});

describe("getRescueGroupsDog — pictures + orgs", () => {
  it("reads the array-shaped data and returns photos + shelter from included", async () => {
    // RG v5 returns `data` as an array even for a single-animal fetch.
    const fetchMock = mockFetchOnce(200, {
      data: [
        {
          id: "rg-9",
          type: "animals",
          attributes: { name: "Sadie", breedPrimary: "Boxer" },
          relationships: { orgs: { data: [{ id: "org-1", type: "orgs" }] } },
        },
      ],
      included: [
        { id: "pic-1", type: "pictures", attributes: { original: { url: "https://img.test/sadie-1.jpg" } } },
        { id: "pic-2", type: "pictures", attributes: { small: { url: "https://img.test/sadie-2.jpg" } } },
        { id: "org-1", type: "orgs", attributes: { name: "Happy Paws", url: "https://happypaws.org" } },
      ],
    });

    const result = await getRescueGroupsDog("rg-9");

    expect(result?.id).toBe("rg-9");
    expect(result?.raw.animals.name).toBe("Sadie");
    expect(result?.raw.animals.photos).toEqual([
      "https://img.test/sadie-1.jpg",
      "https://img.test/sadie-2.jpg",
    ]);
    expect(result?.raw.shelters?.name).toBe("Happy Paws");
    expect(result?.raw.shelters?.adoptionUrl).toBe("https://happypaws.org");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("include=pictures,orgs");
    expect(calledUrl).not.toContain("include=shelters");
  });

  it("returns null on 404", async () => {
    mockFetchOnce(404, {});
    const result = await getRescueGroupsDog("missing");
    expect(result).toBeNull();
  });
});
