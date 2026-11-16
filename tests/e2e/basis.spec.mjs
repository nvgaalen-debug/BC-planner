import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => { await request.post("/__test/reset"); });

test("planner toont resources en ongepland werk", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".brand")).toHaveText("BC Resource Planner");
  await expect(page.locator("table.plan tbody tr th.res")).toHaveCount(5);
  await expect(page.locator(".ong .taak").first()).toBeVisible();
});

test("taak slepen naar een cel plant de taak in en blijft na herladen staan", async ({ page }) => {
  await page.goto("/");
  // Serre ontwerp (Ontwerp) naar Lisa (Ontwerp), maandag
  const cel = page.locator('td.cel[data-res="r1"]').nth(0);
  await page.locator('.ong .taak:has-text("Serre ontwerp")').dragTo(cel);
  await expect(cel.locator(".blk")).toHaveCount(1);
  await page.reload();
  await expect(page.locator('td.cel[data-res="r1"]').nth(0).locator(".blk")).toHaveCount(1);
});

test("Beheer-menu is gewoon zichtbaar zonder BEHEER_WACHTWOORD", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-act="navg"]');
  await expect(page.locator('[data-to="tab:instellingen"]')).toBeVisible();
});
