<script>
  import { IDADES, NIVEIS } from "../utils/data.js";

  let {
    cities = [],
    selectedCity = $bindable(""),
    selectedLevels = $bindable([...NIVEIS]),
    selectedAges = $bindable([...IDADES]),
    onSelectCity = () => {},
  } = $props();

  let isOpen = $state(true);

  const legendItems = [
    { color: "var(--chart-color-1)", label: "Sem instrução e fundamental incompleto" },
    { color: "var(--chart-color-2)", label: "Fundamental completo e médio incompleto" },
    { color: "var(--chart-color-3)", label: "Médio completo e superior incompleto" },
    { color: "var(--chart-color-4)", label: "Superior completo" },
  ];

  function toggleItem(list, item) {
    return list.includes(item)
      ? list.filter((entry) => entry !== item)
      : [...list, item];
  }

  function handleCityChange(event) {
    selectedCity = event.target.value;
    onSelectCity(selectedCity);
  }
</script>

<aside class="filters-panel" aria-label="Filtros e legenda do mapa">
  <button
    type="button"
    class="filters-toggle"
    aria-expanded={isOpen}
    onclick={() => (isOpen = !isOpen)}
  >
    <img src="/icons/filters.svg" alt="" aria-hidden="true" />
    <span>Filtros e Legenda</span>
    <span class="chevron" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
  </button>

  {#if isOpen}
    <div class="filters-grid">
      <div class="filter-group">
        <label class="group-title" for="city-filter">Município</label>
        <select id="city-filter" value={selectedCity} onchange={handleCityChange}>
          <option value="">Nenhuma (Por procimidade)</option>
          <option value="Santa Catarina">Todas as cidades (Santa Catarina)</option>
          {#each cities as city (city.name)}
            <option value={city.name}>{city.name}</option>
          {/each}
        </select>
      </div>

      <fieldset class="filter-group">
        <legend class="group-title">Escolaridade</legend>
        <div class="checkbox-list">
          {#each NIVEIS as level}
            <label class="checkbox-item">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level)}
                onchange={() => (selectedLevels = toggleItem(selectedLevels, level))}
              />
              <span>{level}</span>
            </label>
          {/each}
        </div>
      </fieldset>

      <fieldset class="filter-group">
        <legend class="group-title">Faixa Etária</legend>
        <div class="checkbox-list">
          {#each IDADES as age}
            <label class="checkbox-item">
              <input
                type="checkbox"
                checked={selectedAges.includes(age)}
                onchange={() => (selectedAges = toggleItem(selectedAges, age))}
              />
              <span>{age}</span>
            </label>
          {/each}
        </div>
      </fieldset>

      <div class="filter-group legend-group">
        <span class="group-title">Legenda dos Gráficos</span>
        <ul class="legend-list">
          {#each legendItems as item}
            <li>
              <span class="legend-swatch" style:background-color={item.color} aria-hidden="true"></span>
              <span>{item.label}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</aside>

<style>
  .filters-panel {
    position: absolute;
    bottom: var(--space-md);
    left: var(--space-md);
    right: var(--space-md);
    z-index: 1000;
    background: var(--color-surface);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--space-sm) var(--space-md);
    max-width: 960px;
  }

  .filters-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: none;
    border: none;
    font-weight: 700;
    font-size: var(--text-sm);
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .filters-toggle img {
    width: 20px;
    height: 20px;
  }

  .chevron {
    margin-left: auto;
    color: var(--color-ink-muted);
  }

  .filters-grid {
    display: grid;
    grid-template-columns: minmax(170px, 1fr) 1.3fr 0.9fr 1.3fr;
    gap: var(--space-md);
    margin-top: var(--space-sm);
    padding-top: var(--space-sm);
    border-top: var(--border-subtle);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    border: none;
    min-width: 0;
  }

  .group-title {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--color-ink-muted);
    margin-bottom: 2px;
  }

  select {
    width: 100%;
    padding: 0.45rem 0.6rem;
    border: var(--border-subtle);
    border-radius: var(--radius-sm);
    background-color: var(--color-surface);
    font-size: var(--text-sm);
  }

  .checkbox-list,
  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
    list-style: none;
  }

  .checkbox-item,
  .legend-list li {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: var(--text-xs);
    line-height: 1.3;
    cursor: pointer;
  }

  .checkbox-item input {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-top: 2px;
    flex-shrink: 0;
  }

  @media (max-width: 1024px) {
    .filters-panel {
      position: static;
      max-width: none;
    }

    .filters-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 600px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
