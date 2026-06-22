// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Reveal } from "@/components/Reveal";

let ioCallback: (entries: Array<{ isIntersecting: boolean }>) => void;
const observe = vi.fn();
const disconnect = vi.fn();

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
  setReducedMotion(false);
  class IO {
    constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
      ioCallback = cb;
    }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn();
  }
  vi.stubGlobal("IntersectionObserver", IO);
});

describe("Reveal", () => {
  it("starts hidden (reveal, not reveal-in) and observes the element", () => {
    render(<Reveal>hello</Reveal>);
    const el = screen.getByText("hello");
    expect(el.className).toContain("reveal");
    expect(el.className).not.toContain("reveal-in");
    expect(observe).toHaveBeenCalled();
  });

  it("fades in when it enters and back out when it leaves the viewport (both directions)", () => {
    render(<Reveal>hello</Reveal>);
    const el = screen.getByText("hello");

    act(() => ioCallback([{ isIntersecting: true }]));
    expect(el.className).toContain("reveal-in");

    act(() => ioCallback([{ isIntersecting: false }]));
    expect(el.className).not.toContain("reveal-in");
  });

  it("renders visible immediately under prefers-reduced-motion (no observer)", () => {
    setReducedMotion(true);
    render(<Reveal>reduced</Reveal>);
    const el = screen.getByText("reduced");
    expect(el.className).toContain("reveal-in");
    expect(observe).not.toHaveBeenCalled();
  });
});
