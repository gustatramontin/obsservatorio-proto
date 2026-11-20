 "use strict";
import { fetchJson } from './data.js'
import { ageChart, scholarityChart, spec2chart } from './charts.js'
import { updateStats } from './stats.js'
import { populateCities, populateScholarityAndAges, activateFilters, getAgeFilter, getScholarityFilter} from './filters.js'


const map = L.map("map").setView([-27.2423, -50.2189], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const chartLayer = L.layerGroup().addTo(map);
let citiesData = [] 
let mapCharts = [];
let statsCharts = []
let closestCity = undefined

async function loadData() {
  const json = await fetchJson("cities.json")
  citiesData = json
}

function cityClosestToPoint(cities, x, y) {
  let closest = cities[0]
  const dist = (city1) => Math.sqrt((city1.latitude-y)**2 + (city1.longitude-x)**2)
  for (let city of cities) {
    if (dist(city) < dist(closest))
      closest = city
  }

  return closest
}

function cityStats() {


  const closestCity = cityClosestToPoint(citiesData, map.getCenter().lng, map.getCenter().lat)
  statsCharts.forEach(s => s.destroy())
  statsCharts = updateStats(closestCity)

  return closestCity
}

function updateMap() {
  chartLayer.clearLayers();
  mapCharts.forEach(chart => chart.destroy());
  mapCharts = [];
  closestCity = cityStats()

  const sumArrays = (a1,a2) => [...a1].map((x,i) => x+a2[i])
  const sumData = arr => {
    return {
      ...arr[0],
      data: arr.map(x => x.data).reduce(sumArrays)
    }
  }
  const zoom = map.getZoom();
  const chartSize = zoom*15
  //const citiesAgeChart = citiesData.map( x => ageChart(x, getScholarityFilter()))
  const citiesScholarityChart = citiesData.map(x => scholarityChart(x, getAgeFilter(), getScholarityFilter()))

  //const scAgeChart = sumData(citiesAgeChart)
  const scScholarityChart = sumData(citiesScholarityChart)

   // if (zoom < 10) map.setView([city.latitude, city.longitude], 10);

  if (zoom < 10) {
      const SC_LATITUDE  = -27.242
      const SC_LONGITUDE = -50.2189
      addChartMarker(SC_LATITUDE, SC_LONGITUDE, "Santa Catarina", [scScholarityChart], chartSize, "subTitle");
  } else if (zoom < 12) {
    for (let i in citiesData) {
        const city = citiesData[i]
        if (!map.getBounds().contains([city.latitude, city.longitude])) continue;
        const population = Object.values(city.escolaridade["todas as idades"]).reduce((a,b) => a+b)
        addChartMarker(city.latitude, city.longitude, city.name, [citiesScholarityChart[i]], chartSize/2, population.toLocaleString("pt-BR"));
    }
  } else {
    for (let i in citiesData) {
        const city = citiesData[i]
        if (!map.getBounds().contains([city.latitude, city.longitude])) continue;
        city.schools.forEach(s => {

          if (!s.latitude || !s.longitude) {
            s.latitude = city.latitude
            s.longitude = city.longitude
          }

            const spec = {
              type: "pie",
              title: s.name, 
              legend: false,
              tooltip: true,
              data: [s.matriculas.eja_fund, s.matriculas.eja_med],
              labels: ["Fundamendal", "Médio"]

            }
            addChartMarker(s.latitude, s.longitude, s.name, [spec], chartSize/3, s.matriculas.eja.toLocaleString("pt-BR"));
        })

    }
  }
}

function addChartMarker(lat, lng, title, chartSpecs, size, subtitle = "") {
  const markerId = `marker-${Math.random().toString(36).slice(2)}`;
  const selected = chartSpecs[0].title == closestCity.name
  const canvases = chartSpecs.map((_, i) =>
    `<canvas id="${markerId}-${i}" aria-label="Gráfico de ${escapeHtml(title)}"></canvas>`
  ).join("");
  const html = `<div class="map-marker flexcol ${selected ? 'selected-city' : ''}" style="width:${size}px">
                    <div class="map-marker-title">${escapeHtml(title)}</div>
                      ${subtitle ? `<div class="map-marker-count">${escapeHtml(subtitle)}</div>` : ""}
                    <div class="map-marker-charts flexcol">${canvases}</div>
                </div>`;
 

  const icon = L.divIcon({
    html, className: "custom-chart-marker",
    iconSize: [size, size], iconAnchor: [(size) / 2, (size) / 2]
  });
  const marker = L.marker([lat, lng], { icon });
  marker.on("add", () => {
    mapCharts.push(...chartSpecs.map((spec, i) => spec2chart(`${markerId}-${i}`, {...spec, legend: false})))
  });
  chartLayer.addLayer(marker);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
/*
*/


function onFilterChange(filter, filters, citiesData) {

    if (filter === filters.city && filters.city.value) {
      const city = citiesData.find(x => x.name == filters.city.value)
      if (city) map.setView([city.latitude, city.longitude], Math.max(map.getZoom(), 10));

      statsCharts.forEach(chart => chart.destroy())
      statsCharts = updateStats(city)
    } else {
        updateMap()
    }
}
map.on("moveend zoomend", updateMap);
loadData().then(() => {
populateCities(citiesData);
populateScholarityAndAges();
updateMap();
activateFilters(citiesData, onFilterChange)
//updateStats(citiesData.find(x => x.name == "blumenau"))
});
