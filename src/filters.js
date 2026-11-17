import {IDADES, NIVEIS} from './data.js'

const filters = {
  city: document.getElementById("city-filter"),
  scholarities: document.getElementsByClassName("scholarity-filter"),
  ages: document.getElementsByClassName("age-filter")

}

export function populateCities(citiesData) {
  const select = filters.city
  const currentValue = select.value;
  select.innerHTML = '<option value="">Todas as cidades</option>';
  citiesData.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).forEach(city => {
    const option = document.createElement("option");
    option.value = city.name;
    option.textContent = city.name;
    select.appendChild(option);
  });
  select.value = currentValue;
}


export function getAgeFilter() {
      return [...filters.ages].filter(x => x.checked).map(x => x.value)
}

export function getScholarityFilter() {
        return [...filters.scholarities].filter(x => x.checked).map(x => x.value)

}
function populateCheckboxes(parentId, className, labels) {

  const el = document.getElementById(parentId)
  for (let label of labels) {
    el.innerHTML += `
        <div class="flexrow">
          <input id="${label}" type="checkbox" class="${className}" value="${label}" checked>
          <label for="${label}">${label}<label>
        </div>
    `
  }
}

export function populateScholarityAndAges() {
  populateCheckboxes("scholarity-filters", "scholarity-filter", NIVEIS)
  populateCheckboxes("age-filters", "age-filter", IDADES)

}

export function activateFilters(citiesData, fn) {
  filters.city.addEventListener("change", () => {
      fn(filters.city, filters, citiesData)
  });

  [...filters.ages, ...filters.scholarities].map(x => {
    x.addEventListener("change", () => {
      fn(filters.city, filters, citiesData)
  })
  })

}
