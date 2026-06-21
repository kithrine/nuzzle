import type { NormalizedDog } from "@/lib/compatibility/types";

export interface SearchDogsParams {
  zip?: string;
  radius?: number;
  page?: number;
  limit?: number;
  breed?: string;
  ageGroup?: string;
  sizeGroup?: string;
}

export interface PetProvider {
  searchDogs(params: SearchDogsParams): Promise<NormalizedDog[]>;
  getDogById(provider: string, externalId: string): Promise<NormalizedDog | null>;
}
