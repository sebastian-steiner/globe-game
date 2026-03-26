<script lang="ts">
  import { onMount } from 'svelte';
  import { GameState } from '$lib/game/gameState.svelte';
  import { settings } from '$lib/stores/settings.svelte';
  import GameHeader from '$lib/components/GameHeader.svelte';
  import GlobeMap from '$lib/components/GlobeMap.svelte';
  import SolutionBar from '$lib/components/SolutionBar.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import WinScreen from '$lib/components/WinScreen.svelte';
  import zoomFitIcon from '$lib/assets/zoom-fit.svg';

  const game = new GameState();

  // Sync shared settings into the game state
  $effect(() => {
    game.smoothPan = settings.smoothPan;
  });
  $effect(() => {
    game.showScale = settings.showScale;
  });
  $effect(() => {
    game.limitRevealZoom = settings.limitRevealZoom;
  });

  /**
   * Whether to show all countries on the globe.
   * True when: game is in idle/revealed state OR the "show all countries" setting is on.
   */
  let showAllOnGlobe = $derived(game.showAll || settings.showAllCountries);

  onMount(async () => {
    settings.load();
    await game.init();
  });
</script>

<!-- ─── Header ────────────────────────────────────────────────────────── -->
<GameHeader remaining={game.remainings.length} total={game.countries.length} />

<!-- ─── Globe ─────────────────────────────────────────────────────────── -->
<div class="globe-region" data-testid="globe-region">
  <GlobeMap
    country={game.country}
    showAll={showAllOnGlobe}
    showScale={game.showScale}
    bind:map={game.map}
  />

  {#if game.started}
    <button
      class="btn-reset-view"
      onclick={() => game.resetView()}
      data-testid="btn-reset-view"
      aria-label="Reset view"
    >
      <img src={zoomFitIcon} alt="" width="18" height="18" />
    </button>
  {/if}

  {#if game.won}
    <WinScreen total={game.countries.length} onplayagain={() => game.reset()} />
  {/if}
</div>

<!-- ─── Solution strip ────────────────────────────────────────────────── -->
<SolutionBar name={game.country.name} revealed={game.showAll} started={game.started} />

<!-- ─── Action bar ────────────────────────────────────────────────────── -->
<ActionBar
  idle={game.idle}
  guessing={game.guessing}
  revealed={game.revealed}
  onstart={() => game.start()}
  onreveal={() => game.reveal()}
  oncorrect={() => game.correct()}
  onwrong={() => game.wrong()}
/>
