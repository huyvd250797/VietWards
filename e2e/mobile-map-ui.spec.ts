import { test, expect } from "@playwright/test";

// An actual-browser smoke test for the mobile-first interaction contract.
test("V1.0.1 mobile province selection leaves the map unobstructed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ban-do");
  await page.locator(".gis-mobile-list-trigger").first().click();
  await page.locator('[data-province-code="75"]').first().click();
  await expect(page.locator(".gis-mobile-selection-bar")).toBeVisible();
  await expect(page.locator(".gis-info-panel.has-selection")).toBeHidden();
  await expect(page.locator(".gis-map-canvas")).toBeVisible();
  await page.locator(".gis-mobile-view-detail").click();
  const dialog = page.getByRole("dialog", { name: /Chi tiết.*Đồng Nai/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".gis-mobile-modal-header h2")).toContainText("Đồng Nai");
  await expect(dialog.getByRole("button", { name: /Xem xã\/phường trên bản đồ/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator(".gis-map-canvas")).toBeVisible();
});

test("V1.0.1 mobile province details transition to ward map", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ban-do");
  await page.locator(".gis-mobile-list-trigger").first().click();
  await page.locator('[data-province-code="75"]').first().click();
  await page.locator(".gis-mobile-view-detail").click();
  await page.getByRole("dialog").getByRole("button", { name: /Xem xã\/phường trên bản đồ/ }).click();
  await expect(page.locator(".commune-workbench")).toBeVisible();
  await expect(page.locator(".gis-detail-open")).toHaveCount(0);
});

test("V1.0.1 dark-mode statistics text stays readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ban-do");
  await page.getByRole("button", { name: /Bật giao diện tối/ }).click();
  await page.locator(".gis-mobile-list-trigger").first().click();
  await page.locator('[data-province-code="75"]').first().click();
  await page.locator(".gis-mobile-view-detail").click();
  const metric = page.locator(".verified-metric").first();
  await expect(metric.locator("strong")).toContainText("km²");
  const ratio = await metric.evaluate(element => {
    const parse = (color: string): number[] => color.match(/[\d.]+/g)?.slice(0,3).map(Number) ?? [0,0,0];
    const text = parse(getComputedStyle(element.querySelector('strong')!).color);
    const background = parse(getComputedStyle(element).backgroundColor);
    const luminance = (rgb: number[]) => rgb.map(v=>{
      const n=v/255;
      return n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4);
    }).reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
    const a=luminance(text),b=luminance(background);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  });
  expect(ratio).toBeGreaterThanOrEqual(4.5);
  await expect(page.locator(".verified-plate-chip").first()).toBeVisible();
});
