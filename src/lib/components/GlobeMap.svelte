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
</script>

<MapLibre inlineStyle="width:100%;height:100%;" zoom={1.5} globalState={{ country: country.code }} bind:map>
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
