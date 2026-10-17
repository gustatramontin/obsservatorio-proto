 "use strict";

const map = L.map("map").setView([-27.2423, -50.2189], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const chartLayer = L.layerGroup().addTo(map);
let cityData = {};
let schools = [];
let stats = [];
let charts = [];

const filters = {
  city: document.getElementById("cidades"),
  education: document.getElementById("escolaridade"),
  age: document.getElementById("idade"),
  eja: document.getElementById("mostrar-eja")
}; 

const AGE_KEYS = {
  all: "todas as idades",
  "18-34": "18 a 34 anos",
  "35-49": "35 a 49 anos",
  "50-64": "50 a 64 anos",
  "65+": "65 anos ou mais"
};
const EDUCATION_LABELS = {
  fund: "Fundamental incompleto",
  med: "Ensino médio incompleto",
  normal: "Demais níveis / outros"
};

async function loadJson(fileName) {
  const response = await fetch(fileName);
  if (!response.ok) throw new Error(`Não foi possível carregar ${fileName}`);
  return response.json();
}

async function loadData() {
  try {
    const [cities, educationStats, schoolData] = await Promise.all([
      loadJson("municipios.json"),
      loadJson("escolaridade.json"),
      loadJson("escolas-eja-sc.json")
    ]);

    stats = educationStats;
    schools = schoolData;

    for (const city of cities) {
      if (Number(city.codigo_uf) !== 42) continue;
      cityData[city.nome] = {
        name: city.nome,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude)
      };
    }

    // Keep the original statistical rows: each city has one row per education group.
    for (const row of stats) {
      const city = cityData[row.municipio];
      if (!city) continue;
      if (!city.stats) city.stats = {};
      city.stats[row.escolaridade] = row;
    }

    for (const school of schools) {
      const city = cityData[school.municipio];
      if (!city) continue;
      city.eja = (city.eja || 0) + (Number(school.qt_mat_eja) || 0);
      city.ejaFund = (city.ejaFund || 0) + (Number(school.qt_mat_eja_fund) || 0);
      city.ejaMed = (city.ejaMed || 0) + (Number(school.qt_mat_eja_med) || 0);
    }

    populateCities();
    updateMap();
  } catch (error) {
    console.error(error);
    document.getElementById("status").textContent =
      "Não foi possível carregar os dados. Confira se os arquivos JSON estão na mesma pasta e abra o site por um servidor local.";
  }
}

function populateCities() {
  const select = filters.city;
  const currentValue = select.value;
  select.innerHTML = '<option value="">Todas as cidades</option>';
  Object.keys(cityData).sort((a, b) => a.localeCompare(b, "pt-BR")).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  select.value = currentValue;
}

function getSelectedRow(city) {
  const education = filters.education.value;
  return city.stats && city.stats[education];
}

function getSelectedCount(city) {
  const row = getSelectedRow(city);
  const ageKey = AGE_KEYS[filters.age.value] || AGE_KEYS.all;
  return row ? (Number(row[ageKey]) || 0) : 0;
}

