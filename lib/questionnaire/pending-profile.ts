// Holds an anonymous user's Phase-1 answers across the sign-up redirect so the
// profile can be created once they have an account (questionnaire-first flow).
export type PendingProfile = {
  homeType: string;
  hasChildren: boolean;
  hasCats: boolean;
  hasOtherDogs: boolean;
  activityLevel: string;
  experienceLevel: string;
};

const KEY = "nuzzle:pendingProfile";

export function savePendingProfile(profile: PendingProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable (private mode / quota) — non-fatal.
  }
}

export function loadPendingProfile(): PendingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingProfile;
  } catch {
    return null;
  }
}

export function clearPendingProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
