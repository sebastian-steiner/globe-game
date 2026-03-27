<script lang="ts">
  interface Props {
    /** No country selected yet — show Start button. */
    idle: boolean;
    /** Country selected but not yet revealed — show Reveal button. */
    guessing: boolean;
    /** Country revealed — show Correct / Wrong buttons. */
    revealed: boolean;
    onstart: () => void;
    onreveal: () => void;
    oncorrect: () => void;
    onwrong: () => void;
    onselectcontinent: () => void;
  }
  let {
    idle,
    guessing,
    revealed,
    onstart,
    onreveal,
    oncorrect,
    onwrong,
    onselectcontinent,
  }: Props = $props();
</script>

<div class="action-bar" data-testid="action-bar">
  {#if idle}
    <button class="btn-start" onclick={onstart} data-testid="btn-start">Start</button>
    <button
      class="btn-goto-select-continent"
      onclick={onselectcontinent}
      data-testid="btn-goto-select-continent">Continent Mode</button
    >
  {:else if guessing}
    <button class="btn-reveal" onclick={onreveal} data-testid="btn-reveal">Reveal</button>
  {:else if revealed}
    <button class="btn-correct" onclick={oncorrect} data-testid="btn-correct">✓ Correct</button>
    <button class="btn-wrong" onclick={onwrong} data-testid="btn-wrong">✗ Wrong</button>
  {/if}
</div>
