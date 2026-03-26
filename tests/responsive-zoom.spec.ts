import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

/**
 * Responsive zoom tests — verifies the globe map zoom level adapts to
 * different viewport sizes and that the user can still interact with
 * the map (pan / zoom) after the responsive zoom is applied.
 *
 * The zoom formula is: BASE_ZOOM (1.5) + log2(minDim / 393)
 */

const BASE_ZOOM = 1.5;
const REF_DIM = 393;

/** Expected zoom for a given viewport, matching the component logic. */
function expectedZoom(width: number, height: number): number {
  const minDim = Math.min(width, height);
  if (minDim <= 0) return BASE_ZOOM;
  return BASE_ZOOM + Math.log2(minDim / REF_DIM);
}

/**
 * Wait until `window.__maplibreMap` is available (set by GlobeMap on load).
 * Returns once map is idle so zoom reading is stable.
 */
async function waitForMap(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => !!window.__maplibreMap,
    { timeout: 15_000 },
  );
}

/** Read the current map zoom via the exposed window.__maplibreMap. */
async function getMapZoom(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() => {
    const map = window.__maplibreMap;
    if (!map) throw new Error('Map instance not found on window');
    return map.getZoom();
  });
}

const VIEWPORTS = [
  { name: 'small phone', width: 320, height: 568 },
  { name: 'iPhone 17 Pro (reference)', width: 393, height: 852 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'desktop full-HD', width: 1920, height: 1080 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive zoom — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('zoom level is appropriate for viewport size', async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
      await waitForMap(page);
      // Allow zoom animation to settle
      await page.waitForTimeout(500);

      const zoom = await getMapZoom(page);
      const expected = expectedZoom(vp.width, vp.height);

      // The actual zoom should be within ±0.4 of our expected value.
      // There's some tolerance because the globe-region is smaller than the full
      // viewport (header + solution strip + action bar take space).
      expect(zoom).toBeGreaterThan(expected - 0.4);
      expect(zoom).toBeLessThan(expected + 0.4);
    });
  });
}

test.describe('Responsive zoom — scaling', () => {
  test('larger viewport produces higher zoom than smaller viewport', async ({ browser }) => {
    const small = await browser.newContext({ viewport: { width: 320, height: 568 } });
    const large = await browser.newContext({ viewport: { width: 1920, height: 1080 } });

    const smallPage = await small.newPage();
    const largePage = await large.newPage();

    await Promise.all([smallPage.goto('/'), largePage.goto('/')]);
    await Promise.all([waitForGameReady(smallPage), waitForGameReady(largePage)]);
    await Promise.all([waitForMap(smallPage), waitForMap(largePage)]);
    await Promise.all([smallPage.waitForTimeout(500), largePage.waitForTimeout(500)]);

    const smallZoom = await getMapZoom(smallPage);
    const largeZoom = await getMapZoom(largePage);

    expect(largeZoom).toBeGreaterThan(smallZoom);

    await small.close();
    await large.close();
  });

  test('zoom updates after viewport resize', async ({ page }) => {
    // Start at tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await waitForGameReady(page);
    await waitForMap(page);
    await page.waitForTimeout(500);

    const zoomBefore = await getMapZoom(page);

    // Resize to a much smaller viewport
    await page.setViewportSize({ width: 320, height: 568 });

    // Wait for the resize effect to apply
    await page.waitForTimeout(1000);

    const zoomAfter = await getMapZoom(page);

    // Zoom should decrease after shrinking the viewport
    expect(zoomAfter).toBeLessThan(zoomBefore);
  });
});

test.describe('Responsive zoom — user interaction', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('user can zoom in via scroll wheel', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await waitForMap(page);
    await page.waitForTimeout(500);

    const zoomBefore = await getMapZoom(page);

    // Scroll-zoom on the canvas
    const canvas = page.locator('.maplibregl-canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;

    // Scroll up = zoom in (negative deltaY in MapLibre)
    await page.mouse.move(cx, cy);
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -120);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);

    const zoomAfter = await getMapZoom(page);

    // User should be able to zoom in beyond the initial level
    expect(zoomAfter).toBeGreaterThan(zoomBefore);
  });

  test('user can pan/drag the globe', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await waitForMap(page);
    await page.waitForTimeout(500);

    // Get center before drag
    const centerBefore = await page.evaluate(() => {
      const map = window.__maplibreMap;
      if (!map) throw new Error('Map instance not found on window');
      const c = map.getCenter();
      return { lng: c.lng, lat: c.lat };
    });

    // Drag across the canvas
    const canvas = page.locator('.maplibregl-canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const startX = box!.x + box!.width / 2;
    const startY = box!.y + box!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // Drag 100px to the right
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(startX + (i + 1) * 10, startY);
      await page.waitForTimeout(30);
    }
    await page.mouse.up();
    await page.waitForTimeout(500);

    const centerAfter = await page.evaluate(() => {
      const map = window.__maplibreMap;
      if (!map) throw new Error('Map instance not found on window');
      const c = map.getCenter();
      return { lng: c.lng, lat: c.lat };
    });

    // The center longitude should have changed after dragging
    expect(centerAfter.lng).not.toBeCloseTo(centerBefore.lng, 1);
  });
});
