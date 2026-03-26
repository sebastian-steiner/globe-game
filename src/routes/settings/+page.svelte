<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { settings } from '$lib/stores/settings.svelte';

  onMount(() => settings.load());
</script>

<svelte:head><title>Settings — Country Guesser</title></svelte:head>

<header class="game-header" data-testid="settings-header">
  <a href={resolve('/')} class="back-link" data-testid="back-link">← Back</a>
  <h1>Settings</h1>
  <span></span>
</header>

<div class="settings-page" data-testid="settings-page">
  <section class="settings-group">
    <label class="setting-row" data-testid="setting-show-scale">
      <div class="setting-info">
        <span class="setting-label">Show scale</span>
        <span class="setting-desc">Display the map scale control on the globe</span>
      </div>
      <input
        type="checkbox"
        class="toggle"
        bind:checked={settings.showScale}
        data-testid="toggle-show-scale"
      />
    </label>

    <label class="setting-row" data-testid="setting-show-all-countries">
      <div class="setting-info">
        <span class="setting-label">Show all countries</span>
        <span class="setting-desc"
          >Always show every country on the globe behind the highlighted one</span
        >
      </div>
      <input
        type="checkbox"
        class="toggle"
        bind:checked={settings.showAllCountries}
        data-testid="toggle-show-all-countries"
      />
    </label>

    <label class="setting-row" data-testid="setting-limit-reveal-zoom">
      <div class="setting-info">
        <span class="setting-label">Zoom out on reveal</span>
        <span class="setting-desc"
          >Zoom out to show surrounding countries when revealing the solution</span
        >
      </div>
      <input
        type="checkbox"
        class="toggle"
        bind:checked={settings.limitRevealZoom}
        data-testid="toggle-limit-reveal-zoom"
      />
    </label>
  </section>

  <button class="btn-reset" onclick={() => settings.reset()} data-testid="btn-reset-settings">
    Reset to defaults
  </button>
</div>

<style>
  /* ─── Settings page layout ─────────────────────────────────────── */
  .settings-page {
    flex: 1 1 0;
    overflow-y: auto;
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 36rem;
    margin: 0 auto;
    width: 100%;
  }

  /* ─── Back link in header ──────────────────────────────────────── */
  .back-link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  /* ─── Setting rows ─────────────────────────────────────────────── */
  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    background: var(--color-surface);
    cursor: pointer;
    transition: background 0.12s;
  }

  .setting-row:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  .setting-row:hover {
    background: var(--color-badge-bg);
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .setting-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text);
  }

  .setting-desc {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    line-height: 1.35;
  }

  /* ─── Toggle switch ────────────────────────────────────────────── */
  .toggle {
    appearance: none;
    -webkit-appearance: none;
    width: 2.75rem;
    height: 1.5rem;
    flex-shrink: 0;
    border-radius: 1rem;
    background: var(--color-border);
    position: relative;
    cursor: pointer;
    transition:
      background 0.2s,
      box-shadow 0.15s;
    border: none;
    outline: none;
  }

  .toggle::after {
    content: '';
    position: absolute;
    top: 0.175rem;
    left: 0.175rem;
    width: 1.15rem;
    height: 1.15rem;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }

  .toggle:checked {
    background: var(--color-primary);
  }

  .toggle:checked::after {
    transform: translateX(1.25rem);
  }

  .toggle:focus-visible {
    box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-primary);
  }

  /* ─── Reset button ─────────────────────────────────────────────── */
  .btn-reset {
    align-self: center;
    padding: 0.5rem 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }

  .btn-reset:hover {
    background: var(--color-badge-bg);
    color: var(--color-text);
  }

  /* ─── Mobile ───────────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .settings-page {
      padding: 1rem 0.75rem;
    }

    .setting-label {
      font-size: 0.88rem;
    }

    .setting-desc {
      font-size: 0.75rem;
    }
  }
</style>
