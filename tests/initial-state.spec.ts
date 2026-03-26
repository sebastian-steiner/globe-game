import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

test.describe('Initial state', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
  });

  test('page title is "Country Guesser"', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Country Guesser' })).toBeVisible();
  });

  test('progress badge shows N / N remaining', async ({ page }) => {
    const badge = page.getByTestId('progress-badge');
    await expect(badge).toBeVisible();
    // Pattern: "253 / 253 remaining" — both numbers should be equal on fresh load
    await expect(badge).toContainText('remaining');
    const text = await badge.innerText();
    const [left, right] = text.split('/').map((s) => parseInt(s.trim()));
    expect(left).toBe(right);
    expect(left).toBeGreaterThan(0);
  });

  test('globe region is visible', async ({ page }) => {
    await expect(page.getByTestId('globe-region')).toBeVisible();
  });

  test('solution strip shows "Press Start to begin"', async ({ page }) => {
    const strip = page.getByTestId('solution-strip');
    await expect(strip).toBeVisible();
    await expect(strip).toContainText('Start');
  });

  test('Start button is visible', async ({ page }) => {
    await expect(page.getByTestId('btn-start')).toBeVisible();
  });

  test('Reveal, Correct and Wrong buttons are NOT visible initially', async ({ page }) => {
    await expect(page.getByTestId('btn-reveal')).not.toBeVisible();
    await expect(page.getByTestId('btn-correct')).not.toBeVisible();
    await expect(page.getByTestId('btn-wrong')).not.toBeVisible();
  });

  test('country name is not revealed', async ({ page }) => {
    await expect(page.getByTestId('country-name')).not.toBeVisible();
  });
});
