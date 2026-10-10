"""
Paso 2 del pipeline: toma lo descargado en data/raw/, lo recorta a la Comuna 2,
calcula indicadores básicos y deja archivos livianos para la web en
frontend/public/data/.

Reglas:
  - Todo indicador sale de un dato descargado y de una fórmula escrita aquí.
  - Lo que no se puede calcular queda como None, nunca como un número inventado.
  - Las distancias en línea recta se etiquetan como "referencia". El tiempo
    de caminata por la red se calcula en la Fase 3 (accesibilidad.py).

Uso:
    python procesar.py
"""
import json
import re
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from pyproj import Transformer
import shapely
from shapely.geometry import GeometryCollection, MultiLineString, MultiPolygon, mapping, shape
from shapely.strtree import STRtree

from fuentes import FUENTES, INDICADORES_ECV

RAIZ = Path(__file__).resolve().parent.parent
RAW = RAIZ / "data" / "raw"
SALIDA = RAIZ / "frontend" / "public" / "data"
SALIDA.mkdir(parents=True, exist_ok=True)

# MAGNA-SIRGAS 2018 / Origen Nacional: sistema oficial de Colombia, en metros.
A_METROS = Transformer.from_crs(4326, 9377, always_xy=True).transform
A_GRADOS = Transformer.from_crs(9377, 4326, always_xy=True).transform


def transform(funcion, geom):
    """Reproyecta una geometría con una función de pyproj."""
    return shapely.transform(geom, lambda x, y: funcion(x, y), interleaved=False)


def solo(geom, familia: str):
    """Deja solo las partes de un tipo ('poligono' o 'linea') tras un recorte."""
    if geom.is_empty:
        return geom
    partes = getattr(geom, "geoms", [geom])
    if familia == "poligono":
        polis = [p for p in partes if p.geom_type in ("Polygon", "MultiPolygon")]
        polis = [q for p in polis for q in getattr(p, "geoms", [p])]
        return MultiPolygon(polis) if len(polis) > 1 else (polis[0] if polis else GeometryCollection())
    lineas = [p for p in partes if p.geom_type in ("LineString", "MultiLineString")]
    lineas = [q for p in lineas for q in getattr(p, "geoms", [p])]
    return MultiLineString(lineas) if len(lineas) > 1 else (lineas[0] if lineas else GeometryCollection())


# ---------------------------------------------------------------- utilidades
def leer(nombre: str) -> list:
    ruta = RAW / f"{nombre}.geojson"
    if not ruta.exists():
        return []
    return [f for f in json.loads(ruta.read_text(encoding="utf-8"))["features"] if f.get("geometry")]


def redondear(coords, nd=6):
    if isinstance(coords, (int, float)):
        return round(coords, nd)
    return [redondear(c, nd) for c in coords]


def a_feature(geom_grados, props: dict, tolerancia=0.0) -> dict:
    g = geom_grados.simplify(tolerancia, preserve_topology=True) if tolerancia else geom_grados
    if g.is_empty:
        return {"type": "Feature", "geometry": {"type": "Point", "coordinates": []}, "properties": props}
    m = mapping(g)
    return {"type": "Feature", "geometry": {"type": m["type"], "coordinates": redondear(m["coordinates"])},
            "properties": props}


def guardar(nombre: str, features: list):
    features = [f for f in features if f["geometry"]["coordinates"]]
    (SALIDA / f"{nombre}.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8")


def limpio(v):
    """Convierte textos vacíos o '<Null>' en None."""
    if isinstance(v, str):
        v = v.strip()
        if v in ("", "<Null>", "Null", "None"):
            return None
    return v


def fecha_ms(v):
    if isinstance(v, (int, float)) and v > 0:
        return datetime.fromtimestamp(v / 1000, tz=timezone.utc).date().isoformat()
    return None


def ha(geom_m) -> float:
    return geom_m.area / 10_000


# ------------------------------------------------- clasificación de equipamientos
CATEGORIAS_EQUIPAMIENTO = {  # dominio oficial del campo "categoria" (subtipo) de la capa
    1: "Básicos sociales", 2: "Básicos comunitarios", 3: "Seguridad y convivencia",
    4: "Infraestructuras", 5: "Institucionales", 6: "Uso dotacional",
}

# La capa no trae el tipo para muchos equipamientos sociales. Esta regla, documentada,
# los agrupa por palabras del nombre. Es una clasificación del equipo, no oficial.
REGLAS_GRUPO = [
    ("Salud", r"salud|hospital|metrosalud|\bips\b|\bese\b|cl[ií]nica"),
    ("Primera infancia", r"infantil|jard[ií]n|buen comienzo|guarder|hogar infantil|cdi\b"),
    ("Educación", r"educativ|escuela|colegio|secci[oó]n|liceo|universidad|instituci[oó]n"),
    ("Deporte y recreación", r"cancha|placa|polideport|polodeport|cncha|coliseo|piscina|gimnasio|unidad deportiva"),
    ("Cultura", r"biblioteca|m[uú]sica|cultura|teatro|casa de la cultura"),
    ("Seguridad y justicia", r"polic[ií]a|\bcai\b|justicia|bomberos|inspecci[oó]n"),
    ("Culto", r"parroquia|iglesia|templo|capilla|congregaci|seminario|convento"),
    ("Comunitario", r"sede social|acci[oó]n comunal|club de vida|juvenil|adulto mayor|comunal|asociaci"),
    ("Transporte", r"metro|estaci[oó]n|terminal"),
]


def modo_linea(linea: str) -> str:
    if linea in ("Línea A", "Línea B"):
        return "Metro"
    if linea in ("Línea K", "Línea J", "Línea L", "Línea H", "Línea M", "Línea P"):
        return "Metrocable"
    if linea in ("Línea 1", "Línea 2", "Línea O"):
        return "Metroplús / bus"
    if linea.startswith("Línea T"):
        return "Tranvía"
    return "Otro"


