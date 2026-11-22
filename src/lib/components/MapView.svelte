<script>
  import { onMount, onDestroy } from "svelte";
  import L from "leaflet";
  import { IDADES, NIVEIS, cityClosestToPoint } from "../utils/data.js";
  import { buildScholaritySpec, buildStateSpec, mountPieChart } from "../utils/charts.js";
  import MapFilters from "./MapFilters.svelte";

  let {
    cities = [],
    sc = {},
    activeCity = $bindable(null),
  } = $props();

  let mapContainer;
  let map;
  let chartLayer;
  let activeChartInstances = [];
  let selectedCityName = $state("");
  let selectedLevels = $state([...NIVEIS]);
  let selectedAges = $state([...IDADES]);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function clearChartLayer() {
    if (chartLayer) chartLayer.clearLayers();
    for (const chart of activeChartInstances) {
      chart?.destroy();
    }
    activeChartInstances = [];
  }

  function addChartMarker(lat, lng, title, spec, subtitle = "", isSelected = false) {
    const canvasId = `chart-${Math.random().toString(36).slice(2)}`;
    const html = `
      <div class="map-marker ${isSelected ? "selected-city" : ""}">
        <div class="map-marker-title">${escapeHtml(title)}</div>
        ${subtitle ? `<div class="map-marker-count">${escapeHtml(subtitle)}</div>` : ""}
        <div class="map-marker-charts">
          <canvas id="${canvasId}" aria-label="Gráfico de ${escapeHtml(title)}"></canvas>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html,
      className: "custom-chart-marker",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const marker = L.marker([lat, lng], { icon });
    marker.on("add", () => {
      const canvas = document.getElementById(canvasId);
      const instance = mountPieChart(canvas, spec);
      if (instance) activeChartInstances.push(instance);
    });

    chartLayer.addLayer(marker);
  }

  function renderMarkers() {
    if (!map || !cities.length) return;

    const center = map.getCenter();
    const closest = selectedCityName
      ? (selectedCityName === "Santa Catarina" ? sc : cities.find((c) => c.name === selectedCityName)) || cityClosestToPoint(cities, center.lng, center.lat)
      : cityClosestToPoint(cities, center.lng, center.lat);

    activeCity = closest;
    clearChartLayer();

    const zoom = map.getZoom();

    if (zoom < 9) {
      const stateSpec = buildScholaritySpec(sc, selectedAges, selectedLevels);
      addChartMarker(-27.2423, -50.2189, "Santa Catarina", stateSpec, "Estado", closest?.name === "Santa Catarina");
      return;
    }

    const bounds = map.getBounds();

    if (zoom < 12) {
      for (const city of cities) {
        if (!bounds.contains([city.latitude, city.longitude])) continue;
        const population = Object.values(city.escolaridade["todas as idades"]).reduce(
          (acc, val) => acc + val,
          0
        );
        const spec = buildScholaritySpec(city, selectedAges, selectedLevels);
        addChartMarker(
          city.latitude,
          city.longitude,
          city.name,
          spec,
          `${population.toLocaleString("pt-BR")} hab.`,
          closest?.name === city.name
        );
      }
      return;
    }

    for (const city of cities) {
      if (!bounds.contains([city.latitude, city.longitude])) continue;
      for (const school of city.schools || []) {
        const lat = school.latitude ?? city.latitude;
        const lng = school.longitude ?? city.longitude;
        const spec = {
          type: "pie",
          title: school.name,
          labels: ["EJA Fundamental", "EJA Médio"],
          data: [school.matriculas?.eja_fund || 0, school.matriculas?.eja_med || 0],
        };
        addChartMarker(
          lat,
          lng,
          school.name,
          spec,
          `${(school.matriculas?.eja || 0).toLocaleString("pt-BR")} matrículas`
        );
      }
    }
  }

  function handleSelectCity(cityName) {
    if (!cityName || !map) {
      renderMarkers();
      return;
    }

    if (cityName === "Santa Catarina") {
      activeCity = sc;
      map.setView([sc.latitude, sc.longitude],  7);
      return
    }
    const city = cities.find((c) => c.name === cityName);
    if (city) {
      activeCity = city;
      map.setView([city.latitude, city.longitude], Math.max(map.getZoom(), 10));
    }
  }

  onMount(() => {
    map = L.map(mapContainer).setView([-27.2423, -50.2189], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    chartLayer = L.layerGroup().addTo(map);
    map.on("moveend zoomend", renderMarkers);
  });

  onDestroy(() => {
    clearChartLayer();
    map?.remove();
  });

  $effect(() => {
    // Re-render whenever cities load or filter selections change
    cities;
    selectedAges;
    selectedLevels;
    renderMarkers();
  });
</script>

<section class="map-section" aria-label="Mapa interativo de Santa Catarina">
  <MapFilters
    {cities}
    bind:selectedCity={selectedCityName}
    bind:selectedLevels
    bind:selectedAges
    onSelectCity={handleSelectCity}
  />
  <div class="map-canvas" bind:this={mapContainer}></div>
</section>

<style>
  .map-section {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 480px;
  }

  .map-canvas {
    width: 100%;
    height: 100%;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    z-index: 1;
  }

  @media (max-width: 1024px) {
    .map-section {
      gap: var(--space-sm);
      height: auto;
    }

    .map-canvas {
      height: 52vh;
      min-height: 340px;
    }
  }
</style>
