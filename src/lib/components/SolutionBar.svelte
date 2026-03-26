<script lang="ts">
  interface Props {
    /** The country name to show, empty string means no country selected yet. */
    name: string;
    /** Whether the solution is currently revealed. */
    revealed: boolean;
    /** Whether a game has started (a country has been selected). */
    started: boolean;
  }
  let { name, revealed, started }: Props = $props();
</script>

{#if name && revealed}
  <div class="solution-strip" data-testid="solution-strip">
    <span class="label">Showing</span>
    <span class="country-name" data-testid="country-name">{name}</span>
  </div>
{:else}
  <div class="solution-strip hidden-solution" data-testid="solution-strip">
    {#if name}
      Country hidden — make your guess
    {:else if !started}
      Press "Start" to begin
    {:else}
      &nbsp;
    {/if}
  </div>
{/if}
