import { test, expect } from "@playwright/test";

// An actual-browser smoke test for the mobile-first interaction contract.
test("V1.0.3 mobile province selection leaves the map unobstructed", async ({ page }) => {
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

test("V1.0.3 mobile province details transition to ward map", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ban-do");
  await page.locator(".gis-mobile-list-trigger").first().click();
  await page.locator('[data-province-code="75"]').first().click();
  await page.locator(".gis-mobile-view-detail").click();
  await page.getByRole("dialog").getByRole("button", { name: /Xem xã\/phường trên bản đồ/ }).click();
  await expect(page.locator(".commune-workbench")).toBeVisible();
  await expect(page.locator(".gis-detail-open")).toHaveCount(0);
});

test("V1.0.3 dark-mode statistics text stays readable", async ({ page }) => {
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

test("V1.0.3 fullscreen map retains visible detail action and native PWA scale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ban-do");
  const viewport=page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveAttribute("content", /user-scalable=no/);
  const fullscreen=page.getByRole("button", {name:"Mở bản đồ toàn màn hình"}).first();
  await fullscreen.click();
  await expect(page.locator(".gis-map-column.is-map-fullscreen")).toBeVisible();
  await expect(page.getByRole("button", {name:"Thoát bản đồ toàn màn hình"})).toBeVisible();
  // A list stays above the map when opened from fullscreen.
  await page.locator(".gis-mobile-list-trigger").first().click();
  await expect(page.locator(".gis-region-panel.gis-list-open")).toBeVisible();
  await page.locator('[data-province-code="75"]').first().click();
  const detail=page.locator(".gis-mobile-view-detail").first();
  await expect(detail).toBeVisible();
  const rect=await detail.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(844);
  await detail.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".gis-map-column.is-map-fullscreen")).toBeVisible();
  await page.getByRole("button",{name:"Thoát bản đồ toàn màn hình"}).click();
  await expect(page.locator(".gis-map-column.is-map-fullscreen")).toHaveCount(0);
});
