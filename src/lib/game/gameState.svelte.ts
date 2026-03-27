import { asset } from '$app/paths';
import type { Continent, Country } from '$lib/data';
import maplibregl from 'maplibre-gl';

export class GameState {
  countries = $state<Country[]>([]);
  continents = $state<Continent[]>([]);
  remainings = $state<number[]>([]);
  currentIndex = $state(-1);
  showAll = $state(true);
  won = $state(false);
  selectingContinent = $state(false);
  total = $state<number>(0);
  continent = $state<string | undefined>(undefined);

  /** Settings */
  smoothPan = $state(false);
  showScale = $state(true);
  limitRevealZoom = $state(false);

  /**
   * Number of zoom levels to pull back when limitRevealZoom is on.
   * Applied after fitBounds so the country is shown with surrounding context.
   */
  private readonly REVEAL_ZOOM_OUT_DELTA = 2;

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

  get isSelectingContinent(): boolean {
    return this.selectingContinent;
  }

  async getCountries(): Promise<Country[]> {
    const res = await fetch(asset('/data/countries.json'));
    return (await res.json()) as Country[];
  }

  async getContinents() {
    const res = await fetch(asset('/data/continents.json'));
    return (await res.json()) as Continent[];
  }

  async init() {
    if (this.countries.length > 0) return;
    // Allow Playwright e2e tests to inject a small country list via window.__e2e_countries__
    const overrideCountries = (typeof window !== 'undefined' && window.__e2e_countries__) || null;
    const overrideContinents = (typeof window !== 'undefined' && window.__e2e_continents__) || null;
    this.countries = overrideCountries ?? (await this.getCountries());
    this.continents = overrideContinents ?? (await this.getContinents());
    this.remainings = Array.from(this.countries.keys());
    this.total = this.countries.length;
  }

  private panToCountry(c: Country) {
    if (!c.code || !this.map) return;
    const bounds: [number, number, number, number] = [c.p1.x, c.p1.y, c.p3.x, c.p3.y];
    const opts: maplibregl.FitBoundsOptions = { duration: 0 };
    if (this.smoothPan) {
      delete opts.duration;
    }
    this.map.fitBounds(bounds, opts);
  }

  /** Zoom out by the reveal delta so the country is shown with surrounding context. */
  private zoomOutForReveal() {
    if (!this.map) return;
    const currentZoom = this.map.getZoom();
    const targetZoom = Math.max(0, currentZoom - this.REVEAL_ZOOM_OUT_DELTA);
    this.map.setZoom(targetZoom);
  }

  private pickRandom() {
    const idx = this.remainings[Math.floor(Math.random() * this.remainings.length)];
    if (idx === undefined) return;
    this.currentIndex = idx;
    this.panToCountry(this.countries[idx]!);
  }

  start() {
    this.showAll = false;
    this.pickRandom();
  }

  reveal() {
    this.showAll = true;
    if (this.limitRevealZoom) {
      this.zoomOutForReveal();
    }
  }

  /** Reset the view to the current country bounds (or initial zoom if idle). */
  resetView() {
    if (!this.map) return;
    if (this.currentIndex >= 0) {
      this.panToCountry(this.country);
    } else {
      this.map.flyTo({ center: [0, 20], zoom: 1.5, duration: 0 });
    }
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
    this.continent = undefined;
    this.total = this.countries.length;
    this.remainings = Array.from(this.countries.keys());
    this.showAll = true;
    this.won = false;
  }

  selectContinent(continent: Continent | undefined) {
    this.selectingContinent = false;
    if (continent == undefined) {
      this.remainings = Array.from(this.countries.keys());
      this.total = this.countries.length;
      this.continent = undefined;
      return;
    }
    // find country ids that are part of the continent
    const ids = [];
    for (let i = 0; i < this.countries.length; i++) {
      const country = this.countries[i];
      if (country?.code && continent.countries.indexOf(country.code) != -1) {
        ids.push(i);
      }
    }
    this.remainings = ids;
    this.total = ids.length;
    this.continent = continent.name;
  }

  gotoSelectContinent() {
    this.selectingContinent = true;
  }
}
