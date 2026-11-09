import { scholarityChart, spec2chart } from './charts.js'

function fromId(id) {
  return document.getElementById(id)
}

function setText(id, newText) {
  const el = fromId(id)
  el.innerText = newText
}

function setNumber(id, newNumber) {
  setText(id, newNumber.toLocaleString("pt-BR"))
}

function setNumberAndPercent(id, newNumber, newTotal) {
  const number = newNumber.toLocaleString("pt-BR")
  const total = (newNumber / newTotal * 100).toLocaleString("pt-BR")
  setText(id, `${number}(${total}%)`)
}

function setPercent(id, newNumber, newTotal) {
  const total = (newNumber / newTotal * 100).toLocaleString("pt-BR")
  setText(id, `${total}%`)
}
export function updateStats(cityData) {
  let charts = []
  const cityName = cityData.name
  const population = Object.values(cityData.escolaridade["todas as idades"]).reduce((a,b) => a+b)
  const fund       = cityData.escolaridade["todas as idades"]["Sem instrução e fundamental incompleto"]
  const med        = cityData.escolaridade["todas as idades"]["Fundamental completo e médio incompleto"]
  const medcomp    = cityData.escolaridade["todas as idades"]["Médio completo e superior incompleto"]
  const sup        = cityData.escolaridade["todas as idades"]["Superior completo"]

  const ejaMat = cityData.schools.map(x => x.matriculas.eja).reduce((a,b) => a+b)
  const ejaMatFund = cityData.schools.map(x => x.matriculas.eja_fund).reduce((a,b) => a+b)
  const ejaMatMed = cityData.schools.map(x => x.matriculas.eja_med).reduce((a,b) => a+b)

  setText("city-name", cityName)
  setNumber("city-population", population)
  setNumberAndPercent("city-fund", fund, population)
  setNumberAndPercent("city-med", med, population)
  setNumberAndPercent("city-med-com", medcomp, population)
  setNumberAndPercent("city-sup", sup, population)

  charts.push(spec2chart("city-scholarity-chart", scholarityChart(cityData)))


  setNumberAndPercent("demanda-eja", fund+med, population)

  setNumber("eja-mat", ejaMat)
  setNumber("eja-mat-fund", ejaMatFund)
  setNumber("eja-mat-med", ejaMatMed)
  charts.push(spec2chart("city-eja-chart", {
    title: "",
    type: "pie",
    data: [ejaMatFund, ejaMatMed],
    labels: ["Matrículas EJA Fundamental", "Matrículas EJA Médio"],
    legend: false,
    tooltip: true
  }))

  setPercent("demanda-eja-atendida", ejaMat, fund+med)
  setPercent("demanda-eja-atendida-fund", ejaMatFund, med)
  setPercent("demanda-eja-atendida-med", ejaMatMed, med)
  return charts;
}
