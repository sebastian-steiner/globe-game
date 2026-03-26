/**
 * Shared Playwright test fixtures and helpers for the Globe Game.
 */
import type { Page } from '@playwright/test';
import type { Country } from '../src/lib/data';

/** A minimal 3-country dataset for use in e2e tests requiring small state. */
export const testCountries: Country[] = [
  {
    id: 1,
    code: 'DEU',
    name: 'Germany',
    p1: { x: 5.98865807458, y: 47.3024876979 },
    p3: { x: 15.0169958839, y: 54.983104153 },
  },
  {
    id: 2,
    code: 'FRA',
    name: 'France',
    p1: { x: -4.7923549844, y: 42.3327395208 },
    p3: { x: 7.6168091017, y: 51.0891588622 },
  },
  {
    id: 3,
    code: 'ESP',
    name: 'Spain',
    p1: { x: -9.3922226679, y: 35.9467208793 },
    p3: { x: 4.3277519938, y: 43.7483377142 },
  },
];

/**
 * Wait for `onMount` / `game.init()` to complete.
 * We know it's done when the progress badge shows "N / N remaining" with N > 0.
 */
export async function waitForGameReady(page: Page) {
  await page.waitForFunction(() => {
    const badge = document.querySelector('[data-testid="progress-badge"]');
    if (!badge) return false;
    const text = badge.textContent ?? '';
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return false;
    const n = parseInt(match[1]);
    return n > 0;
  });
}

/**
 * Inject a small country list into the page before the game initialises.
 * Call this in `page.addInitScript` to override the default ~250-country set.
 */
export function injectTestCountries(countries: Country[]) {
  return { countries };
}
