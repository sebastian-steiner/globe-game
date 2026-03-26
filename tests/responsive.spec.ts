import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

/**
 * Responsive layout tests — all UI strips must be visible at mobile sizes
 * with no overflow scroll.
 */

const VIEWPORTS = [
  { name: 'mobile portrait', width: 375, height: 812 },
  { name: 'mobile landscape', width: 812, height: 375 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await waitForGameReady(page);
    });

    test('header is visible', async ({ page }) => {
      await expect(page.getByTestId('game-header')).toBeVisible();
    });

    test('globe region is visible', async ({ page }) => {
      await expect(page.getByTestId('globe-region')).toBeVisible();
    });

    test('solution strip is visible', async ({ page }) => {
      await expect(page.getByTestId('solution-strip')).toBeVisible();
    });

    test('action bar is visible', async ({ page }) => {
      await expect(page.getByTestId('action-bar')).toBeVisible();
    });

    test('no horizontal overflow scroll on body', async ({ page }) => {
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // allow 1px rounding
    });

    test('globe region has positive height', async ({ page }) => {
      const box = await page.getByTestId('globe-region').boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThan(50);
    });

    test('all four sections fit within viewport height without scrolling', async ({ page }) => {
      const header = await page.getByTestId('game-header').boundingBox();
      const actionBar = await page.getByTestId('action-bar').boundingBox();

      expect(header).not.toBeNull();
      expect(actionBar).not.toBeNull();

      // Header starts at top
      expect(header!.y).toBeGreaterThanOrEqual(0);

      // Action bar bottom edge is within viewport
      const barBottom = actionBar!.y + actionBar!.height;
      expect(barBottom).toBeLessThanOrEqual(vp.height + 2); // 2px rounding tolerance
    });
  });
}
