import { browser } from '$app/environment';

const STORAGE_KEY = 'globe-game-settings';

export interface Settings {
  /** Animate pan/zoom when moving to a new country. */
  smoothPan: boolean;
  /** Show the map scale control on the globe. */
  showScale: boolean;
  /** Always show all countries (green overlay) behind the highlighted one. */
  showAllCountries: boolean;
  /** Zoom out on reveal so the country is shown in surrounding context. */
  limitRevealZoom: boolean;
}

const DEFAULTS: Settings = {
  smoothPan: false,
  showScale: true,
  showAllCountries: false,
  limitRevealZoom: false,
};

function loadFromStorage(): Settings {
  if (!browser) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULTS };
    const obj = parsed as Record<string, unknown>;
    return {
      smoothPan: typeof obj['smoothPan'] === 'boolean' ? obj['smoothPan'] : DEFAULTS.smoothPan,
      showScale: typeof obj['showScale'] === 'boolean' ? obj['showScale'] : DEFAULTS.showScale,
      showAllCountries:
        typeof obj['showAllCountries'] === 'boolean'
          ? obj['showAllCountries']
          : DEFAULTS.showAllCountries,
      limitRevealZoom:
        typeof obj['limitRevealZoom'] === 'boolean'
          ? obj['limitRevealZoom']
          : DEFAULTS.limitRevealZoom,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveToStorage(s: Settings): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Silently ignore storage errors (e.g. quota exceeded, private mode)
  }
}

function createSettingsStore() {
  let smoothPan = $state(DEFAULTS.smoothPan);
  let showScale = $state(DEFAULTS.showScale);
  let showAllCountries = $state(DEFAULTS.showAllCountries);
  let limitRevealZoom = $state(DEFAULTS.limitRevealZoom);

  function persist() {
    saveToStorage({ smoothPan, showScale, showAllCountries, limitRevealZoom });
  }

  /**
   * Hydrate from localStorage.
   * Called explicitly from components via `settings.load()` inside onMount
   * so that it runs after client-side hydration and properly triggers
   * Svelte's reactivity to update the DOM.
   */
  function load() {
    if (!browser) return;
    const saved = loadFromStorage();
    smoothPan = saved.smoothPan;
    showScale = saved.showScale;
    showAllCountries = saved.showAllCountries;
    limitRevealZoom = saved.limitRevealZoom;
  }

  return {
    /** Hydrate settings from localStorage. Call in onMount(). */
    load,

    get smoothPan() {
      return smoothPan;
    },
    set smoothPan(v: boolean) {
      smoothPan = v;
      persist();
    },

    get showScale() {
      return showScale;
    },
    set showScale(v: boolean) {
      showScale = v;
      persist();
    },

    get showAllCountries() {
      return showAllCountries;
    },
    set showAllCountries(v: boolean) {
      showAllCountries = v;
      persist();
    },

    get limitRevealZoom() {
      return limitRevealZoom;
    },
    set limitRevealZoom(v: boolean) {
      limitRevealZoom = v;
      persist();
    },

    /** Reset all settings to defaults. */
    reset() {
      smoothPan = DEFAULTS.smoothPan;
      showScale = DEFAULTS.showScale;
      showAllCountries = DEFAULTS.showAllCountries;
      limitRevealZoom = DEFAULTS.limitRevealZoom;
      persist();
    },
  };
}

export const settings = createSettingsStore();
