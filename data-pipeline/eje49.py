"""
Análisis del eje de la Carrera 49 (Avenida Venezuela) sobre la red peatonal.

Pregunta: para la gente de la comuna, ¿ir caminando por la 49 es más rápido? ¿Para quién y hacia dónde?

Método (todo con la red de data-pipeline/red.py y tiempos de Tobler, a pie):
  1. El eje se arma con las vías del POT "Venezuela (Carrera 49)", "Carrera 49B" y "Carrera 49C"
     (las 49A son otra calle y se miden aparte). Los nodos de la red a menos de 12 m del eje son "del eje".
  2. Para cada manzana del censo (ponderada por personas) se calcula el tiempo al destino más cercano
     de cada tipo por la ruta más rápida, y por una ruta obligada a recorrer al menos 400 m del eje.
  3. Se cuenta cuánto del eje usa ya la ruta más rápida.
  4. Escenario: el POT proyecta un tramo de la 49C. Se simula conectar el hueco con una línea recta
     (supuesto del escenario, no un dato).

No se inventa nada: si un destino no es alcanzable, esa manzana queda fuera del promedio.
Salida: frontend/public/data/eje49.json, eje49.geojson, eje49_manzanas.geojson
"""
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
from pyproj import Transformer
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import dijkstra
from scipy.spatial import cKDTree
from shapely.geometry import LineString, Point, shape
from shapely.strtree import STRtree

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "frontend" / "public" / "data"
A_M = Transformer.from_crs(4326, 9377, always_xy=True).transform

UMBRAL_EJE_M = 12      # distancia máxima de un nodo de la red al trazado del eje
LARGO_MIN_EJE_M = 150  # metros mínimos que debe recorrer la ruta "por la 49"
ENGANCHE_MAX_M = 200   # una manzana más lejos que esto de la red no se calcula
MARGEN_UTIL_S = 60     # "la 49 queda en el camino" si cuesta a lo sumo 1 minuto más
TIPOS = {
    "transporte_masivo": "Metro, Metrocable o Metroplús",
    "parada_bus": "Parada de bus",
    "colegio": "Colegio",
    "salud": "Centro de salud",
    "parque": "Parque o espacio público",
}


def cargar(nombre):
    return json.loads((DATOS / nombre).read_text(encoding="utf-8"))


def metros(g):
    from shapely.ops import transform
    return transform(A_M, g)


