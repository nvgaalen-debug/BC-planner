import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => { await request.post("/__test/reset"); });

test("planner toont resources en ongepland werk", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".brand")).toHaveText("BC Resource Planner");
  await expect(page.locator("table.plan tbody tr th.res")).toHaveCount(4);
  await expect(page.locator(".ong .taak").first()).toBeVisible();
});

test("taak slepen naar een cel plant de taak in en blijft na herladen staan", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator(".ong .taak").count();
  // Sanne (Development) heeft vrijdag geen werk: sleep het Testen-blok daarheen
  const cel = page.locator('td.cel[data-res="r4"]').nth(4);
  await page.locator('.ong .taak:has-text("Testen")').dragTo(cel);
  await expect(cel.locator(".blk")).toHaveCount(1);
  await page.reload();
  await expect(page.locator('td.cel[data-res="r4"]').nth(4).locator(".blk")).toHaveCount(1);
  expect(await page.locator(".ong .taak").count()).toBeLessThanOrEqual(before);
});

test("Beheer-menu is gewoon zichtbaar zonder BEHEER_WACHTWOORD", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-act="navg"]');
  await expect(page.locator('[data-to="tab:instellingen"]')).toBeVisible();
});
