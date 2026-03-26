import type { Country } from '$lib/data';
import maplibregl from 'maplibre-gl';
import { staticCountries } from '$lib/data/countries';

export class GameState {
  countries = $state<Country[]>([]);
  remainings = $state<number[]>([]);
  currentIndex = $state(-1);
  showAll = $state(true);
  won = $state(false);

  /** Settings */
  smoothPan = $state(false);
  showScale = $state(true);

  /** Reference to the MapLibre map instance (set via bind:map on GlobeMap) */
  map = $state.raw<maplibregl.Map | undefined>(undefined);

  readonly emptyCountry: Country = {
    id: 0,
    code: '',
    name: '',
    p1: { x: -1, y: -1 },
    p3: { x: -1, y: -1 },
  };

  get country(): Country {
    if (this.currentIndex < 0) return this.emptyCountry;
    return this.countries[this.currentIndex] ?? this.emptyCountry;
  }

  get idle(): boolean {
    return this.currentIndex < 0 && !this.won;
  }

  get guessing(): boolean {
    return this.currentIndex >= 0 && !this.showAll && !this.won;
  }

  get revealed(): boolean {
    return this.currentIndex >= 0 && this.showAll && !this.won;
  }

  get started(): boolean {
    return this.currentIndex >= 0;
  }

  async init() {
    if (this.countries.length > 0) return;
    // Allow Playwright e2e tests to inject a small country list via window.__e2e_countries__
    const override = (typeof window !== 'undefined' && (window as any).__e2e_countries__) || null;
    this.countries = override ?? staticCountries;
    this.remainings = Array.from(this.countries.keys());
  }

  private panToCountry(c: Country) {
    if (!c.code || !this.map) return;
    const bounds: [number, number, number, number] = [c.p1.x, c.p1.y, c.p3.x, c.p3.y];
    if (this.smoothPan) {
      this.map.fitBounds(bounds);
    } else {
      this.map.fitBounds(bounds, { duration: 0 });
    }
  }

  private pickRandom() {
    const idx = this.remainings[Math.floor(Math.random() * this.remainings.length)];
    this.currentIndex = idx;
    this.panToCountry(this.countries[idx]);
  }

  start() {
    this.showAll = false;
    this.pickRandom();
  }

  reveal() {
    this.showAll = true;
  }

  correct() {
    const pos = this.remainings.indexOf(this.currentIndex);
    if (pos > -1) this.remainings.splice(pos, 1);
    if (this.remainings.length === 0) {
      this.won = true;
      return;
    }
    this.start();
  }

  wrong() {
    this.start();
  }

  reset() {
    this.currentIndex = -1;
    this.remainings = Array.from(this.countries.keys());
    this.showAll = true;
    this.won = false;
  }
}
