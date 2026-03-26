import { test, expect } from '@playwright/test';
import { testCountries, waitForGameReady } from './helpers';

/**
 * Win condition tests use a 3-country override so the test completes quickly
 * without cycling through all ~250 real countries.
 */

/** Start the game then answer N countries with the given button id. */
async function answerAll(
  page: import('@playwright/test').Page,
  count: number,
  btn: 'btn-correct' | 'btn-wrong',
) {
  await page.getByTestId('btn-start').click();
  for (let i = 0; i < count; i++) {
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId(btn).click();
  }
}

test.describe('Win condition', () => {
  test.beforeEach(async ({ page }) => {
    // Inject a small 3-country list before the game initialises
    await page.addInitScript((countries) => {
      (window as any).__e2e_countries__ = countries;
    }, testCountries);

    await page.goto('/');
    await waitForGameReady(page);
  });

  test('win overlay appears after all countries are answered correctly', async ({ page }) => {
    await answerAll(page, testCountries.length, 'btn-correct');
    await expect(page.getByTestId('win-overlay')).toBeVisible();
  });

  test('win overlay shows correct total count', async ({ page }) => {
    await answerAll(page, testCountries.length, 'btn-correct');
    await expect(page.getByTestId('win-overlay')).toContainText(String(testCountries.length));
  });

  test('Play Again button is visible on win screen', async ({ page }) => {
    await answerAll(page, testCountries.length, 'btn-correct');
    await expect(page.getByTestId('btn-play-again')).toBeVisible();
  });

  test('Play Again resets remaining count back to total', async ({ page }) => {
    await answerAll(page, testCountries.length, 'btn-correct');
    await page.getByTestId('btn-play-again').click();

    const badge = page.getByTestId('progress-badge');
    const text = await badge.innerText();
    const [left, right] = text.split('/').map((s) => parseInt(s.trim()));
    expect(left).toBe(right);
    expect(left).toBe(testCountries.length);
  });

  test('Play Again returns to idle state (Start button visible)', async ({ page }) => {
    await answerAll(page, testCountries.length, 'btn-correct');
    await page.getByTestId('btn-play-again').click();

    await expect(page.getByTestId('btn-start')).toBeVisible();
    await expect(page.getByTestId('win-overlay')).not.toBeVisible();
  });

  test('win overlay does NOT appear after Wrong (country stays in pool)', async ({ page }) => {
    // Answer all countries wrong — win should never trigger
    await answerAll(page, testCountries.length, 'btn-wrong');
    await expect(page.getByTestId('win-overlay')).not.toBeVisible();
  });
});
