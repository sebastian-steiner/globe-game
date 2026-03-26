/**
 * Ambient type declarations for Playwright e2e tests.
 *
 * `page.evaluate()` callbacks run in the browser, where `window` may carry
 * test-specific properties set by the application or by `page.addInitScript`.
 */
import type { Map as MapLibreMap } from 'maplibre-gl';

interface E2ECountry {
  id: number;
  code: string;
  name: string;
  p1: { x: number; y: number };
  p3: { x: number; y: number };
}

declare global {
  interface Window {
    /** MapLibre map instance exposed by GlobeMap for test access. */
    __maplibreMap?: MapLibreMap;
    /** Override country list injected by Playwright before game init. */
    __e2e_countries__?: E2ECountry[];
  }
}

export {};
