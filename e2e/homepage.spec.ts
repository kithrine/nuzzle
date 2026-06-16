import { test, expect } from "@playwright/test";

test("homepage renders the Nuzzle heading and tagline", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /nuzzle/i })).toBeVisible();
  await expect(
    page.getByText(/find a dog that fits your lifestyle/i),
  ).toBeVisible();
});