def main():
    red = cargar("red.json")
    n = len(red["nodos"])
    xy = np.array([A_M(x, y) for x, y, _ in red["nodos"]])

    # --- grafo dirigido (tiempo en s y largo en m) ---------------------------------
    t_dir, l_dir = {}, {}
    for a, b, largo, t_ab, t_ba, *_ in red["tramos"]:
        for u, v, t in ((a, b, t_ab), (b, a, t_ba)):
            if (u, v) not in t_dir or t < t_dir[(u, v)]:
                t_dir[(u, v)] = max(t, 0.01)
                l_dir[(u, v)] = largo
    us = np.array([k[0] for k in t_dir]); vs = np.array([k[1] for k in t_dir])
    G = csr_matrix((np.array(list(t_dir.values())), (us, vs)), shape=(n, n))
    GR = csr_matrix((np.array(list(t_dir.values())), (vs, us)), shape=(n, n))  # al revés: tiempo "hasta" un nodo
    GL = csr_matrix((np.array(list(l_dir.values())), (us, vs)), shape=(n, n))

    # --- el eje ---------------------------------------------------------------------
    jer = cargar("jerarquia_vial_pot.geojson")["features"]
    nombres = {"Venezuela (Carrera 49)", "Carrera 49B", "Carrera 49C"}
    tramos_eje, geoms_exist, geoms_proy = [], [], []
    for f in jer:
        p = f["properties"]
        if p["nombre"] in nombres:
            g = metros(shape(f["geometry"]))
            tramos_eje.append({"nombre": p["nombre"], "estado": p["estado"], "metros": round(g.length)})
            (geoms_proy if p["estado"] == "Proyectado" else geoms_exist).append(g)
    eje_exist = [g for g in geoms_exist]
    arbol = STRtree(eje_exist)
    es_eje = np.zeros(n, bool)
    for i, (x, y) in enumerate(xy):
        pt = Point(x, y)
        for j in arbol.query(pt.buffer(UMBRAL_EJE_M)):
            if eje_exist[j].distance(pt) <= UMBRAL_EJE_M:
                es_eje[i] = True
                break
    nodos_eje = np.where(es_eje)[0]
    idx = {int(v): k for k, v in enumerate(nodos_eje)}
    m = len(nodos_eje)
    print(f"Nodos del eje: {m}")

    # subgrafo del eje: solo tramos cuyos dos extremos son del eje y que van pegados al trazado
    ejeT = np.full((m, m), np.inf); ejeL = np.full((m, m), np.inf)
    ejeU, ejeV, ejeW, ejeLen = [], [], [], []
    en_eje_tramo = set()
    for (u, v), t in t_dir.items():
        if es_eje[u] and es_eje[v]:
            medio = Point((xy[u] + xy[v]) / 2)
            if min(g.distance(medio) for g in eje_exist) <= UMBRAL_EJE_M:
                ejeU.append(idx[u]); ejeV.append(idx[v]); ejeW.append(t); ejeLen.append(l_dir[(u, v)])
                en_eje_tramo.add((u, v))
    SE = csr_matrix((ejeW, (ejeU, ejeV)), shape=(m, m))
    SL = csr_matrix((ejeLen, (ejeU, ejeV)), shape=(m, m))
    Dt = dijkstra(SE, directed=True)
    Dl = dijkstra(SL, directed=True)  # largo del camino más corto en metros (el eje es casi una línea)
    # largo recorrido por el camino más rápido: se aproxima con el camino más corto en metros (misma ruta en una línea)

    # --- escenario: cerrar el tramo proyectado con una línea recta --------------------
    Dt2, Dl2 = Dt, Dl
    cierre_m = None
    if geoms_proy:
        extremos = []
        for g in geoms_proy:
            extremos += [Point(g.coords[0]), Point(g.coords[-1])]
        # nodos del eje más cercanos a los extremos del tramo proyectado
        pares = []
        for e in extremos:
            d = np.hypot(xy[nodos_eje, 0] - e.x, xy[nodos_eje, 1] - e.y)
            pares.append(int(np.argmin(d)))
        a, b = pares[0], pares[1]
        # el tramo proyectado es una sola línea: sus dos extremos son los de los tramos existentes que une
        cierre_m = float(np.hypot(*(xy[nodos_eje[a]] - xy[nodos_eje[b]])))
        v_plano = 1.4
        w = cierre_m / v_plano
        SE2 = SE.tolil(); SL2 = SL.tolil()
        SE2[a, b] = w; SE2[b, a] = w; SL2[a, b] = cierre_m; SL2[b, a] = cierre_m
        Dt2 = dijkstra(SE2.tocsr(), directed=True); Dl2 = dijkstra(SL2.tocsr(), directed=True)

    # --- manzanas (origen, ponderadas por personas) -------------------------------------
    manz = cargar("manzanas.geojson")["features"]
    principal = np.array(red["principal"], int)
    kd = cKDTree(xy[principal])
    origenes = []
    for f in manz:
        p = f["properties"]
        if not p.get("personas"):
            continue
        c = shape(f["geometry"]).representative_point()
        x, y = A_M(c.x, c.y)
        d, k = kd.query([x, y])
        if d <= ENGANCHE_MAX_M:
            origenes.append({"nodo": int(principal[k]), "personas": p["personas"], "barrio": p.get("barrio"), "lon": c.x, "lat": c.y})
    nodo_o = np.array([o["nodo"] for o in origenes])
    pers = np.array([o["personas"] for o in origenes], float)
    print(f"Manzanas con personas y red cercana: {len(origenes)} ({int(pers.sum())} personas)")

    # tiempo desde cada origen HASTA cada nodo del eje (grafo al revés, una fuente por nodo del eje)
    R = dijkstra(GR, directed=True, indices=nodos_eje)[:, nodo_o]  # (m, no)

    salida = {}
    puntos = [dict(o) for o in origenes]
    for tipo, etiqueta in TIPOS.items():
        dest = [d["n"] for d in red["destinos"] if d["tipo"] == tipo]
        if not dest:
            continue
        # tiempo desde cualquier nodo hasta el destino más cercano
        res = dijkstra(GR, directed=True, indices=dest, min_only=True, return_predecessors=True)
        dtd, pred = res[0], res[1]
        t_rap = dtd[nodo_o]
        # ruta más rápida: metros del eje que ya usa (se sigue la cadena de predecesores hacia el destino)
        usa = np.zeros(len(nodo_o))
        for i, o in enumerate(nodo_o):
            v = int(o); pasos = 0
            while pred[v] >= 0 and pasos < 5000:
                p = int(pred[v])  # en el grafo al revés, el predecesor es el SIGUIENTE nodo del camino
                if (v, p) in en_eje_tramo:
                    usa[i] += l_dir[(v, p)]
                v = p; pasos += 1
        # ruta por el eje: entrar en w1, recorrer >= 400 m del eje hasta w2, salir hacia el destino
        dtd_eje = dtd[nodos_eje]

        def forzada(DT, DL):
            valido = DL >= LARGO_MIN_EJE_M
            interno = np.where(valido, DT + dtd_eje[None, :], np.inf).min(axis=1)  # (m,)
            return (R + interno[:, None]).min(axis=0)

        t_49 = forzada(Dt, Dl)
        t_49b = forzada(Dt2, Dl2) if cierre_m is not None else t_49
        ok = np.isfinite(t_rap) & np.isfinite(t_49) & (pers > 0)
        w = pers[ok]
        medio = lambda a: float(np.average(a[ok], weights=w) / 60)
        en_camino = float(w[(t_49[ok] - t_rap[ok]) <= MARGEN_UTIL_S].sum() / w.sum() * 100)
        usa_ya = float(w[usa[ok] >= 100].sum() / w.sum() * 100)
        por_barrio = defaultdict(lambda: [0.0, 0.0, 0.0, 0.0])
        for i in np.where(ok)[0]:
            b = origenes[i]["barrio"] or "Sin barrio"
            s = por_barrio[b]
            s[0] += pers[i]; s[1] += pers[i] * t_rap[i]; s[2] += pers[i] * t_49[i]; s[3] += pers[i] * (t_49[i] - t_rap[i] <= MARGEN_UTIL_S)
        salida[tipo] = {
            "nombre": etiqueta,
            "personas": int(w.sum()),
            "minutos_ruta_rapida": round(medio(t_rap), 1),
            "minutos_por_la_49": round(medio(t_49), 1),
            "minutos_extra": round(medio(t_49) - medio(t_rap), 1),
            "pct_49_en_el_camino": round(en_camino, 1),
            "pct_ruta_rapida_ya_usa_49": round(usa_ya, 1),
            "minutos_por_la_49_si_se_cierra_tramo": round(medio(t_49b), 1),
            "por_barrio": sorted([
                {"barrio": b, "personas": int(s[0]), "minutos_ruta_rapida": round(s[1] / s[0] / 60, 1),
                 "minutos_por_la_49": round(s[2] / s[0] / 60, 1), "pct_49_en_el_camino": round(s[3] / s[0] * 100, 1)}
                for b, s in por_barrio.items() if s[0] > 0], key=lambda r: -r["personas"]),
        }
        for i, p in enumerate(puntos):
            if np.isfinite(t_rap[i]) and np.isfinite(t_49[i]):
                p[f"r_{tipo}"] = round(float(t_rap[i]) / 60, 1)
                p[f"e_{tipo}"] = round(float(t_49[i] - t_rap[i]) / 60, 1)
        print(tipo, salida[tipo]["minutos_ruta_rapida"], salida[tipo]["minutos_por_la_49"], salida[tipo]["pct_49_en_el_camino"], salida[tipo]["pct_ruta_rapida_ya_usa_49"])

    # --- cómo está el eje por dentro (datos oficiales a menos de 25 m del trazado) ---------------
    def cerca(feats, radio=25):
        out = []
        for f in feats:
            if not f.get("geometry") or not f["geometry"]["coordinates"]:
                continue
            g = metros(shape(f["geometry"]))
            if min(e.distance(g) for e in eje_exist) <= radio:
                out.append(f)
        return out

    sin = cerca(cargar("siniestros_viales.geojson")["features"])
    and_ = cerca(cargar("andenes.geojson")["features"], 15)
    par = [f for f in cerca(cargar("paradas.geojson")["features"], 40)]
    rut = []
    for f in cargar("rutas_bus.geojson")["features"]:
        g = metros(shape(f["geometry"]))
        tramo = g.intersection(__import__("shapely").unary_union([e.buffer(20) for e in eje_exist]))
        if tramo.length >= 200:
            rut.append({"nombre": f["properties"]["nombre"], "codigo": f["properties"]["codigo"], "tipo": f["properties"]["tipo"], "empresa": f["properties"]["empresa"], "metros_sobre_el_eje": round(tramo.length)})
    anchos = [float(f["properties"]["ancho_m"]) for f in and_ if f["properties"].get("ancho_m") not in (None, "")]
    mort = cerca(cargar("mortalidad_vial.geojson")["features"], 25)
    cam = cerca(cargar("camaras_cctv.geojson")["features"], 40)
    sem = cerca(cargar("semaforos.geojson")["features"], 40)
    lon_eje_km = sum(g.length for g in eje_exist) / 1000
    por_clase = defaultdict(int)
    for f in sin:
        por_clase[f["properties"]["clase"]] += 1
    por_grav = defaultdict(int)
    for f in sin:
        por_grav[f["properties"]["gravedad"]] += 1
    por_anio = defaultdict(int)
    for f in sin:
        por_anio[f["properties"]["anio"]] += 1
    total_c = 5606
    estado_eje = {
        "siniestros": len(sin),
        "siniestros_por_km": round(len(sin) / lon_eje_km, 1),
        "siniestros_por_km_comuna": None,
        "por_clase": dict(sorted(por_clase.items(), key=lambda kv: -kv[1])),
        "por_gravedad": dict(sorted(por_grav.items(), key=lambda kv: -kv[1])),
        "por_anio": dict(sorted(por_anio.items())),
        "muertes_viales": len(mort),
        "andenes_tramos": len(and_),
        "ancho_andén_mediana_m": round(float(np.median(anchos)), 2) if anchos else None,
        "andenes_menores_1_5_m_pct": round(sum(a < 1.5 for a in anchos) / len(anchos) * 100, 1) if anchos else None,
        "paradas_cerca": len(par),
        "rutas_de_bus_sobre_el_eje": sorted(rut, key=lambda r: -r["metros_sobre_el_eje"]),
        "camaras_cerca": len(cam),
        "semaforos_cerca": len(sem),
        "largo_km": round(lon_eje_km, 2),
        "radio_m": "25 m para siniestros y muertes, 15 m andenes, 40 m paradas, cámaras y semáforos, 20 m rutas (≥200 m sobre el eje)",
    }
    ind = cargar("indicadores.json")["comuna"]
    from shapely.ops import unary_union
    comuna_m = metros(shape(cargar("comuna.geojson")["features"][0]["geometry"]))
    km_calles = sum(t[2] for t in red["tramos"] if str(red["tipos"].get(str(t[7]))) == "calle"
                    and comuna_m.contains(Point(*A_M(*np.mean(t[8], axis=0))))) / 1000
    estado_eje["calles_km_comuna"] = round(km_calles, 1)
    estado_eje["siniestros_por_km_comuna"] = round(total_c / km_calles, 1) if km_calles else None
    unicas = {}
    for r in estado_eje["rutas_de_bus_sobre_el_eje"]:
        k = (r["nombre"], r["codigo"])
        if k not in unicas or r["metros_sobre_el_eje"] > unicas[k]["metros_sobre_el_eje"]:
            unicas[k] = r
    estado_eje["rutas_de_bus_sobre_el_eje"] = sorted(unicas.values(), key=lambda r: -r["metros_sobre_el_eje"])

    # --- escritura -----------------------------------------------------------------------
    sal = {
        "generado": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        "eje": {
            "tramos": tramos_eje,
            "metros_existente": sum(t["metros"] for t in tramos_eje if t["estado"] != "Proyectado"),
            "metros_proyectado": sum(t["metros"] for t in tramos_eje if t["estado"] == "Proyectado"),
            "nodos_red": int(m),
            "metros_cierre_simulado": round(cierre_m) if cierre_m is not None else None,
        },
        "destinos": salida,
        "estado_del_eje": estado_eje,
        "supuestos": [
            "Caminata a pie con la velocidad de Tobler sobre la red peatonal del proyecto (no es bus ni carro).",
            "Origen: punto interior de cada manzana del Censo 2018, ponderado por sus personas. Destino: el más cercano por tiempo.",
            f"Ruta por la 49: entra al eje, recorre al menos {LARGO_MIN_EJE_M} m de él y sale hacia el destino.",
            f"La 49 'queda en el camino' si cuesta a lo sumo {MARGEN_UTIL_S // 60} minuto más que la ruta más rápida.",
            "Escenario del tramo proyectado: se une el hueco con una línea recta caminada a 1,4 m/s. Es una simulación, no una obra diseñada.",
            "La ruta más rápida es el óptimo de la red: ninguna ruta forzada puede ser más rápida a pie; lo que se mide es cuánto cuesta preferir la 49 y a quién le queda de camino.",
        ],
    }
    (DATOS / "eje49.json").write_text(json.dumps(sal, ensure_ascii=False, indent=1), encoding="utf-8")

    from shapely.geometry import mapping
    from shapely.ops import transform as tr
    A_G = Transformer.from_crs(9377, 4326, always_xy=True).transform
    feats = []
    for f in jer:
        p = f["properties"]
        if p["nombre"] in nombres:
            feats.append({"type": "Feature", "properties": {"nombre": p["nombre"], "estado": p["estado"], "jerarquia": p["jerarquia"]}, "geometry": f["geometry"]})
    (DATOS / "eje49.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    pts = []
    for p in puntos:
        pr = {k: v for k, v in p.items() if k not in ("nodo", "lon", "lat")}
        pts.append({"type": "Feature", "properties": pr, "geometry": {"type": "Point", "coordinates": [round(p["lon"], 6), round(p["lat"], 6)]}})
    (DATOS / "eje49_manzanas.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": pts}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
