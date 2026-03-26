<script lang="ts">
  import type { Country } from '$lib/data';
  import maplibregl from 'maplibre-gl';
  import {
    BackgroundLayer,
    VectorTileSource,
    FillLayer,
    MapLibre,
    NavigationControl,
    ScaleControl,
    Projection,
  } from 'svelte-maplibre-gl';

  interface Props {
    country: Country;
    showAll: boolean;
    showScale?: boolean;
    map?: maplibregl.Map;
  }

  let { country, showAll, showScale = true, map = $bindable() }: Props = $props();

  /** Container dimensions used to derive a responsive zoom level. */
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  /**
   * Reference dimension (iPhone 17 Pro CSS-width) where zoom 1.5 is ideal.
   * Zoom scales logarithmically so the globe grows/shrinks proportionally.
   */
  const REF_DIM = 393;
  const BASE_ZOOM = 1.5;

  function computeZoom(w: number, h: number): number {
    const minDim = Math.min(w, h);
    if (minDim <= 0) return BASE_ZOOM;
    return BASE_ZOOM + Math.log2(minDim / REF_DIM);
  }

  /** The initial zoom used when the map first mounts (computed once). */
  let initialZoom = $derived(computeZoom(containerWidth, containerHeight));

  /** Track previous dimensions so we only re-zoom on genuine container resizes. */
  let prevWidth = 0;
  let prevHeight = 0;

  /** Force the canvas to match its container once the map has fully loaded. */
  function handleLoad() {
    map?.resize();
    const z = computeZoom(containerWidth, containerHeight);
    map?.setZoom(z);
    prevWidth = containerWidth;
    prevHeight = containerHeight;

    // Expose map instance for e2e test access
    if (typeof window !== 'undefined' && map) {
      window.__maplibreMap = map;
    }
  }

  /**
   * Only adjust zoom when the container actually resizes (e.g. orientation
   * change, window resize). Does NOT fire during normal user interaction.
   */
  $effect(() => {
    // Read reactive deps
    const w = containerWidth;
    const h = containerHeight;

    if (!map || w <= 0 || h <= 0) return;

    // Skip if dimensions haven't meaningfully changed (< 5px tolerance)
    if (Math.abs(w - prevWidth) < 5 && Math.abs(h - prevHeight) < 5) return;

    prevWidth = w;
    prevHeight = h;

    const z = computeZoom(w, h);
    map.setZoom(z);
  });
</script>

<!--
  The outer div is sized by our CSS (position:absolute;inset:0 fills .globe-region).
  MapLibre stamps position:relative + overflow:hidden onto its own container div,
  but cannot touch the parent, so our sizing wrapper is safe.
  width:100%;height:100% on <MapLibre> then fills the wrapper correctly.
-->
<div style="position:absolute;inset:0;" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
  <MapLibre
    inlineStyle="width:100%;height:100%;"
    zoom={initialZoom}
    globalState={{ country: country.code }}
    bind:map
    onload={handleLoad}
  >
    <Projection type="globe" />
    <NavigationControl />
    {#if showScale}
      <ScaleControl />
    {/if}

    <BackgroundLayer
      id="background"
      paint={{ 'background-color': '#0073e6', 'background-opacity': 0.01 }}
    />

    {#if showAll}
      <VectorTileSource url="https://countries.sebastian-steiner.at/services/countries">
        <FillLayer
          sourceLayer="countries"
          paint={{ 'fill-color': '#89ce00', 'fill-opacity': 0.3 }}
          filter={[
            'case',
            ['==', ['to-string', ['global-state', 'country']], ''],
            true,
            ['!=', ['get', 'code'], ['global-state', 'country']],
          ]}
        />
      </VectorTileSource>
    {/if}

    {#if country.name}
      <VectorTileSource url="https://countries.sebastian-steiner.at/services/countries">
        <FillLayer
          sourceLayer="countries"
          paint={{ 'fill-color': '#b51963' }}
          filter={[
            'case',
            ['==', ['to-string', ['global-state', 'country']], ''],
            true,
            ['==', ['get', 'code'], ['global-state', 'country']],
          ]}
        />
      </VectorTileSource>
    {/if}
  </MapLibre>
</div>
