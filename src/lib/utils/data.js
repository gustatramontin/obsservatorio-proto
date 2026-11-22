export const IDADES = [
  "18 a 34 anos",
  "35 a 49 anos",
  "50 a 64 anos",
  "65 anos ou mais",
];

export const NIVEIS = [
  "Sem instrução e fundamental incompleto",
  "Fundamental completo e médio incompleto",
  "Médio completo e superior incompleto",
  "Superior completo",
];

export const CHART_COLORS = [
  "#2563eb",
  "#14b8a6",
  "#f59e0b",
  "#a78bfa",
];

export async function fetchCities(url = "/cities.json") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${url} (${response.status})`);
  }
  const data = await response.json();
  return data
}

function zeroObj(obj) {
  if (typeof obj === "number") return 0;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, zeroObj(value)])
  );
}

function filterKeys(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) =>
      keys.includes(key) ? [key, value] : [key, zeroObj(value)]
    )
  );
}

export function filterCity(cityData, ages = IDADES, levels = NIVEIS) {
  const ageFiltered = filterKeys(cityData.escolaridade, ages);
  return Object.fromEntries(
    Object.entries(ageFiltered).map(([age, scholarity]) => [
      age,
      filterKeys(scholarity, levels),
    ])
  );
}

export function cityClosestToPoint(cities, lng, lat) {
  if (!cities?.length) return null;
  let closest = cities[0];
  let minDist = Infinity;

  for (const city of cities) {
    const dist = Math.hypot(city.latitude - lat, city.longitude - lng);
    if (dist < minDist) {
      minDist = dist;
      closest = city;
    }
  }
  return closest;
}

export function computeCityStats(cityData) {
  if (!cityData) return null;

  const allAges = cityData.escolaridade["todas as idades"];
  const population = Object.values(allAges).reduce((acc, val) => acc + val, 0);
  const fund = allAges["Sem instrução e fundamental incompleto"] || 0;
  const med = allAges["Fundamental completo e médio incompleto"] || 0;
  const demandaTotal = fund + med;

  let ejaMat = 0;
  let ejaMatFund = 0;
  let ejaMatMed = 0;

  for (const school of cityData.schools || []) {
    ejaMat += school.matriculas?.eja || 0;
    ejaMatFund += school.matriculas?.eja_fund || 0;
    ejaMatMed += school.matriculas?.eja_med || 0;
  }

  const pct = (part, total) => (total > 0 ? (part / total) * 100 : 0);

  return {
    name: cityData.name,
    population,
    demandaTotal,
    demandaPercent: pct(demandaTotal, population),
    fund,
    fundPercent: pct(fund, population),
    med,
    medPercent: pct(med, population),
    ejaMat,
    ejaMatFund,
    ejaMatMed,
    coberturaTotal: pct(ejaMat, demandaTotal),
    coberturaFund: pct(ejaMatFund, fund),
    coberturaMed: pct(ejaMatMed, med),
  };
}
