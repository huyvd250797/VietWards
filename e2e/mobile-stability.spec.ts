import { test, expect } from "@playwright/test";

// True layout/interaction regression tests, run by CI after Next.js starts.
test.describe("V1.0.3 iPhone-style mobile viewport", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("compact header, no sideways scroll, and map-first controls", async ({ page }) => {
    await page.goto("/ban-do");
    const header = page.locator(".topbar");
    await expect(header).toBeVisible();
    await expect(page.locator(".gis-map-canvas")).toBeVisible();
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflows).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 180));
    await expect(header).toHaveClass(/topbar-condensed/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/topbar-condensed/);
  });

  test("fullscreen preserves scroll on exit, detail remains opt-in", async ({ page }) => {
    await page.goto("/ban-do");
    const trigger = page.getByRole("button", { name: "Mở bản đồ toàn màn hình" }).first();
    await trigger.scrollIntoViewIfNeeded();
    const startingY = await page.evaluate(() => window.scrollY);
    await trigger.click();
    await expect(page.locator(".gis-map-column.is-map-fullscreen")).toBeVisible();
    await page.locator(".gis-mobile-list-trigger").first().click();
    await page.locator('[data-province-code="75"]').first().click();
    await expect(page.locator(".gis-info-panel.has-selection")).toBeHidden();
    await page.locator(".gis-mobile-view-detail").click();
    await expect(page.getByRole("dialog", { name: /Chi tiết.*Đồng Nai/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /Chi tiết.*Đồng Nai/ })).toBeHidden();
    await expect(page.locator(".gis-map-column.is-map-fullscreen")).toBeVisible();
    await page.getByRole("button", { name: "Thoát bản đồ toàn màn hình" }).click();
    await expect(page.locator(".gis-map-column.is-map-fullscreen")).toHaveCount(0);
    const endingY = await page.evaluate(() => window.scrollY);
    expect(Math.abs(endingY - startingY)).toBeLessThanOrEqual(3);
  });

  test("mobile navigation drawer locks page and closes by Escape", async ({ page }) => {
    await page.goto("/ban-do");
    await page.getByRole("button", { name: "Mở menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu điều hướng" })).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/vw-overlay-scroll-locked/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu điều hướng" })).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveClass(/vw-overlay-scroll-locked/);
  });
});
