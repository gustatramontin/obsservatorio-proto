<footer class="project-footer">
  <div class="footer-inner">
    <section class="footer-about">
      <h2>Sobre o Observatório</h2>
      <p>
        O <strong>Observatório de Dados da Educação de Jovens e Adultos (EJA) em Santa Catarina</strong>
        é um projeto integrado de ensino, pesquisa e extensão do
        <strong>Instituto Federal Catarinense (IFC) – Campus Blumenau</strong>, desenvolvido no âmbito
        do Edital nº 15/2025 – GAB/BLU. O projeto parte da educação como um direito ao longo da vida
        e busca dar visibilidade às necessidades educacionais de jovens, adultos e idosos que ainda
        não concluíram a educação básica.
      </p>
      <p>
        O Observatório reúne e analisa informações de fontes públicas, como o Censo Demográfico do
        IBGE e o Censo Escolar do Inep, para entender onde está a população que pode se beneficiar da
        EJA e como a modalidade é ofertada nos municípios catarinenses. Os resultados são organizados
        em <strong>indicadores, painéis e materiais de divulgação</strong> que ajudam as redes de
        ensino, os fóruns de EJA e a comunidade a planejar e acompanhar políticas públicas para a
        modalidade.
      </p>
      <p>
        <strong>Blumenau foi o município-piloto do projeto.</strong> O primeiro diagnóstico reuniu
        dados sobre a escolaridade da população adulta e as matrículas na EJA e subsidiou as
        discussões para a elaboração do Plano Municipal de Educação de Blumenau. Estudantes bolsistas
        participam da análise dos dados, da produção dos materiais e da divulgação dos resultados.
      </p>
    </section>

    <section class="footer-credits">
      <h2>Responsáveis pelo projeto</h2>
      <dl class="credits-list">
        <div>
          <dt>Coordenação</dt>
          <dd>Jamile Delagnelo Fagundes da Silva — IFC Campus Blumenau</dd>
        </div>
        <div>
          <dt>Coordenação adjunta</dt>
          <dd>Eder Augusto Penharbel — IFC Campus Blumenau</dd>
        </div>
        <div>
          <dt>Equipe de orientação</dt>
          <dd>
            Ludmila Losada da Fonseca — IFC Campus Blumenau<br />
            Marcos Bohrer — IFC Campus Brusque<br />
            Rita de Cassia da Silveira Cordeiro — IFC Campus Blumenau<br />
            Suely Aparecida de Jesus Montibeller — IFC Campus Blumenau<br>
            Daniel Godino Berger - Forum Estadual da EJA SC
          </dd>
        </div>
        <div>
          <dt>Estudantes bolsistas</dt>
          <dd>
            Denizete Souza — Educação de Jovens e Adultos integrada à Educação Profissional e Tecnológica (EJA-EPT)<br />
            Gustavo Tramontin Pedro — Ciência da Computação
          </dd>
        </div>
        <div>
          <dt>Parceria</dt>
          <dd>Fórum Estadual de Educação de Jovens e Adultos de Santa Catarina</dd>
        </div>
      </dl>

      <div class="logos-row">
        <img src="/IFC.png" alt="Instituto Federal Catarinense (IFC)" />
        <img src="/FEJA.png" alt="Fórum Estadual de Educação de Jovens e Adultos de Santa Catarina (FEJA/SC)" />
      </div>
    </section>
  </div>
</footer>

<style>
  .project-footer {
    background-color: var(--color-dim-green);
    border-top: var(--border-subtle);
    padding: var(--space-lg) var(--space-md);
    margin-top: var(--space-md);
  }

  .footer-inner {
    max-width: 1240px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: var(--space-lg);
  }

  h2 {
    font-size: var(--text-lg);
    font-weight: 800;
    margin-bottom: var(--space-sm);
  }

  .footer-about {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .credits-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  dt {
    font-weight: 700;
    font-size: var(--text-sm);
  }

  dd {
    font-size: var(--text-sm);
    color: var(--color-ink);
  }

  .logos-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md);
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-surface);
    border-radius: var(--radius-md);
    width: fit-content;
  }

  .logos-row img {
    height: 52px;
    width: auto;
    object-fit: contain;
  }

  @media (max-width: 900px) {
    .footer-inner {
      grid-template-columns: 1fr;
    }
  }
</style>
