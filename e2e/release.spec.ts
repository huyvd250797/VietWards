import { test, expect } from "@playwright/test";

test("V1.1.2: roadmap and version are consistent", async ({ page }) => {
  await page.goto("/gioi-thieu");
  await expect(page.locator(".roadmap-list").first().getByText("V1.0.0")).toBeVisible();
  await expect(page.locator(".roadmap-list").first().locator(".roadmap-row")).toHaveCount(10);
  await expect(page.locator(".roadmap-list").nth(1).locator(".roadmap-row")).toHaveCount(11);
  await expect(page.locator(".roadmap-row").filter({ hasText: "V0.8.0" })).toHaveCount(1);
  await expect(page.locator(".roadmap-row").filter({ hasText: "V0.9.0" })).toHaveCount(1);
  await expect(page.getByText("CHƯA ĐỦ GIS LỊCH SỬ")).toBeVisible();
});

test("V1.1.2: runtime status shows both catalogs and unfinished historical geometry", async ({ page }) => {
  const response = await page.request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.version).toBe("1.1.2");
  expect(payload.checks.provinceCatalog).toMatchObject({ current: 34, before: 63 });
  expect(payload.checks.provincialStatistics).toMatchObject({ current: 34, before: 63 });
  expect(payload.checks.historicalGISManifest.verifiedProvinces).toBe(0);
  expect(payload.checks.externalGISRuntime.checked).toBe(false);
  expect(response.headers()["cache-control"]).toContain("no-store");
  await page.goto("/trang-thai");
  await expect(page.getByRole("heading", { name: "Trạng thái VietWards" })).toBeVisible();
  await expect(page.getByText("0/63")).toBeVisible();
});

test("V1.1.2: mobile status, skip navigation, and friendly 404", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trang-thai");
  await expect(page.locator(".vw-skip-link")).toHaveAttribute("href", "#main-content");
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
  await page.goto("/there-is-no-such-route-vietwards");
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Trang chủ/ })).toBeVisible();
});
