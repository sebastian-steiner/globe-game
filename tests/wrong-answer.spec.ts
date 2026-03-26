import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

/** Parse "X / Y remaining" → X */
async function getRemaining(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.getByTestId('progress-badge').innerText();
  return parseInt(text.trim().split('/')[0]?.trim() ?? '0');
}

test.describe('Wrong answer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
  });

  test('remaining count does NOT change after clicking Wrong', async ({ page }) => {
    const before = await getRemaining(page);

    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-wrong').click();

    const after = await getRemaining(page);
    expect(after).toBe(before);
  });

  test('solution resets to hidden after clicking Wrong', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-wrong').click();

    await expect(page.getByTestId('country-name')).not.toBeVisible();
  });

  test('Reveal button appears again for the next country after Wrong', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-wrong').click();

    await expect(page.getByTestId('btn-reveal')).toBeVisible();
  });

  test('multiple wrong answers keep the same remaining count', async ({ page }) => {
    const before = await getRemaining(page);

    // Start once; Wrong internally calls start() to pick a new country each time
    await page.getByTestId('btn-start').click();
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('btn-reveal').click();
      await page.getByTestId('btn-wrong').click();
    }

    const after = await getRemaining(page);
    expect(after).toBe(before);
  });
});
