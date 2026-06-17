export function track(
  eventName: string,
  eventData: Record<string, unknown> = {},
  anonymousId?: string,
): void {
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, eventData, ...(anonymousId ? { anonymousId } : {}) }),
  }).catch(() => {});
}
