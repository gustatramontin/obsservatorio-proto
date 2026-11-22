import { Chart, PieController, ArcElement, Tooltip } from "chart.js";
import { IDADES, NIVEIS, CHART_COLORS, filterCity } from "./data.js";

Chart.register(PieController, ArcElement, Tooltip);

export function buildScholaritySpec(cityData, ageFilters = IDADES, scholarityFilters = NIVEIS) {
  const filtered = filterCity(cityData, ageFilters, scholarityFilters);
  const totals = NIVEIS.map(() => 0);

  for (const ageGroup of Object.values(filtered)) {
    NIVEIS.forEach((level, idx) => {
      totals[idx] += ageGroup[level] || 0;
    });
  }

  return {
    type: "pie",
    title: cityData.name,
    labels: NIVEIS,
    data: totals,
  };
}

export function buildStateSpec(citiesData, ageFilters = IDADES, scholarityFilters = NIVEIS) {
  const totals = NIVEIS.map(() => 0);

  for (const city of citiesData) {
    const spec = buildScholaritySpec(city, ageFilters, scholarityFilters);
    spec.data.forEach((val, idx) => {
      totals[idx] += val;
    });
  }

  return {
    type: "pie",
    title: "Santa Catarina",
    labels: NIVEIS,
    data: totals,
  };
}

function renderExternalTooltip(context) {
  let tooltipEl = document.getElementById("chartjs-tooltip");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chartjs-tooltip";
    tooltipEl.innerHTML = "<table></table>";
    document.body.appendChild(tooltipEl);
  }

  const tooltipModel = context.tooltip;
  if (tooltipModel.opacity === 0) {
    tooltipEl.style.opacity = "0";
    return;
  }

  if (tooltipModel.body) {
    const titleLines = tooltipModel.title || [];
    const bodyLines = tooltipModel.body.map((b) => b.lines);

    let innerHtml = "<thead>";
    for (const title of titleLines) {
      innerHtml += `<tr><th>${title}</th></tr>`;
    }
    innerHtml += "</thead><tbody>";

    bodyLines.forEach((lines, i) => {
      const colors = tooltipModel.labelColors[i];
      const swatch = `<span class="tooltip-swatch" style="background:${colors.backgroundColor};border:1px solid ${colors.borderColor};"></span>`;
      innerHtml += `<tr><td>${swatch}<span>${lines.join(" ")}</span></td></tr>`;
    });
    innerHtml += "</tbody>";

    tooltipEl.querySelector("table").innerHTML = innerHtml;
  }

  const rect = context.chart.canvas.getBoundingClientRect();
  tooltipEl.style.opacity = "1";
  tooltipEl.style.left = `${rect.left + tooltipModel.caretX}px`;
  tooltipEl.style.top = `${rect.top + tooltipModel.caretY}px`;
}

export function mountPieChart(canvas, spec) {
  if (!canvas) return null;

  return new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: spec.labels,
      datasets: [
        {
          data: spec.data,
          backgroundColor: CHART_COLORS,
          borderWidth: 1.5,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: renderExternalTooltip,
        },
      },
    },
  });
}
