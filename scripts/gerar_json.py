#!/usr/bin/env python3
"""Combina os três JSONs em cities.json para o site.

Uso na pasta que contém os arquivos:
    python3 gerar_cities.py

Ou informe os quatro caminhos:
    python3 gerar_cities.py municipios.json escolas-eja-sc.json escolaridade.json saida.json
"""

import json
import sys
import unicodedata

AGE_FIELDS = (
     "18 a 34 anos",
     "35 a 49 anos",
     "50 a 64 anos",
     "65 anos ou mais",
     "todas as idades",
)
EDUCATION_LEVELS = (
    "Sem instrução e fundamental incompleto",
    "Fundamental completo e médio incompleto",
    "Médio completo e superior incompleto",
    "Superior completo"
)
SANTA_CATARINA_UF = 42


def normalize(text):
    """Ignora maiúsculas, acentos, espaços e pontuação ao combinar nomes."""
    text = unicodedata.normalize("NFKD", str(text or "").casefold())
    return "".join(char for char in text if char.isalnum())


def number(value):
    """Converte números como 12.0 para 12 e trata valores ausentes como zero."""
    if value is None or value == "":
        return 0
    value = float(value)
    return int(value) if value.is_integer() else value


def load_json(path):
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def build_cities(municipios, escolas, escolaridade):
    municipios_sc = [
        municipio for municipio in municipios
        if municipio.get("codigo_uf") == SANTA_CATARINA_UF
    ]

    stats_by_city = {}
    for row in escolaridade:
        city_key = normalize(row.get("municipio"))
        level = row.get("escolaridade")
        if level in EDUCATION_LEVELS:
            stats_by_city.setdefault(city_key, {})[level] = row

    schools_by_city = {}
    for school in escolas:
        city_key = normalize(school.get("municipio"))
        schools_by_city.setdefault(city_key, []).append({
            "name": school.get("escola", ""),
            "latitude": school.get("latitude"),
            "longitude": school.get("longitude"),
            "matriculas": {
                "eja": number(school.get("qt_mat_eja")),
                "eja_fund": number(school.get("qt_mat_eja_fund")),
                "eja_med": number(school.get("qt_mat_eja_med")),
            },
        })

    cities = []
    for municipio in sorted(municipios_sc, key=lambda item: normalize(item.get("nome"))):
        name = municipio.get("nome", "")
        city_key = normalize(name)
        rows = stats_by_city.get(city_key, {})

        education = {}
        for output_age in AGE_FIELDS:
            education[output_age] = {
                level: number(rows.get(level, {}).get(output_age, 0))
                for level in EDUCATION_LEVELS
            }

        cities.append({
            "name": name,
            "latitude": municipio.get("latitude"),
            "longitude": municipio.get("longitude"),
            "escolaridade": education,
            "schools": schools_by_city.get(city_key, []),
        })

    return cities


def main():
    defaults = (
        "municipios.json",
        "escolas-eja-sc.json",
        "escolaridade.json",
        "cities.json",
    )
    args = sys.argv[1:]
    if args and len(args) != 4:
        raise SystemExit(
            "Uso: python3 gerar_cities.py "
            "[municipios.json escolas-eja-sc.json escolaridade.json saida.json]"
        )

    municipios_file, escolas_file, escolaridade_file, output_file = args or defaults
    cities = build_cities(
        load_json(municipios_file),
        load_json(escolas_file),
        load_json(escolaridade_file),
    )

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(cities, file, ensure_ascii=False, indent=2)
        file.write("\\n")

    print(f"Arquivo gerado: {output_file}")
    print(f"Municípios de Santa Catarina: {len(cities)}")
    print(f"Escolas agrupadas: {sum(len(city['schools']) for city in cities)}")


if __name__ == "__main__":
    main()