def grupo_equipamiento(nombre, tipo, categoria):
    texto = f"{nombre or ''} {tipo or ''}".lower()
    for grupo, patron in REGLAS_GRUPO:
        if re.search(patron, texto):
            return grupo
    if categoria == 4:
        return "Infraestructura de servicios"
    return "Otro o sin nombre"


# ---------------------------------------------------------------- proceso
def main():
    ahora = datetime.now(timezone.utc).isoformat(timespec="seconds")

    # Comuna y barrios -----------------------------------------------------
    comuna_f = leer("comuna")[0]
    comuna_g = shape(comuna_f["geometry"])
    comuna_m = transform(A_METROS, comuna_g)
    entorno_m = comuna_m.buffer(1200)
    entorno_g = transform(A_GRADOS, entorno_m)
    cerca_g = transform(A_GRADOS, comuna_m.buffer(300))

    barrios = []
    for f in leer("barrios"):
        g = shape(f["geometry"])
        p = f["properties"]
        barrios.append({"codigo": p["codigo"], "nombre": p["nombre"], "g": g, "m": transform(A_METROS, g)})
    barrios.sort(key=lambda b: b["codigo"])
    arbol_barrios = STRtree([b["g"] for b in barrios])

    def barrio_de(geom_grados):
        punto = geom_grados.representative_point()
        for i in arbol_barrios.query(punto):
            if barrios[i]["g"].covers(punto):
                return barrios[i]
        return None

    stats = {b["codigo"]: defaultdict(float) for b in barrios}
    listas = {b["codigo"]: defaultdict(list) for b in barrios}

    # Población (DANE, CNPV 2018) por manzana ------------------------------
    manzanas_out = []
    for f in leer("manzanas_censo"):
        g = shape(f["geometry"])
        if not comuna_g.covers(g.representative_point()):
            continue
        b = barrio_de(g)
        p = f["properties"]
        personas = p.get("tp27_perso") or 0
        area_ha = ha(transform(A_METROS, g))
        props = {
            "codigo_dane": p.get("cod_dane_a"),
            "barrio": b["nombre"] if b else None,
            "personas": personas,
            "viviendas": p.get("tvivienda") or 0,
            "hogares": p.get("tp16_hog") or 0,
            "menores_10": p.get("tp34_1_eda") or 0,
            "mayores_60": sum(p.get(k) or 0 for k in ("tp34_7_eda", "tp34_8_eda", "tp34_9_eda")),
            "area_ha": round(area_ha, 3),
            "densidad_hab_ha": round(personas / area_ha, 1) if area_ha > 0 else None,
        }
        manzanas_out.append(a_feature(g, props, 0.000005))
        if b:
            s = stats[b["codigo"]]
            for k in ("personas", "viviendas", "hogares", "menores_10", "mayores_60"):
                s[k] += props[k]
            s["manzanas"] += 1
    guardar("manzanas", manzanas_out)

    # Equipamientos y servicios (entorno) ----------------------------------
    def puntos_entorno(nombre_capa, constructor):
        salida = []
        for f in leer(nombre_capa):
            g = shape(f["geometry"])
            if not entorno_g.intersects(g):
                continue
            b = barrio_de(g) if comuna_g.intersects(g) else None
            props = constructor(f["properties"], g)
            props["en_comuna"] = bool(b) or comuna_g.intersects(g)
            props["barrio"] = b["nombre"] if b else None
            props["codigo_barrio"] = b["codigo"] if b else None
            salida.append((g, props, b))
        return salida

    equip = puntos_entorno("equipamientos", lambda p, g: {
        "nombre": limpio(p.get("nombre")) or "Sin nombre en la fuente",
        "categoria": CATEGORIAS_EQUIPAMIENTO.get(p.get("categoria"), "Sin categoría"),
        "tipo": limpio(p.get("tipo")),
        "grupo": grupo_equipamiento(limpio(p.get("nombre")), limpio(p.get("tipo")), p.get("categoria")),
        "nivel": limpio(p.get("nivel")),
        "fecha_actualizacion": fecha_ms(p.get("fecha_actualizacion")),
    })
    guardar("equipamientos", [a_feature(g, pr, 0.000005) for g, pr, _ in equip])
    for g, pr, b in equip:
        if b:
            stats[b["codigo"]]["equipamientos"] += 1
            stats[b["codigo"]][f"eq::{pr['grupo']}"] += 1
            listas[b["codigo"]]["equipamientos"].append(pr["nombre"])

    sedes = puntos_entorno("sedes_educativas", lambda p, g: {
        "nombre": limpio(p.get("sede_educa")) or limpio(p.get("nombre_est")),
        "establecimiento": limpio(p.get("nombre_est")),
        "sector": limpio(p.get("sector")),
        "servicio": limpio(p.get("servicio")),
        "direccion": limpio(p.get("direccion")),
        "estado": limpio(p.get("estado")),
        "vigencia": limpio(p.get("vigencia")),
    })
    guardar("sedes_educativas", [a_feature(g, pr) for g, pr, _ in sedes])
    for g, pr, b in sedes:
        if b:
            stats[b["codigo"]]["sedes_educativas"] += 1
            if pr["sector"] == "Oficial":
                stats[b["codigo"]]["sedes_oficiales"] += 1

    deporte = puntos_entorno("escenarios_deportivos", lambda p, g: {
        "nombre": limpio(p.get("nombre")) or limpio(p.get("nombre_equipamiento")),
        "equipamiento": limpio(p.get("nombre_equipamiento")),
        "tipologia": (limpio(p.get("tipologia_escenario")) or "").capitalize() or None,
        "direccion": limpio(p.get("direccion")),
    })
    guardar("escenarios_deportivos", [a_feature(g, pr) for g, pr, _ in deporte])
    for g, pr, b in deporte:
        if b:
            stats[b["codigo"]]["escenarios_deportivos"] += 1

    biblio = puntos_entorno("bibliotecas", lambda p, g: {
        "nombre": limpio(p.get("nombre")), "tipo": limpio(p.get("tipo")),
        "direccion": limpio(p.get("ubicacion")), "horario": limpio(p.get("horario")),
    })
    guardar("bibliotecas", [a_feature(g, pr) for g, pr, _ in biblio])
    for g, pr, b in biblio:
        if b:
            stats[b["codigo"]]["bibliotecas"] += 1

    # Transporte -----------------------------------------------------------
    estaciones = []
    for f in leer("estaciones"):
        g = shape(f["geometry"])
        p = f["properties"]
        linea = limpio(p.get("linea")) or ""
        modo = modo_linea(linea)
        b = barrio_de(g) if comuna_g.covers(g) else None
        estaciones.append((g, {"nombre": p.get("nombre"), "linea": linea, "modo": modo,
                               "tipo": limpio(p.get("tipo_est")), "en_comuna": bool(b),
                               "barrio": b["nombre"] if b else None}))
    guardar("estaciones", [a_feature(g, pr) for g, pr in estaciones])
    estaciones_metro = [(g, pr) for g, pr in estaciones if pr["modo"] in ("Metro", "Metrocable")]

    guardar("lineas_transporte", [
        a_feature(solo(shape(f["geometry"]).intersection(entorno_g), "linea"), {
            "nombre": f["properties"].get("nombre"), "linea": f["properties"].get("linea"),
        }, 0.00001)
        for f in leer("lineas_transporte") if shape(f["geometry"]).intersects(entorno_g)
    ])

    rutas = []
    for f in leer("rutas_bus"):
        g = shape(f["geometry"])
        if not g.intersects(comuna_g):
            continue
        p = f["properties"]
        rutas.append(a_feature(solo(g.intersection(cerca_g), "linea"), {
            "nombre": p.get("nombre"), "codigo": p.get("codigo"), "tipo": limpio(p.get("tipo")),
            "empresa": limpio(p.get("empresa")),
        }, 0.00001))
    guardar("rutas_bus", rutas)

    vias = []
    for f in leer("vias"):
        g = shape(f["geometry"])
        if not g.intersects(cerca_g):
            continue
        p = f["properties"]
        vias.append(a_feature(solo(g.intersection(cerca_g), "linea"), {
            "nombre": limpio(p.get("nombre_comun")) or limpio(p.get("label")),
            "tipo_via": limpio(p.get("tipo_via")),
        }, 0.000005))
    guardar("vias", vias)

    guardar("jerarquia_vial_pot", [
        a_feature(solo(shape(f["geometry"]).intersection(cerca_g), "linea"), {
            "nombre": limpio(f["properties"].get("nombre")),
            "jerarquia": limpio(f["properties"].get("jerarquizacion_via")),
            "clasificacion": limpio(f["properties"].get("clasificacion_via")),
            "estado": limpio(f["properties"].get("estado")),
        }, 0.00001)
        for f in leer("jerarquia_vial_pot") if shape(f["geometry"]).intersects(cerca_g)
    ])

    # Siniestros viales (Secretaría de Movilidad) --------------------------
    siniestros = []
    por_anio = defaultdict(Counter)
    for f in leer("siniestros_viales"):
        g = shape(f["geometry"])
        p = f["properties"]
        anio = int(p["anio"]) if p.get("anio") else None
        clase = (limpio(p.get("clase_siniestro")) or "SIN DATO").capitalize()
        b = barrio_de(g) if comuna_g.covers(g) else None
        siniestros.append(a_feature(g, {"clase": clase, "gravedad": (limpio(p.get("gravedad_siniestro")) or "").capitalize(),
                                        "anio": anio, "barrio": b["nombre"] if b else None}))
        if anio:
            por_anio[anio][clase] += 1
        if b:
            stats[b["codigo"]]["siniestros"] += 1
            if clase == "Atropello":
                stats[b["codigo"]]["atropellos"] += 1
    guardar("siniestros_viales", siniestros)

    # Espacio público --------------------------------------------------------
    def poligonos(nombre_capa, recorte_g, constructor, tol=0.000005):
        salida = []
        for f in leer(nombre_capa):
            g = shape(f["geometry"])
            if not g.is_valid:
                g = g.buffer(0)
            if not g.intersects(recorte_g):
                continue
            recorte = solo(g.intersection(recorte_g), "poligono")
            if not recorte.is_empty:
                salida.append((recorte, constructor(f["properties"])))
        return salida

    ep = poligonos("espacio_publico", entorno_g, lambda p: {
        "nombre": limpio(p.get("nombre")), "categoria": limpio(p.get("categoria")),
        "subcategoria": limpio(p.get("subcategoria")), "nivel": limpio(p.get("nivel")),
    })
    guardar("espacio_publico", [a_feature(g, pr, 0.000005) for g, pr in ep])

    epp = poligonos("espacio_publico_proyectado", comuna_g, lambda p: {
        "nombre": limpio(p.get("nombre")), "categoria": limpio(p.get("categoria")),
        "subcategoria": limpio(p.get("subcategoria")), "localizacion": limpio(p.get("localizacion")),
        "fecha_adopcion": fecha_ms(p.get("fecha_adopcion")),
    })
    for g, pr in epp:
        b = barrio_de(g)
        pr["barrio"] = b["nombre"] if b else None
        pr["codigo_barrio"] = b["codigo"] if b else None
        pr["area_m2"] = round(transform(A_METROS, g).area)
    epp = [(g, pr) for g, pr in epp if pr["area_m2"] >= 20]  # descarta astillas del recorte
    guardar("espacio_publico_proyectado", [a_feature(g, pr, 0.000005) for g, pr in epp])

    # POT: tratamientos, instrumentos, amenaza y riesgo ---------------------
    trat = poligonos("tratamientos", comuna_g, lambda p: {
        "codigo": limpio(p.get("codigo_tramiento")), "tratamiento": limpio(p.get("tratamiento")),
        "categoria": limpio(p.get("categoria_tratamiento")),
        "densidad_max_viv_ha": limpio(p.get("densidadmax")),
        "indice_construccion_max": limpio(p.get("indiceconstruccmax")),
        "altura_normativa": limpio(p.get("alturanormativa")),
        "zona": limpio(p.get("zona")),
        "fecha_adopcion": fecha_ms(p.get("fecha_adopcion")),
    })
    trat = [(g, pr) for g, pr in trat if g.area > 0]
    guardar("tratamientos", [a_feature(g, pr, 0.000005) for g, pr in trat])

    inst = poligonos("instrumentos", comuna_g, lambda p: {
        "instrumento": limpio(p.get("instrumento")), "nivel": limpio(p.get("nivel")),
        "codigo_tratamiento": limpio(p.get("codigo_tratamiento")), "categoria": limpio(p.get("categoria")),
    })
    inst = [(g, pr) for g, pr in inst if g.area > 0]
    guardar("instrumentos", [a_feature(g, pr, 0.000005) for g, pr in inst])

    amen = poligonos("amenaza_movimiento_masa", comuna_g, lambda p: {
        "grado": limpio(p.get("grado_amenaza")), "categoria": limpio(p.get("categoria")),
    })
    amen = [(g, pr) for g, pr in amen if g.area > 0]
    guardar("amenaza_movimiento_masa", [a_feature(g, pr, 0.000005) for g, pr in amen])

    rnm = poligonos("riesgo_no_mitigable", comuna_g, lambda p: {
        "riesgo": limpio(p.get("riesgo")), "nombre": limpio(p.get("nombre")),
        "tipo_amenaza": limpio(p.get("tipo_amenaza")), "descripcion": limpio(p.get("descripcion")),
    })
    rnm = [(g, pr) for g, pr in rnm if g.area > 0]
    guardar("riesgo_no_mitigable", [a_feature(g, pr, 0.000005) for g, pr in rnm])

    # Seguridad, cámaras, semáforos y POT complementario (capas del 10 de octubre de 2026) ------
    def nombre_barrio(txt):
        t = (txt or "").strip().lower().replace("de los ", "").replace("de ", "")
        for b in barrios:
            n = b["nombre"].lower().replace("de los ", "").replace("de ", "")
            if t == n or t.startswith(n[:8]) or n.startswith(t[:8]):
                return b["nombre"]
        return None

    seg = {"nota": "Hurto y homicidio son del año 2017 (último año publicado en esa capa). Se muestran solo conteos por barrio, nunca puntos de víctimas."}
    for capa, campo in (("hurto_2017", "conducta"), ("homicidio_2017", "modalidad")):
        filas = [f["properties"] for f in json.loads((RAW / f"{capa}.geojson").read_text(encoding="utf-8"))["features"]
                 if str(f["properties"].get("cod_comuna")).lstrip("0") == "2"]
        por_b, por_c = Counter(), Counter()
        for p in filas:
            por_b[nombre_barrio(p.get("nom_barrio")) or limpio(p.get("nom_barrio")) or "Sin dato"] += 1
            por_c[limpio(p.get(campo)) or "Sin dato"] += 1
        seg[capa] = {"total": len(filas), "por_barrio": [{"nombre": k, "n": v} for k, v in por_b.most_common()],
                     "por_tipo": [{"nombre": k, "n": v} for k, v in por_c.most_common()]}

    mort = []
    for f in leer("mortalidad_vial"):
        g = shape(f["geometry"])
        if not comuna_g.covers(g):
            continue
        p = f["properties"]
        b = barrio_de(g)
        anio = (limpio(p.get("fecha_ocurrencia")) or "")[-4:]
        mort.append(a_feature(g, {"clase": limpio(p.get("clase")) or "Sin dato", "anio": anio, "barrio": b["nombre"] if b else None}))
    guardar("mortalidad_vial", mort)
    seg["mortalidad_vial"] = {
        "total": len(mort),
        "por_anio": [{"anio": k, "n": v} for k, v in sorted(Counter(f["properties"]["anio"] for f in mort).items())],
        "por_clase": [{"nombre": k, "n": v} for k, v in Counter(f["properties"]["clase"] for f in mort).most_common()],
        "por_barrio": [{"nombre": k or "Sin dato", "n": v} for k, v in Counter(f["properties"]["barrio"] for f in mort).most_common()],
    }

    cam = []
    for f in leer("cctv_camaras"):
        g = shape(f["geometry"])
        if not comuna_g.covers(g):
            continue
        p = f["properties"]
        b = barrio_de(g)
        cam.append(a_feature(g, {"tipo": limpio(p.get("tipo_camara")) or "Sin dato", "estado": limpio(p.get("estado")), "direccion": limpio(p.get("direccion")), "barrio": b["nombre"] if b else None}))
    guardar("camaras_cctv", cam)
    seg["camaras"] = {"total": len(cam), "por_tipo": [{"nombre": k, "n": v} for k, v in Counter(f["properties"]["tipo"] for f in cam).most_common()],
                      "por_barrio": [{"nombre": k or "Sin dato", "n": v} for k, v in Counter(f["properties"]["barrio"] for f in cam).most_common()]}

    sem = []
    for f in leer("semaforos"):
        g = shape(f["geometry"])
        if comuna_g.covers(g):
            p = f["properties"]
            sem.append(a_feature(g, {"direccion": limpio(p.get("direccion")), "instalacion": limpio(p.get("fecha_instalacion")), "barrio": limpio(p.get("nombre_barrio"))}))
    guardar("semaforos", sem)
    seg["semaforos"] = {"total": len(sem)}

    cent = poligonos("pot_centralidades", comuna_g, lambda p: {"nombre": limpio(p.get("nombre")), "caracter": limpio(p.get("caracter")), "orden": limpio(p.get("orden")), "estado": limpio(p.get("estado")), "jerarquia": limpio(p.get("jerarquia"))})
    guardar("pot_centralidades", [a_feature(g, pr, 0.000005) for g, pr in cent if g.area > 0])
    ie = poligonos("pot_intervencion_estrategica", comuna_g, lambda p: {"nombre": limpio(p.get("label")), "clasificacion": limpio(p.get("clasificacion")), "zona": limpio(p.get("zona"))})
    guardar("pot_intervencion_estrategica", [a_feature(g, pr, 0.00001) for g, pr in ie if g.area > 0])
    cuad = poligonos("cuadrantes_policia", comuna_g, lambda p: {"cuadrante": limpio(p.get("id_cuadrante")), "cai": limpio(p.get("distrito")), "estacion": limpio(p.get("estacion"))}, 0.00001)
    guardar("cuadrantes_policia", [a_feature(g, pr, 0.00001) for g, pr in cuad if g.area > 0])

    corr = []
    for f in leer("pot_corredores_transporte"):
        g = shape(f["geometry"])
        if entorno_g.intersects(g):
            p = f["properties"]
            corr.append(a_feature(g.intersection(entorno_g), {"linea": limpio(p.get("linea")), "tramo": limpio(p.get("nombre_tramo")), "nombre": limpio(p.get("nombre"))}, 0.000003))
    guardar("pot_corredores_transporte", corr)
    seg["pot_complementario"] = {"centralidades": [pr["nombre"] for _, pr in cent], "areas_intervencion": [pr["nombre"] for _, pr in ie]}
    (SALIDA / "seguridad.json").write_text(json.dumps(seg, ensure_ascii=False, indent=1), encoding="utf-8")

    # Áreas por barrio (en metros) -----------------------------------------
    def areas_por_barrio(items, clave_fn, prefijo):
        for g, pr in items:
            gm = transform(A_METROS, g)
            for b in barrios:
                if not b["m"].intersects(gm):
                    continue
                area = b["m"].intersection(gm).area
                if area > 0:
                    stats[b["codigo"]][f"{prefijo}::{clave_fn(pr)}"] += area

    areas_por_barrio(ep, lambda pr: "existente", "ep_m2")
    areas_por_barrio(epp, lambda pr: "proyectado", "ep_m2")
    areas_por_barrio(trat, lambda pr: pr["tratamiento"] or "Sin dato", "trat_m2")
    areas_por_barrio(amen, lambda pr: pr["grado"] or "Sin dato", "amen_m2")
    areas_por_barrio(rnm, lambda pr: pr["riesgo"] or "Sin dato", "rnm_m2")

    # Oferta inmobiliaria (OIME) -------------------------------------------
    oferta = []
    for f in leer("oferta_inmobiliaria"):
        g = shape(f["geometry"])
        p = f["properties"]
        b = barrio_de(g) if comuna_g.covers(g) else None
        area = p.get("private_area_m2") or p.get("total_area_m2")
        precio = p.get("price")
        props = {
            "operacion": p.get("tipo_comercio"), "inmueble": p.get("tipo_inmueble"),
            "precio": precio, "area_m2": area,
            "precio_m2": round(precio / area) if precio and area and area > 0 else None,
            "estrato": p.get("stratum"), "antiguedad": limpio(p.get("age")),
            "habitaciones": p.get("bedrooms_number"), "anio": p.get("year"),
            "barrio": b["nombre"] if b else None,
            "barrio_reportado": limpio(p.get("neighborhood_calculated")),
            "en_comuna": bool(b),
            "enlace": limpio(p.get("link")),
        }
        oferta.append(a_feature(g, props))
        if b and props["operacion"] == "Venta" and props["inmueble"] in ("Apartamento", "Casa") and props["precio_m2"]:
            listas[b["codigo"]]["venta_m2"].append(props["precio_m2"])
    guardar("oferta_inmobiliaria", oferta)

    # Fichas de barrio -------------------------------------------------------
    def distancia_lineal_estacion(gm_centro):
        mejor = None
        for g, pr in estaciones_metro:
            d = transform(A_METROS, g).distance(gm_centro)
            if mejor is None or d < mejor[0]:
                mejor = (d, pr)
        return mejor

    barrios_out, tabla = [], []
    for b in barrios:
        s = stats[b["codigo"]]
        area_ha = ha(b["m"])
        personas = int(s["personas"])
        ep_m2 = s["ep_m2::existente"]
        d_est = distancia_lineal_estacion(b["m"].representative_point())

        def pct(prefijo, clave):
            return round(100 * s[f"{prefijo}::{clave}"] / b["m"].area, 1)

        tratamientos = {k.split("::", 1)[1]: round(100 * v / b["m"].area, 1)
                        for k, v in s.items() if k.startswith("trat_m2::")}
        equip_grupo = {k.split("::", 1)[1]: int(v) for k, v in s.items() if k.startswith("eq::")}
        venta = listas[b["codigo"]]["venta_m2"]

        ficha = {
            "codigo": b["codigo"], "nombre": b["nombre"],
            "area_ha": round(area_ha, 1),
            "poblacion_2018": personas or None,
            "viviendas_2018": int(s["viviendas"]) or None,
            "hogares_2018": int(s["hogares"]) or None,
            "menores_10_2018": int(s["menores_10"]) or None,
            "mayores_60_2018": int(s["mayores_60"]) or None,
            "densidad_hab_ha": round(personas / area_ha, 1) if personas else None,
            "equipamientos": int(s["equipamientos"]),
            "equipamientos_por_grupo": dict(sorted(equip_grupo.items(), key=lambda kv: -kv[1])),
            "sedes_educativas": int(s["sedes_educativas"]),
            "sedes_educativas_oficiales": int(s["sedes_oficiales"]),
            "escenarios_deportivos": int(s["escenarios_deportivos"]),
            "bibliotecas": int(s["bibliotecas"]),
            "espacio_publico_m2": round(ep_m2),
            "espacio_publico_m2_hab": round(ep_m2 / personas, 2) if personas else None,
            "espacio_publico_proyectado_m2": round(s["ep_m2::proyectado"]),
            "tratamientos_pct": dict(sorted(tratamientos.items(), key=lambda kv: -kv[1])),
            "amenaza_alta_pct": pct("amen_m2", "Alta"),
            "amenaza_media_pct": pct("amen_m2", "Media"),
            "amenaza_baja_pct": pct("amen_m2", "Baja"),
            "riesgo_no_mitigable_pct": pct("rnm_m2", "Alto riesgo no mitigable"),
            "siniestros_viales": int(s["siniestros"]),
            "atropellos": int(s["atropellos"]),
            "estacion_mas_cercana": d_est[1]["nombre"] + f" ({d_est[1]['linea']})" if d_est else None,
            "estacion_distancia_lineal_m": round(d_est[0]) if d_est else None,
            "ofertas_venta_vivienda": len(venta),
            "mediana_precio_m2_venta": round(statistics.median(venta)) if len(venta) >= 3 else None,
        }
        barrios_out.append(a_feature(b["g"], ficha, 0.000003))
        tabla.append(ficha)
    guardar("barrios", barrios_out)
    guardar("comuna", [a_feature(comuna_g, {"codigo": "02", "nombre": "Santa Cruz",
                                             "area_ha": round(ha(comuna_m), 1)}, 0.000003)])

    # Indicadores de comuna ------------------------------------------------
    total = lambda k: sum((t[k] or 0) for t in tabla)
    poblacion = total("poblacion_2018")
    ep_total = total("espacio_publico_m2")
    area_comuna = ha(comuna_m)

    def pct_comuna(items, clave_fn):
        acum = Counter()
        for g, pr in items:
            acum[clave_fn(pr)] += transform(A_METROS, g).intersection(comuna_m).area
        return {k: round(100 * v / comuna_m.area, 1) for k, v in acum.most_common()}

    ecv_raw = json.loads((RAW / "indicadores_ecv.json").read_text(encoding="utf-8"))
    ecv = {}
    for clave, meta in ecv_raw.items():
        filas = meta["filas"]
        fila = next((r for r in filas if r["codigo"] == "02"), None)
        if not fila:
            continue
        anios = sorted(fila["valores"], key=int)
        ultimo = anios[-1]
        valores_ultimo = sorted(((r["valores"].get(ultimo), r["nombre"]) for r in filas if r["valores"].get(ultimo) is not None),
                                reverse=(meta["mejor"] == "alto"))
        posicion = next((i + 1 for i, (_, n) in enumerate(valores_ultimo) if n == fila["nombre"]), None)
        ecv[clave] = {
            "nombre": meta["nombre"], "mejor": meta["mejor"],
            "serie": [{"anio": int(a), "valor": fila["valores"][a]} for a in anios],
            "ultimo_anio": int(ultimo), "ultimo_valor": fila["valores"][ultimo],
            "posicion": posicion, "de": len(valores_ultimo),
            "mejor_valor_ciudad": valores_ultimo[0][0] if valores_ultimo else None,
            "mejor_territorio": valores_ultimo[0][1] if valores_ultimo else None,
        }

    est_en_comuna = [pr for _, pr in estaciones if pr["en_comuna"]]
    indicadores = {
        "generado": ahora,
        "comuna": {
            "nombre": "Santa Cruz", "codigo": "02", "area_ha": round(area_comuna, 1),
            "barrios": len(barrios),
            "poblacion_2018": poblacion,
            "viviendas_2018": total("viviendas_2018"),
            "densidad_hab_ha": round(poblacion / area_comuna, 1) if poblacion else None,
            "equipamientos": total("equipamientos"),
            "sedes_educativas": total("sedes_educativas"),
            "escenarios_deportivos": total("escenarios_deportivos"),
            "bibliotecas": total("bibliotecas"),
            "espacio_publico_m2": ep_total,
            "espacio_publico_m2_hab": round(ep_total / poblacion, 2) if poblacion else None,
            "espacio_publico_proyectado_m2": total("espacio_publico_proyectado_m2"),
            "estaciones_en_comuna": [f"{e['nombre']} ({e['linea']})" for e in est_en_comuna],
            "rutas_bus": len(rutas),
            "tratamientos_pct": pct_comuna(trat, lambda pr: pr["tratamiento"] or "Sin dato"),
            "amenaza_pct": pct_comuna(amen, lambda pr: pr["grado"] or "Sin dato"),
            "riesgo_pct": pct_comuna(rnm, lambda pr: pr["riesgo"] or "Sin dato"),
            "siniestros_total": len(siniestros),
            "siniestros_por_anio": [{"anio": a, **dict(c), "total": sum(c.values())} for a, c in sorted(por_anio.items())],
            "ofertas_inmobiliarias": sum(1 for f in oferta if f["properties"]["en_comuna"]),
            # Indicadores que todavía no se pueden calcular: se muestran como pendientes.
            "red_peatonal_inventariada_pct": None,
            "tiempo_caminata_metro_min": None,
        },
        "barrios": tabla,
        "ecv": ecv,
    }
    # red.py agrega "accesibilidad", "infraestructura" y algunos campos de la comuna; si ya existían se conservan
    previo = SALIDA / "indicadores.json"
    if previo.is_file():
        ant = json.loads(previo.read_text(encoding="utf-8"))
        for k in ("accesibilidad", "infraestructura"):
            if k in ant:
                indicadores[k] = ant[k]
        for k, v in ant.get("comuna", {}).items():
            if indicadores["comuna"].get(k) is None and v is not None:
                indicadores["comuna"][k] = v
    (SALIDA / "indicadores.json").write_text(json.dumps(indicadores, ensure_ascii=False, indent=1), encoding="utf-8")

    procesar_ciudad(ecv_raw)
    procesar_edificios(comuna_g)

    # Catálogo de fuentes con su estado real --------------------------------
    registro = json.loads((RAW / "_registro.json").read_text(encoding="utf-8"))
    fechas_datos = {}
    for fuente in FUENTES:
        fechas = []
        for f in leer(fuente["id"]):
            for k in ("fecha_actualizacion", "fecha_adopcion"):
                d = fecha_ms(f["properties"].get(k))
                if d:
                    fechas.append(d)
        fechas_datos[fuente["id"]] = max(fechas) if fechas else None

    catalogo = []
    for fuente in FUENTES:
        r = registro.get(fuente["id"], {})
        catalogo.append({
            "id": fuente["id"], "nombre": fuente["nombre"], "entidad": fuente["entidad"], "tipo": fuente["tipo"],
            "url_servicio": f"{fuente['servicio']}/{fuente['capa']}",
            "consulta": r.get("consulta"), "formato_origen": "ArcGIS REST (GeoJSON)",
            "cobertura": {"comuna": "Comuna 2 (polígono oficial)", "entorno": "Comuna 2 y 1,2 km alrededor",
                          "atributo": f"Filtro: {fuente.get('where', '')}"}[fuente["filtro"]],
            "licencia": fuente["licencia"], "estado": r.get("estado", "sin descargar"),
            "registros": r.get("registros", 0), "fecha_descarga": r.get("fecha_descarga"),
            "ultima_actualizacion_en_datos": fechas_datos.get(fuente["id"]),
            "error": r.get("error"),
        })
    r = registro.get("indicadores_ecv", {})
    catalogo.append({
        "id": "indicadores_ecv", "nombre": "Indicadores de la Encuesta de Calidad de Vida por comuna",
        "entidad": INDICADORES_ECV["entidad"], "tipo": "oficial",
        "url_servicio": INDICADORES_ECV["servicio"], "consulta": r.get("consulta"),
        "formato_origen": "ArcGIS REST (JSON)", "cobertura": "16 comunas y 5 corregimientos",
        "licencia": FUENTES[0]["licencia"], "estado": r.get("estado", "sin descargar"),
        "registros": r.get("registros", 0), "fecha_descarga": r.get("fecha_descarga"),
        "ultima_actualizacion_en_datos": None, "error": r.get("error"),
    })
    (SALIDA / "fuentes.json").write_text(json.dumps(catalogo, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"Población 2018 en la comuna: {poblacion:,}")
    print(f"Equipamientos en la comuna: {total('equipamientos')}")
    print(f"Espacio público existente: {ep_total:,} m² ({indicadores['comuna']['espacio_publico_m2_hab']} m²/hab)")
    print("Archivos en", SALIDA)


def procesar_ciudad(ecv_raw: dict):
    """Capas de toda Medellín para el modo "Toda la ciudad" del mapa, con los mismos
    atributos que las de la comuna y un resumen por comuna."""
    comunas = []
    for f in leer("comunas_ciudad"):
        g = shape(f["geometry"])
        if not g.is_valid:
            g = g.buffer(0)
        p = f["properties"]
        if not p.get("nombre"):  # zonas sin nombre en la fuente (SN01, SN02)
            continue
        comunas.append({"codigo": p["codigo"], "nombre": p["nombre"], "tipo": limpio(p.get("identificacion")) or "",
                        "g": g, "m": transform(A_METROS, g)})
    if not comunas:
        return
    arbol = STRtree([c["g"] for c in comunas])

    def comuna_de(g):
        punto = g.representative_point()
        for i in arbol.query(punto):
            if comunas[i]["g"].covers(punto):
                return comunas[i]
        return None

    conteo = defaultdict(Counter)

    def puntos(origen, destino, constructor, tol=0.0, clave=None):
        salida = []
        for f in leer(origen):
            g = shape(f["geometry"])
            if not g.is_valid:
                g = g.buffer(0)
            c = comuna_de(g)
            pr = constructor(f["properties"])
            pr["comuna"] = c["nombre"] if c else None
            pr["codigo_comuna"] = c["codigo"] if c else None
            pr["en_comuna"] = bool(c and c["codigo"] == "02")
            if c and clave:
                conteo[c["codigo"]][clave] += 1
                if clave == "equipamientos":
                    conteo[c["codigo"]][f"eq::{pr['grupo']}"] += 1
            salida.append(a_feature(g, pr, tol))
        guardar(destino, salida)
        return salida

    puntos("equipamientos_ciudad", "equipamientos_ciudad", lambda p: {
        "nombre": limpio(p.get("nombre")) or "Sin nombre en la fuente",
        "categoria": CATEGORIAS_EQUIPAMIENTO.get(p.get("categoria"), "Sin categoría"),
        "tipo": limpio(p.get("tipo")),
        "grupo": grupo_equipamiento(limpio(p.get("nombre")), limpio(p.get("tipo")), p.get("categoria")),
        "nivel": limpio(p.get("nivel")),
        "barrio": limpio(p.get("nom_barrio")),
    }, 0.00001, "equipamientos")
    puntos("sedes_educativas_ciudad", "sedes_educativas_ciudad", lambda p: {
        "nombre": limpio(p.get("sede_educa")) or limpio(p.get("nombre_est")),
        "establecimiento": limpio(p.get("nombre_est")), "sector": limpio(p.get("sector")),
        "servicio": limpio(p.get("servicio")), "direccion": limpio(p.get("direccion")), "estado": limpio(p.get("estado")),
    }, 0, "sedes_educativas")
    puntos("escenarios_deportivos_ciudad", "escenarios_deportivos_ciudad", lambda p: {
        "nombre": limpio(p.get("nombre")) or limpio(p.get("nombre_equipamiento")),
        "equipamiento": limpio(p.get("nombre_equipamiento")),
        "tipologia": (limpio(p.get("tipologia_escenario")) or "").capitalize() or None,
        "direccion": limpio(p.get("direccion")),
    }, 0, "escenarios_deportivos")
    puntos("bibliotecas_ciudad", "bibliotecas_ciudad", lambda p: {
        "nombre": limpio(p.get("nombre")), "tipo": limpio(p.get("tipo")),
        "direccion": limpio(p.get("ubicacion")), "horario": limpio(p.get("horario")),
    }, 0, "bibliotecas")
    puntos("estaciones_ciudad", "estaciones_ciudad", lambda p: {
        "nombre": p.get("nombre"), "linea": limpio(p.get("linea")) or "",
        "modo": modo_linea(limpio(p.get("linea")) or ""), "tipo": limpio(p.get("tipo_est")),
    }, 0, "estaciones")
    puntos("espacio_publico_ciudad", "espacio_publico_ciudad", lambda p: {
        "nombre": limpio(p.get("nombre")), "categoria": limpio(p.get("categoria")),
        "subcategoria": limpio(p.get("subcategoria")), "nivel": limpio(p.get("nivel")),
    }, 0.00002)
    guardar("lineas_ciudad", [a_feature(shape(f["geometry"]), {"nombre": f["properties"].get("nombre"),
                                                               "linea": f["properties"].get("linea")}, 0.00002)
                              for f in leer("lineas_ciudad")])
    guardar("barrios_ciudad", [a_feature(shape(f["geometry"]), {
        "codigo": f["properties"].get("codigo"), "nombre": f["properties"].get("nombre"),
        "codigo_comuna": f["properties"].get("limitecomunacorregimientoid"),
    }, 0.00003) for f in leer("barrios_ciudad")])

    ultimo = {}
    for clave, meta in ecv_raw.items():
        for fila in meta["filas"]:
            anios = sorted(fila["valores"], key=int)
            if anios:
                ultimo.setdefault(fila["codigo"], {})[clave] = {"anio": int(anios[-1]), "valor": fila["valores"][anios[-1]]}

    salida = []
    for c in comunas:
        k = conteo[c["codigo"]]
        e = ultimo.get(c["codigo"], {})
        salida.append(a_feature(c["g"], {
            "codigo": c["codigo"], "nombre": c["nombre"], "tipo": c["tipo"],
            "area_ha": round(ha(c["m"]), 1),
            "equipamientos": k["equipamientos"], "sedes_educativas": k["sedes_educativas"],
            "escenarios_deportivos": k["escenarios_deportivos"], "bibliotecas": k["bibliotecas"],
            "estaciones": k["estaciones"],
            "salud": k["eq::Salud"], "primera_infancia": k["eq::Primera infancia"],
            "imcv": e.get("imcv", {}).get("valor"), "imcv_anio": e.get("imcv", {}).get("anio"),
            "ipm": e.get("ipm", {}).get("valor"),
            "es_santa_cruz": c["codigo"] == "02",
        }, 0.00005))
    guardar("comunas_ciudad", salida)
    print(f"Ciudad: {len(comunas)} comunas y corregimientos procesados")


def procesar_edificios(comuna_g):
    """Edificaciones de la Comuna 2 con su número de pisos (catastro), para la maqueta 3D.
    Se guarda el número de pisos ("p"; la altura en el mapa es pisos × 3 m) y el código del
    barrio donde cae el edificio ("b"), para resaltar los edificios del barrio bajo el mouse."""
    from shapely.strtree import STRtree
    barrios = json.loads((SALIDA / "barrios.geojson").read_text(encoding="utf-8"))["features"]
    formas = [shape(b["geometry"]) for b in barrios]
    codigos = [b["properties"]["codigo"] for b in barrios]
    arbol = STRtree(formas)
    salida = []
    for f in leer("construcciones"):
        g = shape(f["geometry"])
        if not g.is_valid:
            g = g.buffer(0)
        if g.is_empty:
            continue
        punto = g.representative_point()
        if not comuna_g.contains(punto):
            continue
        dentro = [i for i in arbol.query(punto) if formas[i].contains(punto)]
        pisos = f["properties"].get("numero_pisos") or 1
        props = {"p": int(pisos)}
        if dentro:
            props["b"] = codigos[dentro[0]]
        salida.append(a_feature(g, props, 0.000004))
    if salida:
        (SALIDA / "edificios.geojson").write_text(
            json.dumps({"type": "FeatureCollection", "features": salida}, separators=(",", ":")), encoding="utf-8")
    print(f"Edificaciones de la comuna para 3D: {len(salida):,}")

if __name__ == "__main__":
    main()
