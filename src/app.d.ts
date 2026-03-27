// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Continent, Country } from '$lib/data';

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  /** E2E test hooks exposed on window. */
  interface Window {
    /** MapLibre map instance, set by GlobeMap for e2e test access. */
    __maplibreMap?: MapLibreMap;
    /** Override country list injected by Playwright tests. */
    __e2e_countries__?: Country[];
    __e2e_continents__?: Continent[];
  }
}

export {};
