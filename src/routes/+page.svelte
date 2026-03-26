<script lang="ts">
  import { onMount } from 'svelte';
  import { GameState } from '$lib/game/gameState.svelte';
  import GameHeader from '$lib/components/GameHeader.svelte';
  import GlobeMap from '$lib/components/GlobeMap.svelte';
  import SolutionBar from '$lib/components/SolutionBar.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import WinScreen from '$lib/components/WinScreen.svelte';

  const game = new GameState();

  onMount(async () => {
    await game.init();
  });
</script>

<!-- ─── Header ────────────────────────────────────────────────────────── -->
<GameHeader remaining={game.remainings.length} total={game.countries.length} />

<!-- ─── Globe ─────────────────────────────────────────────────────────── -->
<div class="globe-region" data-testid="globe-region">
  <GlobeMap
    country={game.country}
    showAll={game.showAll}
    showScale={game.showScale}
    bind:map={game.map}
  />

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
