<script>
  import { onMount } from "svelte";
  import { fetchCities } from "./lib/utils/data.js";
  import MapView from "./lib/components/MapView.svelte";
  import StatsSidebar from "./lib/components/StatsSidebar.svelte";
  import ProjectFooter from "./lib/components/ProjectFooter.svelte";

  let cities = $state([]);
  let sc = $state({})
  let activeCity = $state(null);
  let loadError = $state("");

  onMount(async () => {
    try {
      cities = await fetchCities("/cities.json");
      sc = await fetchCities("/sc.json")
      activeCity = cities.find((c) => c.name === "Blumenau") || cities[0] || null;
    } catch (err) {
      loadError = err.message;
    }
  });
</script>

<div class="app-shell">
  {#if loadError}
    <div class="error-banner" role="alert">
      Erro ao carregar dados: {loadError}
    </div>
  {/if}

  <main class="dashboard-layout">
    <MapView {cities} {sc} bind:activeCity />
    <StatsSidebar city={activeCity} />
  </main>

  <ProjectFooter />
</div>

<style>
  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .dashboard-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
    gap: var(--space-sm);
    padding: var(--space-sm);
    height: 94vh;
    min-height: 620px;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: var(--space-sm) var(--space-md);
    font-weight: 700;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .dashboard-layout {
      grid-template-columns: 1fr;
      height: auto;
      min-height: 0;
    }
  }
</style>
