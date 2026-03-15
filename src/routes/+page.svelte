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
    p3: { x: -1, y: -1 },
  } as Country;
  let countries = $state([] as Country[]);

  // settings
  let showScale = $state(true);
  let smoothPan = $state(false);

  let currentCountry = $state(-1);
  let remainings = $state([] as number[]);
  let country = $state(emptyCountry);
  let showAll = $state(true);
  let won = $state(false);

  onMount(async () => {
    await getCountries();
  });

  const getCountries = async () => {
    if (countries.length != 0) {
      return countries;
    }
    const response = await fetch('/api/countries', {
      method: 'GET',
    });

    countries = await response.json();
    remainings = Array.from(countries.keys());
    return countries;
  };

  let map: maplibregl.Map | undefined = $state.raw();

  async function setRandomCountry() {
    currentCountry = remainings[Math.floor(Math.random() * remainings.length)];
    country = countries[currentCountry];
    if (country.code) {
      if (smoothPan) {
        map?.fitBounds([country.p1.x, country.p1.y, country.p3.x, country.p3.y]);
      } else {
        map?.fitBounds([country.p1.x, country.p1.y, country.p3.x, country.p3.y], { duration: 0});
      }
    }
  }

  function reset() {
    currentCountry = -1;
    remainings = Array.from(countries.keys());;
    country = emptyCountry;
    showAll = true;
    won = false;
  }

  function showRandomCountry() {
    showAll = false;
    setRandomCountry();
  }

  function reveal() {
    showAll = true;
  }

  function correct() {
    const index = remainings.indexOf(currentCountry);
    if (index > -1) {
      remainings.splice(index, 1);
    }
    if (remainings.length == 0) {
      reset();
      won = true;
      return;
    }
    showRandomCountry();
  }

  function wrong() {
    won = false;
    showRandomCountry();
  }
</script>

<div class="pure-g">
  <div class="pure-u-1-1">
    <h1>Country Guesser</h1>
  </div>
  <div class="pure-u-1-1">
    <h3>remaining {remainings.length} / {countries.length}</h3>
  </div>
  <div class="pure-u-1-1">
    {#if country.name && showAll}
      <h>Showing {country.name}</h>
    {/if}
  </div>
</div>
<MapLibre
  inlineStyle="min-height:300px; height: 75vh;"
  zoom={1.5}
  globalState={{ country: country.code }}
  bind:map
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
    <VectorTileSource url="http://localhost:3000/countries">
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
    <VectorTileSource url="http://localhost:3000/countries">
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
<div class="pure-g">
  {#if !won}
    {#if country.name && !showAll}
      <div class="pure-u-1-1">
        <button class="pure-button button-secondary" style="width:100%" onclick={reveal}
          >Reveal</button
        >
      </div>
    {/if}
    {#if country.name && showAll}
      <div class="pure-u-1-2">
        <button class="pure-button button-success" style="width:100%" onclick={correct}
          >Correct</button
        >
      </div>
      <div class="pure-u-1-2">
        <button class="pure-button button-error" style="width:100%" onclick={wrong}>Wrong</button>
      </div>
    {/if}
    {#if currentCountry < 0}
      <div class="pure-u-1-1">
        <button class="pure-button button-secondary" style="width:100%" onclick={showRandomCountry}
          >Random Country</button
        >
      </div>
    {/if}
  {:else}
    <div class="pure-u-1-1">
      <p>Congrats! You won!!</p>
    </div>
    <div class="pure-u-1-1">
      <button class="pure-button button-secondary" style="width:100%" onclick={reset}
        >Play Again</button
      >
    </div>
  {/if}
</div>

<style>
  .button-success,
  .button-error,
  .button-secondary {
    color: white;
    border-radius: 4px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }

  .button-success {
    background: rgb(51, 117, 56);
    /* this is a green */
  }

  .button-error {
    background: rgb(220, 105, 125);
    /* this is a maroon */
  }

  .button-secondary {
    background: rgb(66, 184, 221);
    /* this is a light blue */
  }
</style>