function updateMap() {
  chartLayer.clearLayers();
  charts.forEach(chart => chart.destroy());
  charts = [];

  const selectedCity = filters.city.value;
  const showEja = filters.eja.checked;
  const visibleCities = Object.values(cityData).filter(city =>
    (!selectedCity || city.name === selectedCity) &&
    Number.isFinite(city.latitude) && Number.isFinite(city.longitude) &&
    map.getBounds().contains([city.latitude, city.longitude])
  );

  const zoom = map.getZoom();
  if (selectedCity && cityData[selectedCity]) {
    const city = cityData[selectedCity];
    if (zoom < 10) map.setView([city.latitude, city.longitude], 10);
  }

  if (zoom < 10 && !selectedCity) {
    const totals = getStateTotals();
    addChartMarker(-27.2423, -50.2189, "Santa Catarina", [
      { labels: ["Fundamental incompleto", "Ensino médio incompleto", "Demais níveis"], data: totals }
    ], 112);
  } else if (zoom < 12 || !showEja) {
    visibleCities.forEach(city => {
      const row = getSelectedRow(city);
      if (!row) return;
      const ageKey = AGE_KEYS[filters.age.value] || AGE_KEYS.all;
      const count = Number(row[ageKey]) || 0;
      const remaining = Math.max(0, count - (Number(row["65 anos ou mais"]) || 0));
      const chartData = [
        Number(row["65 anos ou mais"]) || 0,
        Number(row["18 a 34 anos"]) || 0,
        Number(row["35 a 49 anos"]) || 0,
        Number(row["50 a 64 anos"]) || 0
      ];
      const ageChart = {
        labels: ["65 anos ou mais", "18 a 34 anos", "35 a 49 anos", "50 a 64 anos"],
        data: filters.age.value === "all" ? chartData : [count]
      }

      const scholarityData = [
        city.stats.fund[ageKey],
        city.stats.med[ageKey],
        city.stats.todos[ageKey],
      ]
      const scholarityChart = {
        labels: ["Fundamental incompleto", "Ensino médio incompleto", "Demais níveis"], 
        data: scholarityData
      }

      const chartSize = Math.floor(zoom*10)
      console.log(zoom)
      addChartMarker(city.latitude, city.longitude, city.name, [ageChart, scholarityChart], chartSize, count.toLocaleString("pt-BR"));
    });
  } else {
    // At close zoom, show individual EJA schools. Education/age filters describe
    // the city statistics, so school markers are controlled by the EJA toggle.
    if (showEja) {
      schools.forEach((school, index) => {
        const lat = Number(school.latitude), lon = Number(school.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        if (selectedCity && school.municipio !== selectedCity) return;
        if (!map.getBounds().contains([lat, lon])) return;
        addChartMarker(lat, lon, school.escola || "Escola EJA", [{
          labels: ["Fundamental", "Ensino médio"],
          data: [Number(school.qt_mat_eja_fund) || 0, Number(school.qt_mat_eja_med) || 0]
        }], 54);
      });
    }
  }

  const countLabel = selectedCity ? selectedCity : "Santa Catarina";
  document.getElementById("status").textContent =
    `${visibleCities.length.toLocaleString("pt-BR")} cidade(s) na área visível · ${countLabel}`;
}

function getStateTotals() {
  const total = [0, 0, 0];
  Object.values(cityData).forEach(city => {
    /*
    const row = getSelectedRow(city);
    if (!row) return;
    console.log(city.stats)
    const ageKey = AGE_KEYS[filters.age.value] || AGE_KEYS.all;
    const count = Number(row[ageKey]) || 0;
    total[0] += Number(row["todas as idades"]) ? (Number(row["todas as idades"]) * 0) : 0;
    total[1] += count;
    */

    if (!city.stats) return

    total[0] += city.stats.fund["todas as idades"]
    total[1] += city.stats.med["todas as idades"]
    total[2] += city.stats.todos["todas as idades"]
  });
  // The state-level marker is a single selected-population total; avoid implying
  // a breakdown that isn't calculated for the selected age range.
  return total;
}

function addChartMarker(lat, lng, title, chartSpecs, size, subtitle = "") {
  const markerId = `marker-${Math.random().toString(36).slice(2)}`;
  const canvases = chartSpecs.map((_, i) =>
    `<canvas id="${markerId}-${i}" aria-label="Gráfico de ${escapeHtml(title)}"></canvas>`
  ).join("");
  const html = `<div class="map-marker" style="width:${size}px">
    <div class="map-marker-title">${escapeHtml(title)}</div>
    ${subtitle ? `<div class="map-marker-count">${escapeHtml(subtitle)}</div>` : ""}
    <div class="map-marker-charts">${canvases}</div>
  </div>`;
  const icon = L.divIcon({
    html, className: "custom-chart-marker",
    iconSize: [size + 18, size + 35], iconAnchor: [(size + 18) / 2, (size + 35) / 2]
  });
  const marker = L.marker([lat, lng], { icon });
  marker.on("add", () => {
    chartSpecs.forEach((spec, i) => {
      const canvas = document.getElementById(`${markerId}-${i}`);
      if (!canvas) return;
      const chart = new Chart(canvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: spec.labels,
          datasets: [{ data: spec.data, backgroundColor: ["#2563eb", "#14b8a6", "#f59e0b", "#a78bfa"], borderWidth: 2, borderColor: "#fff" }]
        },
        options: {
          responsive: false, maintainAspectRatio: false, cutout: "58%",
          plugins: { 
            legend: { display: false}, 
            tooltip: { 
              enabled: false,
              external: context => {
                // Tooltip Element
                let tooltipEl = document.getElementById('chartjs-tooltip');

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  tooltipEl.innerHTML = '<table></table>';
                  document.body.appendChild(tooltipEl);
                }

                // Hide if no tooltip
                const tooltipModel = context.tooltip;
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set caret Position
                tooltipEl.classList.remove('above', 'below', 'no-transform');
                if (tooltipModel.yAlign) {
                  tooltipEl.classList.add(tooltipModel.yAlign);
                } else {
                  tooltipEl.classList.add('no-transform');
                }

                function getBody(bodyItem) {
                  return bodyItem.lines;
                }

                // Set Text
                if (tooltipModel.body) {
                  const titleLines = tooltipModel.title || [];
                  const bodyLines = tooltipModel.body.map(getBody);

                  let innerHtml = '<thead>';

                  titleLines.forEach(function(title) {
                    innerHtml += '<tr><th>' + title + '</th></tr>';
                  });
                  innerHtml += '</thead><tbody>';

                  bodyLines.forEach(function(body, i) {
                    const colors = tooltipModel.labelColors[i];
                    let style = 'background:' + colors.backgroundColor;
                    style += '; border-width: 2px';
                    style += '; border-color:' + colors.borderColor;
                    style += '; border-width: 2px';
                    const span = '<span style="' + style + '">' + body + '</span>';
                    innerHtml += '<tr><td>' + span + '</td></tr>';
                  });
                  innerHtml += '</tbody>';

                  let tableRoot = tooltipEl.querySelector('table');
                  tableRoot.innerHTML = innerHtml;
                }

                const position = context.chart.canvas.getBoundingClientRect();
                const bodyFont = Chart.helpers.toFont(tooltipModel.options.bodyFont);

                // Display, position, and set styles for font
                const tooltipStyle = `

                  z-index: 1000;
                  background-color: black;
                  color: white;
                  opacity: 1;
                  position: absolute;
                  border-radius: 12px;
                  left: ${position.left + window.pageXOffset + tooltipModel.caretX}px;
                  top: ${position.top + window.pageYOffset + tooltipModel.caretY}px;
                  font: ${bodyFont.string};
                  padding: 5px;
                  pointer-events: none;
                `
                tooltipEl.style.cssText = tooltipStyle
              console.log(tooltipStyle)
              }
            }
          }
        }
      });
      charts.push(chart);
    });
  });
  chartLayer.addLayer(marker);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

Object.values(filters).forEach(input => {
  input.addEventListener("change", () => {
    if (input === filters.city && filters.city.value) {
      const city = cityData[filters.city.value];
      if (city) map.setView([city.latitude, city.longitude], Math.max(map.getZoom(), 10));
    }
    updateMap();
  });
});
map.on("moveend zoomend", updateMap);
loadData();
