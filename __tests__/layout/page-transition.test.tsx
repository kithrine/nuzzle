import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useEffect } from "react";

const mockUsePathname = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ usePathname: mockUsePathname }));

import { PageTransition } from "@/components/layout/PageTransition";

// Counts how many times the child mounts — a remount of the PageTransition
// wrapper (via a changed React key) unmounts + remounts the subtree.
let mountCount = 0;
function Probe() {
  useEffect(() => {
    mountCount += 1;
  }, []);
  return <span>probe</span>;
}

describe("PageTransition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mountCount = 0;
  });

  it("PT-001: does NOT remount children when the path changes within a section (Clerk's multi-step flow)", () => {
    mockUsePathname.mockReturnValue("/login");
    const { rerender } = render(
      <PageTransition>
        <Probe />
      </PageTransition>,
    );
    expect(mountCount).toBe(1);

    // Clerk advances the sign-in flow: /login -> /login/factor-one (password step).
    mockUsePathname.mockReturnValue("/login/factor-one");
    rerender(
      <PageTransition>
        <Probe />
      </PageTransition>,
    );

    // Child must stay mounted so Clerk keeps its in-flight sign-in state.
    expect(mountCount).toBe(1);
  });

  it("PT-002: remounts children on a top-level navigation so the fade still replays", () => {
    mockUsePathname.mockReturnValue("/login");
    const { rerender } = render(
      <PageTransition>
        <Probe />
      </PageTransition>,
    );
    expect(mountCount).toBe(1);

    mockUsePathname.mockReturnValue("/search");
    rerender(
      <PageTransition>
        <Probe />
      </PageTransition>,
    );

    expect(mountCount).toBe(2);
  });
});
