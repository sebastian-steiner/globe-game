import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

/** Parse "X / Y remaining" → X */
async function getRemaining(page: import('@playwright/test').Page): Promise<number> {
  const text = await page.getByTestId('progress-badge').innerText();
  return parseInt(text.trim().split('/')[0].trim());
}

test.describe('Correct answer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
  });

  test('remaining count decreases by 1 after clicking Correct', async ({ page }) => {
    const before = await getRemaining(page);

    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-correct').click();

    const after = await getRemaining(page);
    expect(after).toBe(before - 1);
  });

  test('solution resets to hidden after clicking Correct', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-correct').click();

    await expect(page.getByTestId('country-name')).not.toBeVisible();
  });

  test('Reveal button appears again for the next country after Correct', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();
    await page.getByTestId('btn-correct').click();

    await expect(page.getByTestId('btn-reveal')).toBeVisible();
  });

  test('multiple correct answers accumulate remaining count', async ({ page }) => {
    const before = await getRemaining(page);

    // First click: use Start button; subsequent clicks: Correct already advances the game
    await page.getByTestId('btn-start').click();
    for (let i = 0; i < 3; i++) {
      await page.getByTestId('btn-reveal').click();
      await page.getByTestId('btn-correct').click();
    }

    const after = await getRemaining(page);
    expect(after).toBe(before - 3);
  });
});
