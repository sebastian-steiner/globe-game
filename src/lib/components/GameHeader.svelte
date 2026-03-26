<script lang="ts">
  interface Props {
    remaining: number;
    total: number;
  }
  let { remaining, total }: Props = $props();
</script>

<header class="game-header" data-testid="game-header">
  <h1>Country Guesser</h1>
  <span class="progress-badge" data-testid="progress-badge">
    {remaining} / {total} remaining
  </span>
</header>
