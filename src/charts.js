import {IDADES, NIVEIS, filterCity} from './data.js'

const AGE_LABELS = {
  "18-34": "18 a 34 anos",
  "35-49": "35 a 49 anos",
  "50-64": "50 a 64 anos",
  "65+": "65 anos ou mais"
};
const EDUCATION_LABELS = {
  fund: "Sem instrução e fundamental incompleto",
  med: "Fundamental completo  e médio incompleto",
  normal: "Demais níveis / outros"
};

function sum(arr) {
  let res = 0
  for (let x of arr)
    res += x
  return res
}

export function ageChart(cityData, filters=NIVEIS) {
  const dataFiltered = filterCity(cityData, IDADES, filters)
  const data = Object.values(dataFiltered).map(x => sum(Object.values(x)))
  return {
    type: "pie",
    title: cityData.name,
    legend: false,
    tooltip: true,

    latitude: cityData.latitude,
    longitude: cityData.longitude,
    labels: IDADES,
    data: data,
  }
  
}

export function scholarityChart(cityData, filters=["todas as idades"]) {
  const scholarityFiltered = filterCity(cityData, filters, NIVEIS)
  const keysSummed = Object.values(scholarityFiltered).reduce((prev, curr) => {
    Object.keys(prev).forEach(k => {
      curr[k] += prev[k]
    })

    return curr
  })
  
  const data = Object.values(keysSummed)

  return {
    type: "pie",
    title: cityData.name,
    legend: false,
    tooltip: true,
    latitude: cityData.latitude,
    longitude: cityData.longitude,
    labels: NIVEIS,
    data: data
  }
}


export function spec2chart(canvasId, spec) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const chart = new Chart(canvas.getContext("2d"), {
        type: spec.type,
        data: {
          labels: spec.labels,
          datasets: [{ data: spec.data, backgroundColor: ["#2563eb", "#14b8a6", "#f59e0b", "#a78bfa"], borderWidth: 2, borderColor: "#fff" }]
        },
        options: {
          responsive: false, maintainAspectRatio: false, cutout: "0", plugins: { 
            legend: { display: spec.legend}, 
            tooltip: { 
              enabled: false,
              external: !spec.tooltip ? undefined : context => {
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
                  left: ${position.left + window.pageXOffset + tooltipModel.caretX}px;
                  top: ${position.top + window.pageYOffset + tooltipModel.caretY}px;
                  font: ${bodyFont.string};
                `
                tooltipEl.style.cssText = tooltipStyle
              }
            }
          }
        }
      });
    return chart
}
