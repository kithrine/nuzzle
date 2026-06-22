import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// Capture the props Clerk's components are rendered with.
const captured = vi.hoisted(() => ({
  signUp: null as Record<string, unknown> | null,
  signIn: null as Record<string, unknown> | null,
}));

vi.mock("@clerk/nextjs", () => ({
  SignUp: (props: Record<string, unknown>) => {
    captured.signUp = props;
    return <div data-testid="sign-up" />;
  },
  SignIn: (props: Record<string, unknown>) => {
    captured.signIn = props;
    return <div data-testid="sign-in" />;
  },
}));

// next/image renders fine in jsdom, but stub it to a plain img to keep the test focused.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as Record<string, never>)} />;
  },
}));

import SignupPage from "@/app/signup/[[...signup]]/page";
import LoginPage from "@/app/login/[[...login]]/page";

describe("auth page redirects", () => {
  beforeEach(() => {
    captured.signUp = null;
    captured.signIn = null;
  });

  it("AUTH-RED-001: sign-up always redirects to the questionnaire after account creation", () => {
    render(<SignupPage />);
    expect(captured.signUp?.forceRedirectUrl).toBe("/questionnaire");
  });

  it("AUTH-RED-002: sign-in falls back to /search after login", () => {
    render(<LoginPage />);
    expect(captured.signIn?.fallbackRedirectUrl).toBe("/search");
  });
});
