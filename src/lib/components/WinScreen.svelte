<script lang="ts">
  interface Props {
    total: number;
    continent: string | undefined;
    onplayagain: () => void;
  }
  let { total, continent, onplayagain }: Props = $props();
</script>

<div class="win-overlay" data-testid="win-overlay">
  <h2>🎉 You won!</h2>
  {#if !continent}
    <p>All {total} countries guessed correctly.</p>
  {/if}
  {#if continent}
    <p>All {total} countries in {continent} guessed correctly.</p>
  {/if}
  <button class="btn-again" onclick={onplayagain} data-testid="btn-play-again">Play Again</button>
</div>
