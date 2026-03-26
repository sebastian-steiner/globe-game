import { test, expect } from '@playwright/test';
import { waitForGameReady } from './helpers';

test.describe('Game flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);
  });

  test('clicking Start hides Start button and shows Reveal button', async ({ page }) => {
    await page.getByTestId('btn-start').click();

    await expect(page.getByTestId('btn-start')).not.toBeVisible();
    await expect(page.getByTestId('btn-reveal')).toBeVisible();
  });

  test('solution strip shows "Country hidden" after Start', async ({ page }) => {
    await page.getByTestId('btn-start').click();

    const strip = page.getByTestId('solution-strip');
    await expect(strip).toContainText('Country hidden');
  });

  test('country name is not shown before Reveal', async ({ page }) => {
    await page.getByTestId('btn-start').click();

    await expect(page.getByTestId('country-name')).not.toBeVisible();
  });

  test('clicking Reveal shows the country name', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();

    await expect(page.getByTestId('country-name')).toBeVisible();
    const name = await page.getByTestId('country-name').innerText();
    expect(name.trim().length).toBeGreaterThan(0);
  });

  test('clicking Reveal shows Correct and Wrong buttons', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();

    await expect(page.getByTestId('btn-correct')).toBeVisible();
    await expect(page.getByTestId('btn-wrong')).toBeVisible();
  });

  test('clicking Reveal hides the Reveal button', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();

    await expect(page.getByTestId('btn-reveal')).not.toBeVisible();
  });

  test('solution strip shows country name and "Showing" label after Reveal', async ({ page }) => {
    await page.getByTestId('btn-start').click();
    await page.getByTestId('btn-reveal').click();

    const strip = page.getByTestId('solution-strip');
    await expect(strip).toContainText('Showing');
  });
});
