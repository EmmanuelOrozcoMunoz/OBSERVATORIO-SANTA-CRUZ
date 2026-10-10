"""
Resumen de la página de Inicio.

Junta en un solo objeto las cifras que muestra la portada (indicadores, accesibilidad,
seguridad, Carrera 49, fuentes) leyéndolas de los mismos archivos que genera el
pipeline. Lo usa la API (GET /api/inicio) y también sirve para dejar un
inicio.json estático, que la web usa cuando la API no está encendida:

    python -m app.resumen            (desde la carpeta backend)
"""
import json
import os
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DATOS = Path(os.environ.get("OBSERVATORIO_DATOS", RAIZ / "frontend" / "public" / "data"))


def _json(nombre: str, datos: Path):
    ruta = datos / nombre
    return json.loads(ruta.read_text(encoding="utf-8")) if ruta.is_file() else None


def _c(x):
    """Número con coma decimal, como se escribe en español."""
    return str(x).replace(".", ",")


def construir(datos: Path = DATOS) -> dict:
    ind = _json("indicadores.json", datos) or {}
    seg = _json("seguridad.json", datos) or {}
    eje = _json("eje49.json", datos) or {}
    fuentes = _json("fuentes.json", datos) or []
    c = ind.get("comuna", {})
    acc = (ind.get("accesibilidad") or {}).get("comuna", {})
    infra = ind.get("infraestructura") or {}
    metro = (eje.get("destinos") or {}).get("transporte_masivo", {})
    estado = eje.get("estado_del_eje", {})

    def cifra(clave, valor, texto, modulo, ruta, nota=None):
        return {"clave": clave, "valor": valor, "texto": texto, "modulo": modulo, "ruta": ruta, "nota": nota}

    pulso = []
    if c.get("espacio_publico_m2_hab") is not None:
        pulso.append(cifra("espacio_publico", c["espacio_publico_m2_hab"], "m² de espacio público por habitante (referencia nacional: 15)", "Problemáticas", "/problematicas"))
    if acc.get("transporte_masivo_10min_pct") is not None:
        pulso.append(cifra("metro_10min", acc["transporte_masivo_10min_pct"], "% de las personas llegan caminando al Metro o Metrocable en 10 min", "Accesibilidad", "/accesibilidad"))
    if metro:
        pulso.append(cifra("minutos_49", metro.get("minutos_por_la_49"), f"min a la estación yendo por la 49 (la ruta más rápida: {_c(metro.get('minutos_ruta_rapida'))})", "Corredor Carrera 49", "/corredor-49"))
    if estado.get("siniestros_por_km") is not None:
        pulso.append(cifra("siniestros_km", estado["siniestros_por_km"], f"siniestros por km en el eje de la 49 (comuna: {_c(estado.get('siniestros_por_km_comuna'))})", "Corredor Carrera 49", "/corredor-49"))
    if infra.get("andenes"):
        pulso.append(cifra("andenes_angostos", infra["andenes"].get("angostos_pct"), "% del andén inventariado es más angosto que 1,2 m", "Accesibilidad", "/accesibilidad"))
    if seg.get("hurto_2017"):
        pulso.append(cifra("hurtos_2017", seg["hurto_2017"].get("total"), "hurtos registrados en 2017, último año publicado", "Problemáticas", "/problematicas", "Solo conteos por barrio"))

    return {
        "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "comuna": {
            "nombre": c.get("nombre", "Santa Cruz"),
            "poblacion_2018": c.get("poblacion_2018"),
            "viviendas_2018": c.get("viviendas_2018"),
            "barrios": c.get("barrios"),
            "area_ha": c.get("area_ha"),
            "densidad_hab_ha": c.get("densidad_hab_ha"),
        },
        "pulso": pulso,
        "datos": {
            "fuentes": len(fuentes),
            "capas": len(list(datos.glob("*.geojson"))),
            "calculo_indicadores": ind.get("generado"),
        },
    }


if __name__ == "__main__":
    salida = DATOS / "inicio.json"
    salida.write_text(json.dumps(construir(), ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Escrito {salida}")
