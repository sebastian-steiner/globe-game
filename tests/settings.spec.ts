import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

test.describe('Settings page — navigation', () => {
  test('settings link is visible in the game header', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await expect(page.getByTestId('settings-link')).toBeVisible();
  });

  test('clicking settings link navigates to /settings', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
    await page.getByTestId('settings-link').click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.getByTestId('settings-page')).toBeVisible();
  });

  test('back link navigates back to home', async ({ page }) => {
    await page.goto('/settings');
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Settings page — content', () => {
  test.beforeEach(async ({ page }) => {
    // Clear stored settings
    await page.goto('/settings');
    await page.evaluate(() => localStorage.removeItem('globe-game-settings'));
    await page.reload();
  });

  test('settings page renders heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('all toggles are visible', async ({ page }) => {
    await expect(page.getByTestId('toggle-show-scale')).toBeVisible();
    await expect(page.getByTestId('toggle-show-all-countries')).toBeVisible();
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).toBeVisible();
  });

  test('default toggle states are correct', async ({ page }) => {
    await expect(page.getByTestId('toggle-show-scale')).toBeChecked();
    await expect(page.getByTestId('toggle-show-all-countries')).not.toBeChecked();
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).not.toBeChecked();
  });

  test('reset button is visible', async ({ page }) => {
    await expect(page.getByTestId('btn-reset-settings')).toBeVisible();
  });
});

test.describe('Settings page — toggle interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.evaluate(() => localStorage.removeItem('globe-game-settings'));
    await page.reload();
  });

  test('toggling smooth pan is hidden (not in UI)', async ({ page }) => {
    await expect(page.getByTestId('toggle-smooth-pan')).toHaveCount(0);
  });

  test('toggling show scale changes its state', async ({ page }) => {
    const toggle = page.getByTestId('toggle-show-scale');
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });

  test('toggling show all countries changes its state', async ({ page }) => {
    const toggle = page.getByTestId('toggle-show-all-countries');
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('toggling limit reveal zoom changes its state', async ({ page }) => {
    const toggle = page.getByTestId('toggle-limit-reveal-zoom');
    await expect(toggle).not.toBeChecked();
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('reset button restores defaults after changes', async ({ page }) => {
    // Change all toggles from defaults
    await page.getByTestId('toggle-show-scale').click();
    await page.getByTestId('toggle-show-all-countries').click();
    await page.getByTestId('toggle-limit-reveal-zoom').click();

    await expect(page.getByTestId('toggle-show-scale')).not.toBeChecked();
    await expect(page.getByTestId('toggle-show-all-countries')).toBeChecked();
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).toBeChecked();

    // Reset
    await page.getByTestId('btn-reset-settings').click();

    await expect(page.getByTestId('toggle-show-scale')).toBeChecked();
    await expect(page.getByTestId('toggle-show-all-countries')).not.toBeChecked();
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).not.toBeChecked();
  });
});

test.describe('Settings page — persistence', () => {
  test('settings survive page reload', async ({ page }) => {
    await page.goto('/settings');
    await page.evaluate(() => localStorage.removeItem('globe-game-settings'));
    await page.reload();

    // Toggle limit reveal zoom on
    await page.getByTestId('toggle-limit-reveal-zoom').click();
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).toBeChecked();

    // Verify it's stored
    await page.waitForFunction(() => {
      const raw = localStorage.getItem('globe-game-settings');
      return raw !== null && JSON.parse(raw).limitRevealZoom === true;
    });

    // Reload and wait for the toggle to reflect persisted state
    await page.reload();
    await page.waitForSelector('[data-testid="toggle-limit-reveal-zoom"]');

    // Wait for client hydration to restore the value
    await expect(page.getByTestId('toggle-limit-reveal-zoom')).toBeChecked({ timeout: 10_000 });
    // Others should remain at defaults
    await expect(page.getByTestId('toggle-show-scale')).toBeChecked();
    await expect(page.getByTestId('toggle-show-all-countries')).not.toBeChecked();
  });

  test('settings persist when navigating to game and back', async ({ page }) => {
    await page.goto('/settings');
    await page.evaluate(() => localStorage.removeItem('globe-game-settings'));
    await page.reload();

    // Toggle show all countries on
    await page.getByTestId('toggle-show-all-countries').click();
    await expect(page.getByTestId('toggle-show-all-countries')).toBeChecked();

    // Verify it's stored
    await page.waitForFunction(() => {
      const raw = localStorage.getItem('globe-game-settings');
      return raw !== null && JSON.parse(raw).showAllCountries === true;
    });

    // Navigate back to game
    await page.getByTestId('back-link').click();
    await expect(page).toHaveURL(/\/$/);

    // Navigate back to settings
    await page.getByTestId('settings-link').click();
    await expect(page).toHaveURL(/\/settings/);

    // Should still be checked (wait for hydration)
    await expect(page.getByTestId('toggle-show-all-countries')).toBeChecked({ timeout: 10_000 });
  });
});

test.describe('Settings page — responsive', () => {
  const VIEWPORTS = [
    { name: 'mobile portrait', width: 375, height: 812 },
    { name: 'mobile landscape', width: 812, height: 375 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} (${vp.width}×${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('settings page is fully visible', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByTestId('settings-page')).toBeVisible();
        await expect(page.getByTestId('settings-header')).toBeVisible();
      });

      test('all toggles are visible within viewport', async ({ page }) => {
        await page.goto('/settings');
        await expect(page.getByTestId('toggle-show-scale')).toBeVisible();
        await expect(page.getByTestId('toggle-show-all-countries')).toBeVisible();
        await expect(page.getByTestId('toggle-limit-reveal-zoom')).toBeVisible();
      });

      test('no horizontal overflow', async ({ page }) => {
        await page.goto('/settings');
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        expect(overflow).toBe(false);
      });
    });
  }
});
