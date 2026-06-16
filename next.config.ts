import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Playwright drives the dev server via http://127.0.0.1:3000 (see playwright.config.ts).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
