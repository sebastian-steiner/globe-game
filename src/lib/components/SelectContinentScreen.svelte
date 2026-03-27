<script lang="ts">
  import type { Continent } from '$lib/data';

  interface Props {
    continents: Continent[];
    onselect: (continent: Continent | undefined) => void;
  }
  let { continents, onselect }: Props = $props();
</script>

<div class="select-continent-overlay" data-testid="select-continent-overlay">
  <h2>Where do you want to guess?</h2>
  <div class="options">
    {#each continents as continent (continent.code)}
      <div class="select-continent-option">
        <button class="btn-select-continent" onclick={() => onselect(continent)}
          >{continent.name} - {continent.countries.length}</button
        >
      </div>
    {/each}
    <div class="select-continent-all-option">
      <button class="btn-select-continent" onclick={() => onselect(undefined)}
        >Entire globe - {continents
          .map((c) => c.countries.length)
          .reduce((acc, curr) => acc + curr, 0)}</button
      >
    </div>
  </div>
</div>
