<script lang="ts">
  import type { Country } from '$lib/data';
	import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';
  import {
    BackgroundLayer,
    VectorTileSource,
    FillLayer,
    MapLibre,
    NavigationControl,
    ScaleControl,
    Projection,
  } from 'svelte-maplibre-gl';

  const emptyCountry = {
    id: 0,
    code: '',
    name: '',
    p1: { x: -1, y: -1 },
    p3: { x: -1, y: -1 }
  } as Country;
  let country = $state(emptyCountry);
  let cnt = $state(-1);
  let region = $state('Asia');
  let countries = [] as Country[];
  let showCountry = $state(false);

  onMount(async () => {
    await getCountries();
    showCountry = true;
  });

  const getCountries = async () => {
    if (countries.length != 0) {
      return countries;
    }
    const response = await fetch('/api/countries', {
      method: 'GET',
    });

    countries = await response.json();
    return countries;
  }

  let map: maplibregl.Map | undefined = $state.raw();

  async function getNextCountry() {
    cnt += 1;
    country = (await getCountries())[cnt];
    if (country.code) {
      map?.fitBounds([country.p1.x, country.p1.y, country.p3.x, country.p3.y])
    }
    showCountry = false;
  }

  async function getPreviousCountry() {
    cnt -= 1;
    country = (await getCountries())[cnt];
    if (country.code) {
      map?.fitBounds([country.p1.x, country.p1.y, country.p3.x, country.p3.y])
    }
    showCountry = false;
  }

  async function setRandomCountry() {
    country = countries[Math.floor(Math.random() * countries.length)];
    if (country.code) {
      map?.fitBounds([country.p1.x, country.p1.y, country.p3.x, country.p3.y])
    }
    showCountry = false;
  }
  function clearCountry() {
    country = emptyCountry;
    showCountry = false;
  }
  function showCountryName() {
    showCountry = true;
  }
</script>

{#if showCountry}
<h>Showing {country.name ? country.name : 'no country'}</h>
{/if}
<div>
  <button onclick={setRandomCountry}>Show random country</button>
  <button onclick={clearCountry}>Show all countries</button>
  <button onclick={showCountryName}>Show country name</button>
</div>
<div>
  <p>{cnt}</p>
  <button onclick={getPreviousCountry}>Prev</button>
  <button onclick={getNextCountry}>Next</button>
</div>
33
<MapLibre class="h-[75vh] min-h-[300px]" zoom={2} globalState={{ country: country.code, region: region }} bind:map>
  <Projection type="globe" />
  <NavigationControl />
  <ScaleControl />

  <BackgroundLayer id="background" paint={{ 'background-color': '#0073e6', 'background-opacity': 0.01 }} />
  {#if showCountry}
  <VectorTileSource url="http://localhost:3000/countries">
    <FillLayer sourceLayer="countries" paint={{ 'fill-color': '#89ce00', 'fill-opacity': 0.3 }} filter={[
        'case',
        ['==', ['to-string', ['global-state', 'country']], ''],
        true,
        ['!=', ['get', 'code'], ['global-state', 'country']]
    ]}/>
  </VectorTileSource>
  {/if}
  {#if country.name}
  <VectorTileSource url="http://localhost:3000/countries">
    <FillLayer sourceLayer="countries" paint={{ 'fill-color': '#b51963' }} filter={[
        'case',
        ['==', ['to-string', ['global-state', 'country']], ''],
        true,
        ['==', ['get', 'code'], ['global-state', 'country']]
    ]} />
  </VectorTileSource>
  {/if}
</MapLibre>
