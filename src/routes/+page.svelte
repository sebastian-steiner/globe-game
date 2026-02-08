<script lang="ts">
  import type { Country } from '$lib/data';
  import {
    BackgroundLayer,
    VectorTileSource,
    FillLayer,
    MapLibre,
    NavigationControl,
    ScaleControl,
    GlobeControl,
  } from 'svelte-maplibre-gl';

  let country = $state('');
  let region = $state('Asia');

  async function getCountries() {
    const response = await fetch('/api/countries', {
      method: 'GET',
    });

    const countries: Country[] = await response.json();

    country = countries[Math.floor(Math.random() * countries.length)].code;
  }
  function clearCountry() {
    country = ''
  }
</script>

<button onclick={getCountries}>Show random country</button>
<button onclick={clearCountry}>Show all countries</button>

<MapLibre class="h-[75vh] min-h-[300px]" globalState={{ country: country, region: region }}>
  <NavigationControl />
  <ScaleControl />
  <GlobeControl />

  <BackgroundLayer id="background" paint={{ 'background-color': '#fbf8f3' }} />
  <VectorTileSource url="http://localhost:3000/countries">
    <FillLayer sourceLayer="countries" paint={{ 'fill-color': '#996600' }} filter={[
        'case',
        ['==', ['to-string', ['global-state', 'country']], ''],
        true,
        ['==', ['get', 'code'], ['global-state', 'country']]
    ]} />
  </VectorTileSource>
</MapLibre>
