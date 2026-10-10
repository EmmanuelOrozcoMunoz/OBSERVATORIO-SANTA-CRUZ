"""
Paso 1 del pipeline: descarga las capas del catálogo (fuentes.py) desde los
servicios ArcGIS REST públicos y las guarda tal cual en data/raw/.

Uso:
    python descargar.py            # descarga todo
    python descargar.py vias       # descarga solo una fuente

No inventa nada: si una capa falla, queda registrada con estado "error"
en data/raw/_registro.json y el resto del proceso sigue.
"""
import json
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from fuentes import FUENTES, INDICADORES_ECV

RAIZ = Path(__file__).resolve().parent.parent
RAW = RAIZ / "data" / "raw"
RAW.mkdir(parents=True, exist_ok=True)

USER_AGENT = "Mozilla/5.0 (ObservatorioSantaCruz; prototipo academico Territorio INN 2026)"

# Caja de la Comuna 2 (grados, WGS84). Se recalcula a partir del límite oficial
# cuando ya está descargado; este valor es solo el respaldo inicial.
CAJA_COMUNA = (-75.56334, 6.28891, -75.54420, 6.31017)
MARGEN_ENTORNO = 0.011  # ~1,2 km


def _get_json(url: str, params: dict, intentos: int = 3) -> dict:
    full = url + "?" + urllib.parse.urlencode(params)
    for i in range(intentos):
        try:
            req = urllib.request.Request(full, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.load(r)
            if isinstance(data, dict) and data.get("error"):
                raise RuntimeError(f"El servicio respondió con error: {data['error']}")
            return data
        except Exception:
            if i == intentos - 1:
                raise
            time.sleep(2 * (i + 1))
    raise RuntimeError("inalcanzable")


def caja_comuna() -> tuple:
    f = RAW / "comuna.geojson"
    if not f.exists():
        return CAJA_COMUNA
    xs, ys = [], []

    def walk(c):
        if isinstance(c[0], (int, float)):
            xs.append(c[0]); ys.append(c[1])
        else:
            for h in c:
                walk(h)

    for feat in json.loads(f.read_text(encoding="utf-8"))["features"]:
        walk(feat["geometry"]["coordinates"])
    return (min(xs), min(ys), max(xs), max(ys))


def parametros_espaciales(fuente: dict) -> dict:
    if fuente["filtro"] == "atributo":
        return {}
    x0, y0, x1, y1 = caja_comuna()
    if fuente["filtro"] == "entorno":
        x0, y0, x1, y1 = x0 - MARGEN_ENTORNO, y0 - MARGEN_ENTORNO, x1 + MARGEN_ENTORNO, y1 + MARGEN_ENTORNO
    return {
        "geometry": f"{x0},{y0},{x1},{y1}",
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
    }


def descargar_fuente(fuente: dict) -> dict:
    url = f"{fuente['servicio']}/{fuente['capa']}/query"
    base = {"where": fuente.get("where", "1=1"), **parametros_espaciales(fuente)}

    if fuente.get("consulta_directa"):
        datos = _get_json(url, {**base, "outFields": ",".join(fuente["campos"]), "returnGeometry": "true",
                                "outSR": "4326", "f": "geojson"})
        features = datos.get("features", [])
        salida = {"type": "FeatureCollection", "features": features}
        (RAW / f"{fuente['id']}.geojson").write_text(json.dumps(salida, ensure_ascii=False), encoding="utf-8")
        return {"id": fuente["id"], "estado": "ok", "registros": len(features),
                "consulta": url + "?" + urllib.parse.urlencode({**base, "f": "geojson"})}

    ids = _get_json(url, {**base, "returnIdsOnly": "true", "f": "json"})
    lista = sorted(ids.get("objectIds") or [])
    campo_id = ids.get("objectIdFieldName", "objectid")

    features = []
    for i in range(0, len(lista), 400):
        bloque = lista[i:i + 400]
        datos = _get_json(url, {
            "objectIds": ",".join(map(str, bloque)),
            "outFields": ",".join(fuente["campos"]),
            "returnGeometry": "true",
            "outSR": "4326",
            "f": "geojson",
        })
        features.extend(datos.get("features", []))

    salida = {"type": "FeatureCollection", "features": features}
    (RAW / f"{fuente['id']}.geojson").write_text(json.dumps(salida, ensure_ascii=False), encoding="utf-8")
    return {
        "id": fuente["id"],
        "estado": "ok",
        "registros": len(features),
        "campo_id": campo_id,
        "consulta": url + "?" + urllib.parse.urlencode({**base, "f": "geojson"}),
    }


def descargar_ecv() -> dict:
    url_base = INDICADORES_ECV["servicio"]
    resultado = {}
    for clave, meta in INDICADORES_ECV["capas"].items():
        datos = _get_json(f"{url_base}/{meta['capa']}/query",
                          {"where": "1=1", "outFields": "*", "returnGeometry": "false", "f": "json"})
        filas = []
        for f in datos.get("features", []):
            a = f["attributes"]
            valores = {k.split("_")[-1]: v for k, v in a.items()
                       if (k.startswith("i_") or k.startswith("total_")) and v is not None}
            filas.append({"codigo": a.get("codigo"), "nombre": a.get("nombre"), "valores": valores})
        resultado[clave] = {**meta, "filas": filas}
    (RAW / "indicadores_ecv.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=1), encoding="utf-8")
    return {"id": "indicadores_ecv", "estado": "ok", "registros": sum(len(v["filas"]) for v in resultado.values()),
            "consulta": url_base}


OSM_TILEJSON = "https://tiles.openfreemap.org/planet"


def descargar_osm_caminos() -> dict:
    """Caminos peatonales de OpenStreetMap (senderos, escaleras, ciclovías) a partir de las
    teselas vectoriales de OpenFreeMap (esquema OpenMapTiles, capa transportation, clase path).
    Se usa porque la API Overpass no respondió desde el entorno de trabajo.
    Licencia de los datos: ODbL (© colaboradores de OpenStreetMap)."""
    import math
    import mapbox_vector_tile

    tj = _get_json(OSM_TILEJSON, {})
    plantilla = tj["tiles"][0]
    x0, y0, x1, y1 = caja_comuna()
    x0, y0, x1, y1 = x0 - MARGEN_ENTORNO, y0 - MARGEN_ENTORNO, x1 + MARGEN_ENTORNO, y1 + MARGEN_ENTORNO
    z = 14
    n = 2 ** z
    tx = lambda lon: int((lon + 180) / 360 * n)
    ty = lambda lat: int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)
    feats = []
    for x in range(tx(x0), tx(x1) + 1):
        for y in range(ty(y1), ty(y0) + 1):
            req = urllib.request.Request(plantilla.format(z=z, x=x, y=y), headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=60) as r:
                capa = mapbox_vector_tile.decode(r.read()).get("transportation")
            if not capa:
                continue
            ext = capa.get("extent", 4096)

            def a_lonlat(px, py, x=x, y=y, ext=ext):
                lon = (x + px / ext) / n * 360 - 180
                lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1 - py / ext) / n))))
                return [round(lon, 7), round(lat, 7)]

            for f in capa["features"]:
                p = f["properties"]
                if p.get("class") != "path":
                    continue
                g = f["geometry"]
                lineas = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"] if g["type"] == "MultiLineString" else []
                for ln in lineas:
                    feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": [a_lonlat(*c) for c in ln]},
                                  "properties": {"subclase": p.get("subclass"), "superficie": p.get("surface"), "nivel": p.get("level"),
                                                 "puente": p.get("brunnel") == "bridge"}})
    (RAW / "osm_caminos.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats}), encoding="utf-8")
    return {"id": "osm_caminos", "estado": "ok", "registros": len(feats), "consulta": plantilla + f" (z{z}, capa transportation, clase path)"}


def main(solo=None):
    registro_path = RAW / "_registro.json"
    registro = json.loads(registro_path.read_text(encoding="utf-8")) if registro_path.exists() else {}
    ahora = datetime.now(timezone.utc).isoformat(timespec="seconds")

    # El límite de la comuna va primero porque define la caja de búsqueda de las demás capas.
    orden = sorted(FUENTES, key=lambda f: 0 if f["id"] == "comuna" else 1)
    for fuente in orden:
        if solo and fuente["id"] not in solo:
            continue
        print(f"Descargando {fuente['id']} ...", end=" ", flush=True)
        try:
            r = descargar_fuente(fuente)
            print(f"{r['registros']} registros")
        except Exception as e:  # se registra y se sigue
            r = {"id": fuente["id"], "estado": "error", "registros": 0, "error": str(e)}
            print("ERROR:", e)
        registro[fuente["id"]] = {**r, "fecha_descarga": ahora}

    if not solo or "osm_caminos" in solo:
        print("Descargando caminos de OpenStreetMap ...", end=" ", flush=True)
        try:
            r = descargar_osm_caminos()
            print(f"{r['registros']} tramos")
        except Exception as e:
            r = {"id": "osm_caminos", "estado": "error", "registros": 0, "error": str(e)}
            print("ERROR:", e)
        registro["osm_caminos"] = {**r, "fecha_descarga": ahora}

    if not solo or "indicadores_ecv" in solo:
        print("Descargando indicadores ECV ...", end=" ", flush=True)
        try:
            r = descargar_ecv()
            print(f"{r['registros']} filas")
        except Exception as e:
            r = {"id": "indicadores_ecv", "estado": "error", "registros": 0, "error": str(e)}
            print("ERROR:", e)
        registro["indicadores_ecv"] = {**r, "fecha_descarga": ahora}

    registro_path.write_text(json.dumps(registro, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
