<script>
  import { computeCityStats } from "../utils/data.js";

  let { city = null } = $props();

  const stats = $derived(computeCityStats(city));

  const fmtInt = (val) => Math.round(val || 0).toLocaleString("pt-BR");
  const fmtPct = (val) =>
    (val || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "%";
</script>

<aside class="stats-sidebar" aria-label="Indicadores municipais da EJA">
  <header class="sidebar-header">
    <h1>Observatório EJA/SC</h1>
    <a
      class="cadeja-cta"
      href="https://cadeja.mec.gov.br/encontrar"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img src="/icons/cadeja-logo.webp" alt="Logo CadEJA" />
      <span>Quer voltar a estudar? Encontre aqui uma escola perto de você</span>
    </a>
  </header>

  {#if stats}
    <div class="city-banner">
      <div>
        <h2>{stats.name} <span class="uf-badge">SC</span></h2>
        <p class="subtitle">Diagnóstico da Educação de Jovens e Adultos</p>
      </div>
      <img class="location-icon" src="/icons/location.svg" alt="" aria-hidden="true" />
    </div>

    <section class="kpi-grid" aria-label="Resumo numérico">
      <div class="kpi-card">
        <img src="/icons/people.svg" alt="" aria-hidden="true" />
        <div>
          <span class="kpi-label">População (18+ anos)</span>
          <strong class="kpi-value">{fmtInt(stats.population)}</strong>
        </div>
      </div>

      <div class="kpi-card">
        <img src="/icons/graduation.svg" alt="" aria-hidden="true" />
        <div>
          <span class="kpi-label">Demanda estimada</span>
          <strong class="kpi-value">{fmtInt(stats.demandaTotal)}</strong>
          <span class="kpi-sub">{fmtPct(stats.demandaPercent)} da população</span>
        </div>
      </div>

      <div class="kpi-card">
        <img src="/icons/book.svg" alt="" aria-hidden="true" />
        <div>
          <span class="kpi-label">Matrículas EJA</span>
          <strong class="kpi-value">{fmtInt(stats.ejaMat)}</strong>
        </div>
      </div>

      <div class="kpi-card">
        <img src="/icons/bars.svg" alt="" aria-hidden="true" />
        <div>
          <span class="kpi-label">Cobertura indicativa</span>
          <strong class="kpi-value">{fmtPct(stats.coberturaTotal)}</strong>
        </div>
      </div>
    </section>

    <section class="panel-block">
      <h3>Demanda potencial por nível de ensino</h3>

      <div class="progress-item">
        <div class="progress-header">
          <h4>Ensino Fundamental</h4>
          <span>
            <strong>{fmtInt(stats.fund)}</strong> ({fmtPct(stats.fundPercent)})
          </span>
        </div>
        <div class="bar-track" role="progressbar" aria-valuenow={Math.round(stats.fundPercent)} aria-valuemin="0" aria-valuemax="100">
          <div class="bar-fill fund" style:width="{Math.min(stats.fundPercent, 100)}%"></div>
        </div>
        <p class="progress-caption">Sem instrução ou fundamental incompleto</p>
      </div>

      <div class="progress-item">
        <div class="progress-header">
          <h4>Ensino Médio</h4>
          <span>
            <strong>{fmtInt(stats.med)}</strong> ({fmtPct(stats.medPercent)})
          </span>
        </div>
        <div class="bar-track" role="progressbar" aria-valuenow={Math.round(stats.medPercent)} aria-valuemin="0" aria-valuemax="100">
          <div class="bar-fill med" style:width="{Math.min(stats.medPercent, 100)}%"></div>
        </div>
        <p class="progress-caption">Fundamental completo e médio incompleto</p>
      </div>
    </section>

    <section class="panel-block">
      <h3>Quanto dessa demanda está atendida</h3>
      <div class="coverage-grid">
        <div class="coverage-card fund">
          <h4>Ensino Fundamental</h4>
          <strong class="coverage-pct">{fmtPct(stats.coberturaFund)}</strong>
          <p>{fmtInt(stats.ejaMatFund)} matrículas</p>
          <p>{fmtInt(stats.fund)} pessoas</p>
        </div>

        <div class="coverage-card med">
          <h4>Ensino Médio</h4>
          <strong class="coverage-pct">{fmtPct(stats.coberturaMed)}</strong>
          <p>{fmtInt(stats.ejaMatMed)} matrículas</p>
          <p>{fmtInt(stats.med)} pessoas</p>
        </div>
      </div>
    </section>
  {:else}
    <p class="loading-state">Carregando dados municipais…</p>
  {/if}
</aside>

<style>
  .stats-sidebar {
    background-color: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    overflow-y: auto;
  }

  .sidebar-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  h1 {
    font-size: var(--text-xl);
    font-weight: 800;
    color: var(--color-ink);
  }

  .cadeja-cta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background-color: var(--color-blue);
    color: #ffffff;
    text-decoration: none;
    font-weight: 700;
    font-size: var(--text-xs);
    line-height: 1.3;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    transition: filter 0.15s ease;
  }

  .cadeja-cta:hover {
    filter: brightness(0.92);
  }

  .cadeja-cta img {
    width: 42px;
    height: auto;
    background-color: #ffffff;
    border-radius: var(--radius-sm);
    padding: 2px;
    flex-shrink: 0;
  }

  .city-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding-bottom: var(--space-sm);
    border-bottom: var(--border-subtle);
  }

  h2 {
    font-size: var(--text-lg);
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .uf-badge {
    font-size: var(--text-xs);
    font-weight: 700;
    background: var(--color-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .subtitle {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  .location-icon {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-sm);
  }

  .kpi-card {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    border: var(--border-subtle);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
  }

  .kpi-card img {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .kpi-card > div {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .kpi-label {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
    line-height: 1.2;
  }

  .kpi-value {
    font-size: var(--text-lg);
    font-weight: 800;
    line-height: 1.2;
  }

  .kpi-sub {
    font-size: 0.72rem;
    color: var(--color-ink-muted);
  }

  .panel-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  h3 {
    font-size: var(--text-base);
    font-weight: 700;
  }

  .progress-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-xs);
    font-size: var(--text-sm);
  }

  .progress-header h4 {
    font-size: var(--text-sm);
    font-weight: 700;
  }

  .bar-track {
    width: 100%;
    height: 12px;
    background-color: var(--color-bg);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.25s ease;
  }

  .bar-fill.fund {
    background-color: var(--color-blue);
  }

  .bar-fill.med {
    background-color: var(--color-green);
  }

  .progress-caption {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  .coverage-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-sm);
  }

  .coverage-card {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: var(--space-sm);
    border-radius: var(--radius-md);
  }

  .coverage-card.fund {
    background-color: var(--color-dim-blue);
  }

  .coverage-card.med {
    background-color: var(--color-dim-green);
  }

  .coverage-card h4 {
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .coverage-pct {
    font-size: var(--text-xl);
    font-weight: 800;
    line-height: 1.15;
  }

  .coverage-card p {
    font-size: var(--text-xs);
  }

  .loading-state {
    color: var(--color-ink-muted);
    font-size: var(--text-sm);
  }

  @media (max-width: 420px) {
    .kpi-grid,
    .coverage-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
