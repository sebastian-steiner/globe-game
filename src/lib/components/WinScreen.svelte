<script lang="ts">
  interface Props {
    total: number;
    onplayagain: () => void;
  }
  let { total, onplayagain }: Props = $props();
</script>

<div class="win-overlay" data-testid="win-overlay">
  <h2>🎉 You won!</h2>
  <p>All {total} countries guessed correctly.</p>
  <button class="btn-again" onclick={onplayagain} data-testid="btn-play-again">Play Again</button>
</div>
