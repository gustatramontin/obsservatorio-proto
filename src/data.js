
export const IDADES = [
  "18 a 34 anos",
  "35 a 49 anos",
  "50 a 64 anos",
  "65 anos ou mais"
]

export const NIVEIS = [
        "Sem instrução e fundamental incompleto",
        "Fundamental completo e médio incompleto",
        "Médio completo e superior incompleto",
        "Superior completo",
]

export async function fetchJson(fileName) {
  const response = await fetch(fileName);
  if (!response.ok) throw new Error(`Não foi possível carregar ${fileName}`);
  return response.json();
}

function zeroObj(obj) {

  if (typeof obj === 'number')
    return 0

  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, zeroObj(value)]))
}
function filterKeys(obj, keys) {
  return Object.fromEntries(Object.entries(obj).map(([key, value] ) => keys.includes(key) ? [key, value] : [key, zeroObj(value)]))
}

export function filterCity(cityData, ages = IDADES, levels = NIVEIS) {
  const ageFiltered = filterKeys(cityData.escolaridade, ages)
  const scholarityFiltered = Object.fromEntries(Object.entries(ageFiltered).map(([age, scholarity]) => [age, filterKeys(scholarity, levels)]))

  return scholarityFiltered
  

}
