import { test, expect } from "@playwright/test";

test.describe("V1.1.0 unified visual system", () => {
  test("theme switching keeps text and surfaces legible on desktop and mobile", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator(".brand-copy strong").first()).toContainText("VietWards");
    await expect(page.locator(".topbar")).toBeVisible();
    const before = await page.locator("body").evaluate(node => getComputedStyle(node).backgroundColor);
    await page.getByRole("button", { name: "Bật giao diện tối" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    const after = await page.locator("body").evaluate(node => getComputedStyle(node).backgroundColor);
    expect(after).not.toBe(before);
    await expect(page.locator(".bottom-nav")).toHaveCount(1);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Bật giao diện sáng" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("iPhone viewport keeps primary navigation and typography inside screen", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/hoc-dia-ly");
    await expect(page.locator(".bottom-nav")).toBeVisible();
    await expect(page.locator(".edu-tabs")).toBeVisible();
    const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflowing).toBe(false);
    await page.getByRole("button", { name: "Bật giao diện tối" }).click();
    await expect(page.locator(".edu-tabs")).toBeVisible();
  });
});
