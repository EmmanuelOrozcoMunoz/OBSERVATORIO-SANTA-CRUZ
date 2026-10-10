"""
Paso 3 del pipeline: red de caminata y análisis de accesibilidad basado en redes
(network-based accessibility analysis).

Qué hace:
  1. Une en una sola red la malla vial oficial, los caminos peatonales y escaleras de
     OpenStreetMap y los puentes peatonales oficiales. Corta las líneas donde se cruzan.
  2. Pone la altura del terreno a cada tramo (modelo de elevación Terrarium, cada 20 m)
     y calcula el tiempo de caminata en cada sentido con la función de Tobler.
  3. Calcula, para cada manzana, los minutos hasta el destino más cercano de cada tipo
     (estación de Metro o cable, parada de bus, colegio, salud, parque, biblioteca, cancha).
  4. Resume por barrio: población dentro de 5, 10 y 15 minutos, manzanas desconectadas
     y cuánto más larga es la ruta real frente a la línea recta.
  5. Escribe la red para el ruteo en el navegador (red.json).

Todos los tiempos son ESTIMACIONES con velocidades teóricas, no mediciones.

Uso (después de descargar.py y procesar.py):
    python red.py
"""
import io
import json
import math
import statistics
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

import networkx as nx
import shapely
from PIL import Image
from pyproj import Transformer
from shapely.geometry import LineString, MultiLineString, Point, shape
from shapely.strtree import STRtree

RAIZ = Path(__file__).resolve().parent.parent
RAW = RAIZ / "data" / "raw"
WEB = RAIZ / "frontend" / "public" / "data"

A_M = Transformer.from_crs(4326, 9377, always_xy=True).transform
A_G = Transformer.from_crs(9377, 4326, always_xy=True).transform
proy = lambda g, f: shapely.transform(g, lambda x, y: f(x, y), interleaved=False)

DEM = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
Z_DEM = 14
PASO_M = 20            # cada cuánto se muestrea la altura a lo largo de un tramo
SNAP_MAX_M = 60        # más lejos que esto, la manzana se marca como mal conectada
UMBRALES = (5, 10, 15)  # minutos

TIPOS_TRAMO = {"calle": 0, "sendero": 1, "escalera": 2, "peatonal": 3, "puente": 4, "ciclovia": 5, "conector": 6}
CONECTOR_MAX_M = 15  # une puntas sueltas de caminos que quedaron a pocos metros de la red


def leer(n):
    p = RAW / f"{n}.geojson"
    return json.loads(p.read_text(encoding="utf-8"))["features"] if p.exists() else []


def tobler_kmh(pendiente):
    """Velocidad de caminata (km/h) según la pendiente (fracción; positiva = subida)."""
    return 6 * math.exp(-3.5 * abs(pendiente + 0.05))


# ------------------------------------------------------------------ elevación
class Elevacion:
    """Lee teselas Terrarium (altura = R*256 + G + B/256 - 32768) y entrega la altura con interpolación bilineal."""

    def __init__(self):
        self.teselas = {}

    def _tesela(self, x, y):
        if (x, y) not in self.teselas:
            req = urllib.request.Request(DEM.format(z=Z_DEM, x=x, y=y), headers={"User-Agent": "ObservatorioSantaCruz"})
            with urllib.request.urlopen(req, timeout=60) as r:
                img = Image.open(io.BytesIO(r.read())).convert("RGB")
            self.teselas[(x, y)] = img.load()
        return self.teselas[(x, y)]

    def altura(self, lon, lat):
        n = 2 ** Z_DEM
        fx = (lon + 180) / 360 * n * 256
        fy = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n * 256
        def h(px, py):
            t = self._tesela(int(px // 256), int(py // 256))
            r, g, b = t[int(px % 256), int(py % 256)]
            return r * 256 + g + b / 256 - 32768
        x0, y0 = math.floor(fx - 0.5), math.floor(fy - 0.5)
        dx, dy = fx - 0.5 - x0, fy - 0.5 - y0
        return (h(x0, y0) * (1 - dx) * (1 - dy) + h(x0 + 1, y0) * dx * (1 - dy)
                + h(x0, y0 + 1) * (1 - dx) * dy + h(x0 + 1, y0 + 1) * dx * dy)


def main():
    comuna_g = shape(leer("comuna")[0]["geometry"])
    comuna_m = proy(comuna_g, A_M)
    entorno_m = comuna_m.buffer(1300)

    # 1. Tramos de la red ----------------------------------------------------
    piezas = []  # (geom en metros, tipo)
    for f in leer("vias"):
        g = proy(shape(f["geometry"]), A_M)
        if g.intersects(entorno_m):
            piezas.append((g, "calle"))
    for f in leer("osm_caminos"):
        sub = f["properties"].get("subclase")
        if sub in ("platform", "corridor", "bridleway"):
            continue
        tipo = {"steps": "escalera", "pedestrian": "peatonal", "cycleway": "ciclovia"}.get(sub, "sendero")
        if f["properties"].get("puente"):
            tipo = "puente"
        g = proy(shape(f["geometry"]), A_M)
        if g.intersects(entorno_m):
            piezas.append((g, tipo))
    for f in leer("puentes"):
        if f["properties"].get("tipo_puente") != "Peatonal" or not f.get("geometry"):
            continue
        g = proy(shape(f["geometry"]), A_M)
        if g.intersects(entorno_m):
            piezas.append((g, "puente"))
    print(f"Tramos de entrada: {Counter(t for _, t in piezas)}")

    # Cortar todo donde se cruza (noding). Luego se recupera el tipo de cada pedazo.
    union = shapely.unary_union([g for g, _ in piezas])
    lineas = list(union.geoms) if isinstance(union, MultiLineString) else [union]
    lineas = [l for l in lineas if l.length >= 1]
    arbol = STRtree([g for g, _ in piezas])
    tipos_pieza = [t for _, t in piezas]

    def tipo_de(l):
        mid = l.interpolate(0.5, normalized=True)
        cands = arbol.query(mid.buffer(0.5))
        mejores = sorted(cands, key=lambda i: piezas[i][0].distance(mid))
        # si un sendero/escalera coincide con una calle, gana el tipo peatonal (es más informativo)
        cerca = [i for i in mejores if piezas[i][0].distance(mid) < 0.5]
        for pref in ("escalera", "puente", "peatonal", "sendero", "ciclovia", "calle"):
            if any(tipos_pieza[i] == pref for i in cerca):
                return pref
        return tipos_pieza[mejores[0]] if mejores else "calle"

    # 2. Nodos, alturas y tiempos ------------------------------------------------
    elev = Elevacion()
    clave = lambda x, y: (round(x * 2), round(y * 2))  # rejilla de 0,5 m
    nodos, idx = [], {}

    def nodo(x, y):
        k = clave(x, y)
        if k not in idx:
            lon, lat = A_G(x, y)
            idx[k] = len(nodos)
            nodos.append([lon, lat, elev.altura(lon, lat)])
        return idx[k]

    # Pendiente oficial de calzadas (inventario de la Alcaldía): cuando un tramo de calle coincide
    # con una calzada inventariada se usa su pendiente oficial; el sentido (sube o baja) sale del
    # modelo de elevación, porque el inventario no lo indica.
    calz = [(proy(shape(f["geometry"]), A_M), abs(f["properties"]["pendiente"]) / 100)
            for f in leer("calzadas") if f["properties"].get("pendiente") is not None and f.get("geometry")]
    arbol_c = STRtree([g for g, _ in calz]) if calz else None
    con_oficial = 0

    G = nx.DiGraph()
    aristas = []
    for l in lineas:
        tipo = tipo_de(l)
        largo = l.length
        n_pasos = max(1, math.ceil(largo / PASO_M))
        puntos = [l.interpolate(i / n_pasos, normalized=True) for i in range(n_pasos + 1)]
        alturas = [elev.altura(*A_G(p.x, p.y)) for p in puntos]
        oficial = None
        if tipo == "calle" and arbol_c is not None and largo >= 15:
            mid = l.interpolate(0.5, normalized=True)
            cands = [i for i in arbol_c.query(mid.buffer(8)) if calz[i][0].distance(mid) < 8]
            if cands:
                oficial = calz[min(cands, key=lambda i: calz[i][0].distance(mid))][1]
                con_oficial += 1
        signo = 1 if alturas[-1] >= alturas[0] else -1
        t_ida = t_vuelta = 0.0
        subida_ida = subida_vuelta = 0.0
        tramo = largo / n_pasos
        for i in range(n_pasos):
            dh = alturas[i + 1] - alturas[i]
            if oficial is not None:
                dh = signo * oficial * tramo
            s = max(-0.6, min(0.6, dh / tramo))
            t_ida += tramo / (tobler_kmh(s) / 3.6)
            t_vuelta += tramo / (tobler_kmh(-s) / 3.6)
            subida_ida += max(0, dh)
            subida_vuelta += max(0, -dh)
        a = nodo(*l.coords[0])
        b = nodo(*l.coords[-1])
        if a == b:
            continue
        geom_g = proy(l.simplify(1.0), A_G)
        coords = [[round(x, 6), round(y, 6)] for x, y in geom_g.coords]
        e = len(aristas)
        aristas.append({"a": a, "b": b, "m": round(largo, 1), "ti": round(t_ida, 1), "tv": round(t_vuelta, 1),
                        "si": round(subida_ida, 1), "sv": round(subida_vuelta, 1), "tipo": TIPOS_TRAMO[tipo], "c": coords})
        for u, v, t in ((a, b, t_ida), (b, a, t_vuelta)):
            if not G.has_edge(u, v) or G[u][v]["w"] > t:
                G.add_edge(u, v, w=t, m=largo, e=e)
    print(f"Tramos de calle con pendiente oficial: {con_oficial:,}")
    print(f"Red: {len(nodos):,} nodos, {len(aristas):,} tramos, {sum(a['m'] for a in aristas)/1000:,.1f} km")

    # Conectores: las puntas de senderos que quedaron a menos de 15 m de la red principal
    # se unen con un tramo recto (diferencias de dibujo entre fuentes, cortes de teselas).
    comps = sorted(nx.weakly_connected_components(G), key=len, reverse=True)
    principal = set(comps[0])
    pts_m = [Point(*A_M(lon, lat)) for lon, lat, _ in nodos]
    lista_p = sorted(principal)
    arbol_p = STRtree([pts_m[i] for i in lista_p])
    conectores = 0
    for comp in comps[1:]:
        mejor = None
        for i in comp:
            j = arbol_p.nearest(pts_m[i])
            d = pts_m[i].distance(pts_m[lista_p[j]])
            if mejor is None or d < mejor[0]:
                mejor = (d, i, lista_p[j])
        if mejor and mejor[0] <= CONECTOR_MAX_M:
            d, i, k = mejor
            t = d / (tobler_kmh(0) / 3.6)
            e = len(aristas)
            aristas.append({"a": i, "b": k, "m": round(d, 1), "ti": round(t, 1), "tv": round(t, 1), "si": 0, "sv": 0,
                            "tipo": TIPOS_TRAMO["conector"], "c": [[round(nodos[i][0], 6), round(nodos[i][1], 6)], [round(nodos[k][0], 6), round(nodos[k][1], 6)]]})
            G.add_edge(i, k, w=t, m=d, e=e)
            G.add_edge(k, i, w=t, m=d, e=e)
            conectores += 1
    print(f"Conectores agregados: {conectores}")

    # Componente principal: lo que no conecta con él se reporta
    comps = sorted(nx.weakly_connected_components(G), key=len, reverse=True)
    principal = comps[0]
    print(f"Componentes: {len(comps)}; principal con {len(principal):,} nodos")

    # Índice de nodos para enganchar puntos a la red
    nodos_m = [Point(*A_M(lon, lat)) for lon, lat, _ in nodos]
    validos = [i for i in range(len(nodos)) if i in principal]
    arbol_n = STRtree([nodos_m[i] for i in validos])

    def enganchar(pm):
        j = arbol_n.nearest(pm)
        i = validos[j]
        return i, nodos_m[i].distance(pm)

    # 3. Destinos -------------------------------------------------------------
    def puntos_de(col, filtro=lambda p: True, nombre=lambda p: p.get("nombre")):
        out = []
        for f in json.loads((WEB / f"{col}.geojson").read_text(encoding="utf-8"))["features"]:
            p = f["properties"]
            if not filtro(p):
                continue
            g = shape(f["geometry"])
            if g.geom_type in ("Polygon", "MultiPolygon"):
                gm = proy(g, A_M)
                borde = gm.boundary
                pts = [borde.interpolate(d) for d in range(0, int(borde.length) + 1, 50)] or [gm.representative_point()]
            else:
                pts = [proy(g.representative_point(), A_M)]
            for pm in pts:
                if entorno_m.contains(pm):
                    out.append((pm, str(nombre(p) or "Sin nombre")))
        return out

    paradas_unicas = {}
    for f in leer("paradas"):
        p = f["properties"]
        k = p.get("id_paradero")
        if k not in paradas_unicas:
            paradas_unicas[k] = (proy(shape(f["geometry"]), A_M), f"Parada {p.get('direccion') or k}")
    DESTINOS = {
        "transporte_masivo": ("Estación de Metro, Metrocable o Metroplús",
                              puntos_de("estaciones", lambda p: p.get("modo") in ("Metro", "Metrocable", "Metroplús / bus"),
                                        lambda p: f"Estación {p.get('nombre')} ({p.get('linea')})")),
        "parada_bus": ("Parada de bus", [v for v in paradas_unicas.values() if entorno_m.contains(v[0])]),
        "colegio": ("Colegio o sede educativa", puntos_de("sedes_educativas")),
        "salud": ("Centro de salud", puntos_de("equipamientos", lambda p: p.get("grupo") == "Salud")),
        "parque": ("Parque o espacio público", puntos_de("espacio_publico", nombre=lambda p: p.get("nombre") or p.get("categoria"))),
        "biblioteca": ("Biblioteca", puntos_de("bibliotecas")),
        "deporte": ("Cancha o escenario deportivo", puntos_de("escenarios_deportivos")),
    }

    # Grafo inverso: el tiempo "de la manzana al destino" es el camino más corto en el grafo
    # al revés, saliendo desde todos los destinos a la vez (multi-source Dijkstra).
    R = G.reverse(copy=False)
    resultados = {}
    destinos_web = []
    for clave_d, (nombre_d, pts) in DESTINOS.items():
        fuentes, nombres = {}, {}
        for pm, nom in pts:
            i, d = enganchar(pm)
            extra = d / (tobler_kmh(0) / 3.6)
            if i not in fuentes or fuentes[i] > extra:
                fuentes[i], nombres[i] = extra, nom
            lon, lat = A_G(pm.x, pm.y)
            destinos_web.append({"tipo": clave_d, "nombre": nom, "n": i, "lon": round(lon, 6), "lat": round(lat, 6)})
        # costo inicial = caminar del nodo al destino real
        H = R.copy()
        H.add_node("_origen")
        for i, extra in fuentes.items():
            H.add_edge("_origen", i, w=extra, m=0)
        dist, caminos = nx.single_source_dijkstra(H, "_origen", weight="w")
        largos = nx.single_source_dijkstra_path_length(H, "_origen", weight="m")
        destino_de = {n: nombres[c[1]] for n, c in caminos.items() if len(c) > 1}
        resultados[clave_d] = (dist, largos, destino_de)
        print(f"  {nombre_d}: {len(pts)} puntos de acceso")

    # 4. Manzanas -------------------------------------------------------------
    manzanas = json.loads((WEB / "manzanas.geojson").read_text(encoding="utf-8"))
    barrios = json.loads((WEB / "barrios.geojson").read_text(encoding="utf-8"))["features"]
    nombres_b = [b["properties"]["nombre"] for b in barrios]
    por_barrio = {n: defaultdict(float) for n in nombres_b}
    rodeo = defaultdict(list)
    est_m = [pm for pm, _ in DESTINOS["transporte_masivo"][1]]

    for f in manzanas["features"]:
        p = f["properties"]
        pm = proy(shape(f["geometry"]).representative_point(), A_M)
        i, d = enganchar(pm)
        acceso = d / (tobler_kmh(0) / 3.6)
        p["enganche_m"] = round(d)
        p["mal_conectada"] = d > SNAP_MAX_M
        pers = p.get("personas") or 0
        b = por_barrio.get(p.get("barrio"))
        for clave_d, (dist, largos, destino_de) in resultados.items():
            if i in dist:
                minutos = (dist[i] + acceso) / 60
                p[f"t_{clave_d}"] = round(minutos, 1)
                p[f"m_{clave_d}"] = round(largos.get(i, 0) + d)
                p[f"d_{clave_d}"] = destino_de.get(i)
            else:
                p[f"t_{clave_d}"] = None
                minutos = None
            if b is not None:
                b["personas"] += pers if clave_d == "transporte_masivo" else 0
                if minutos is not None:
                    for u in UMBRALES:
                        if minutos <= u:
                            b[f"{clave_d}_{u}"] += pers
                    b[f"{clave_d}_suma_t"] += minutos * pers
                    b[f"{clave_d}_pers_t"] += pers
        if b is not None and p["mal_conectada"]:
            b["mal_conectadas"] += 1
            b["pers_mal_conectadas"] += pers
        # Rodeo: ruta real a la estación más cercana frente a la línea recta
        if p.get("m_transporte_masivo"):
            recta = min(pm.distance(e) for e in est_m)
            if recta > 50:
                rodeo[p.get("barrio")].append(p["m_transporte_masivo"] / recta)
                p["rodeo_transporte"] = round(p["m_transporte_masivo"] / recta, 2)

    (WEB / "manzanas.geojson").write_text(json.dumps(manzanas, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    # 4b. Escenarios de intervención (candidatos) ---------------------------------
    # No son obras aprobadas: son candidatos que el modelo evalúa con datos verificables.
    ind_base = json.loads((WEB / "indicadores.json").read_text(encoding="utf-8"))
    ficha_b = {b["nombre"]: b for b in ind_base["barrios"]}
    manz = manzanas["features"]
    manz_pm = [proy(shape(f["geometry"]).representative_point(), A_M) for f in manz]
    manz_nodo = [enganchar(pm) for pm in manz_pm]

    def tiempos_desde(puntos_m):
        H = R.copy()
        H.add_node("_o")
        for pm in puntos_m:
            i, d = enganchar(pm)
            t = d / (tobler_kmh(0) / 3.6)
            if not H.has_edge("_o", i) or H["_o"][i]["w"] > t:
                H.add_edge("_o", i, w=t, m=d)
        dist = nx.single_source_dijkstra_path_length(H, "_o", weight="w")
        return [((dist[i] + d / (tobler_kmh(0) / 3.6)) / 60) if i in dist else None for i, d in manz_nodo]

    escenarios = []
    for f in json.loads((WEB / "espacio_publico_proyectado.geojson").read_text(encoding="utf-8"))["features"]:
        p = f["properties"]
        gm = proy(shape(f["geometry"]), A_M)
        borde = gm.boundary
        pts = [borde.interpolate(d) for d in range(0, int(borde.length) + 1, 40)] or [gm.representative_point()]
        t = tiempos_desde(pts)
        benef = sum((m["properties"].get("personas") or 0) for m, x in zip(manz, t) if x is not None and x <= 10)
        ganan = sum((m["properties"].get("personas") or 0) for m, x in zip(manz, t)
                    if x is not None and x <= 5 and (m["properties"].get("t_parque") or 99) > 5)
        fb = ficha_b.get(p.get("barrio") or "", {})
        escenarios.append({
            "id": f"pot-ep-{len(escenarios) + 1}", "tipo": "espacio_publico", "tipo_nombre": "Creación o recuperación de espacio público",
            "nombre": p.get("nombre") or "Espacio público proyectado", "barrio": p.get("barrio"),
            "origen": "Espacio público proyectado en el POT (Acuerdo 48 de 2014)",
            "problema": f"Déficit de espacio público en {p.get('barrio')}: {fb.get('espacio_publico_m2_hab')} m²/habitante",
            "cantidad": round(gm.area), "unidad_cantidad": "m²", "area_m2": round(gm.area),
            "beneficiarios": round(benef),
            "metodo_beneficiarios": "Personas (Censo 2018) de las manzanas a 10 minutos o menos caminando por la red hasta el borde del espacio",
            "mejora": round(ganan), "metodo_mejora": "Personas que hoy no tienen un parque a 5 minutos y lo tendrían con esta intervención",
            "ep_barrio_m2_hab": fb.get("espacio_publico_m2_hab"),
            "atropellos_por_mil": round(1000 * fb["atropellos"] / fb["poblacion_2018"], 1) if fb.get("poblacion_2018") else None,
            "confianza": "Media: el área sale del POT; beneficiarios y mejora son estimaciones con la red de caminos",
            "lon": round(A_G(gm.representative_point().x, gm.representative_point().y)[0], 6),
            "lat": round(A_G(gm.representative_point().x, gm.representative_point().y)[1], 6),
        })

    # Andenes angostos por barrio: reconstruir a 1,2 m los tramos más angostos
    andenes_b = defaultdict(list)
    for f in leer("andenes"):
        a = f["properties"].get("ancho")
        if a is None or a <= 0 or a >= 1.2:
            continue
        gm = proy(shape(f["geometry"]), A_M)
        if not comuna_m.intersects(gm):
            continue
        andenes_b[next((b["properties"]["nombre"] for b in barrios if proy(shape(b["geometry"]), A_M).contains(gm.representative_point())), None)].append(gm)
    for nombre_b, tramos in andenes_b.items():
        if not nombre_b:
            continue
        largo = sum(g.length for g in tramos)
        zona = shapely.unary_union(tramos).buffer(100)
        benef = sum((m["properties"].get("personas") or 0) for m, pm in zip(manz, manz_pm) if zona.contains(pm))
        fb = ficha_b.get(nombre_b, {})
        escenarios.append({
            "id": f"anden-{fb.get('codigo', nombre_b)}", "tipo": "andenes", "tipo_nombre": "Construcción o mejoramiento de andenes",
            "nombre": f"Ampliar a 1,2 m los andenes angostos de {nombre_b}", "barrio": nombre_b,
            "origen": "Propuesta del modelo a partir del inventario oficial de andenes",
            "problema": f"{round(largo):,} m de andén con menos de 1,2 m de ancho".replace(",", "."),
            "cantidad": round(largo * 1.2), "unidad_cantidad": "m² de andén (largo × 1,2 m)", "area_m2": round(largo * 1.2),
            "beneficiarios": round(benef),
            "metodo_beneficiarios": "Personas (Censo 2018) de las manzanas a 100 m o menos (línea recta) de los tramos angostos",
            "mejora": round(largo), "metodo_mejora": "Metros de andén que pasarían a tener al menos 1,2 m de ancho",
            "ep_barrio_m2_hab": fb.get("espacio_publico_m2_hab"),
            "atropellos_por_mil": round(1000 * fb["atropellos"] / fb["poblacion_2018"], 1) if fb.get("poblacion_2018") else None,
            "confianza": "Media-baja: el ancho viene del inventario oficial; no se conoce el espacio disponible para ampliar",
            "lon": None, "lat": None,
        })
    (WEB / "escenarios.json").write_text(json.dumps(escenarios, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Escenarios evaluados: {len(escenarios)}")

    # 5. Resumen ---------------------------------------------------------------
    def resumen(s, nombre):
        fila = {"barrio": nombre, "personas": round(s["personas"])}
        for clave_d in DESTINOS:
            for u in UMBRALES:
                fila[f"{clave_d}_{u}min_pct"] = round(100 * s[f"{clave_d}_{u}"] / s["personas"], 1) if s["personas"] else None
            fila[f"{clave_d}_promedio_min"] = round(s[f"{clave_d}_suma_t"] / s[f"{clave_d}_pers_t"], 1) if s[f"{clave_d}_pers_t"] else None
        fila["manzanas_mal_conectadas"] = int(s["mal_conectadas"])
        fila["personas_mal_conectadas"] = round(s["pers_mal_conectadas"])
        return fila

    total = defaultdict(float)
    filas = []
    for n in nombres_b:
        for k, v in por_barrio[n].items():
            total[k] += v
        fila = resumen(por_barrio[n], n)
        r = rodeo.get(n, [])
        fila["rodeo_mediano_transporte"] = round(statistics.median(r), 2) if r else None
        filas.append(fila)
    comuna_res = resumen(total, "Comuna 2")
    todos = [x for v in rodeo.values() for x in v]
    comuna_res["rodeo_mediano_transporte"] = round(statistics.median(todos), 2) if todos else None

    km_tipo = Counter()
    for a in aristas:
        km_tipo[a["tipo"]] += a["m"] / 1000
    nombres_tipo = {v: k for k, v in TIPOS_TRAMO.items()}
    accesibilidad = {
        "destinos": {k: {"nombre": v[0], "puntos": len(v[1])} for k, v in DESTINOS.items()},
        "umbrales_min": list(UMBRALES),
        "comuna": comuna_res,
        "barrios": filas,
        "red": {
            "nodos": len(nodos), "tramos": len(aristas), "componentes": len(comps),
            "nodos_fuera_componente_principal": len(nodos) - len(principal),
            "km_por_tipo": {nombres_tipo[k]: round(v, 1) for k, v in km_tipo.items()},
            "tramos_con_pendiente_oficial": con_oficial,
        },
        "supuestos": {
            "velocidad": "Función de Tobler: 6·e^(−3,5·|pendiente+0,05|) km/h (≈5 km/h en plano)",
            "pendiente": f"En calles con calzada inventariada se usa la pendiente oficial ({con_oficial} tramos); en el resto, modelo de elevación Terrarium z{Z_DEM} (≈9,5 m por píxel) muestreado cada {PASO_M} m. Pendiente limitada a ±60 %",
            "enganche": f"Cada manzana sale desde su punto interior y camina en línea recta hasta el nodo más cercano de la red; si está a más de {SNAP_MAX_M} m se marca como mal conectada",
            "cruces": "Las líneas se cortan donde se cruzan; se asume que se puede pasar en esos cruces. No se modelan semáforos, rejas ni barreras.",
            "conectores": f"Las puntas de caminos a menos de {CONECTOR_MAX_M} m de la red principal se unen con un tramo recto",
            "escaleras": "Las escaleras salen de OpenStreetMap y se recorren con la misma fórmula (la pendiente del terreno ya las vuelve lentas)",
        },
    }
    ind_path = WEB / "indicadores.json"
    ind = json.loads(ind_path.read_text(encoding="utf-8"))
    ind["accesibilidad"] = accesibilidad
    ind_path.write_text(json.dumps(ind, ensure_ascii=False, indent=1), encoding="utf-8")

    # 6. Red para el navegador -------------------------------------------------
    web = {
        "nodos": [[round(lon, 6), round(lat, 6), round(h, 1)] for lon, lat, h in nodos],
        "tramos": [[a["a"], a["b"], a["m"], a["ti"], a["tv"], a["si"], a["sv"], a["tipo"], a["c"]] for a in aristas],
        "tipos": nombres_tipo,
        "destinos": destinos_web,
        "principal": sorted(principal),
    }
    (WEB / "red.json").write_text(json.dumps(web, separators=(",", ":")), encoding="utf-8")
    print(f"Comuna: {comuna_res['transporte_masivo_10min_pct']} % de la población a 10 min o menos de una estación")
    print(f"red.json: {(WEB / 'red.json').stat().st_size / 1e6:.1f} MB")


def infraestructura():
    """Capas e indicadores de andenes, paradas, ciclorrutas y red peatonal para el mapa,
    y una validación de la pendiente del modelo de elevación contra la pendiente oficial de las calzadas."""
    comuna_g = shape(leer("comuna")[0]["geometry"])
    comuna_m = proy(comuna_g, A_M)
    barrios = json.loads((WEB / "barrios.geojson").read_text(encoding="utf-8"))["features"]
    b_geo = [(b["properties"]["nombre"], proy(shape(b["geometry"]), A_M)) for b in barrios]

    def barrio_de(gm):
        p = gm.representative_point()
        return next((n for n, g in b_geo if g.contains(p)), None)

    def guardar(nombre, feats):
        (WEB / f"{nombre}.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats},
                                                           ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    def feat(g, props, tol=0.000003):
        m = shapely.geometry.mapping(g.simplify(tol))
        r = lambda c: round(c, 6) if isinstance(c, float) else [r(x) for x in c]
        return {"type": "Feature", "geometry": {"type": m["type"], "coordinates": r(m["coordinates"])}, "properties": props}

    # Andenes
    andenes, por_b = [], defaultdict(lambda: {"m": 0.0, "angosto": 0.0, "anchos": [], "obst": 0, "tramos": 0})
    for f in leer("andenes"):
        g = shape(f["geometry"]); gm = proy(g, A_M)
        if not comuna_m.intersects(gm):
            continue
        p = f["properties"]
        ancho = p.get("ancho")
        b = barrio_de(gm)
        andenes.append(feat(g, {"ancho_m": ancho, "estado_cod": p.get("estado"), "material_cod": p.get("material"),
                                "obstaculo": p.get("obstaculo"), "largo_m": round(gm.length, 1), "barrio": b}))
        if b:
            s_ = por_b[b]
            s_["m"] += gm.length; s_["tramos"] += 1
            if ancho is not None and ancho > 0:
                s_["anchos"].append(ancho)
                if ancho < 1.2:
                    s_["angosto"] += gm.length
            s_["obst"] += 1 if (p.get("obstaculo") or 0) > 0 else 0
    guardar("andenes", andenes)

    # Paradas (una por paradero, con sus rutas)
    paradas = {}
    for f in leer("paradas"):
        p = f["properties"]; k = p.get("id_paradero")
        if k not in paradas:
            paradas[k] = {"g": shape(f["geometry"]), "direccion": p.get("direccion"), "rutas": set()}
        if p.get("nombre_ruta"):
            paradas[k]["rutas"].add(str(p.get("nombre_ruta")))
    guardar("paradas", [feat(v["g"], {"direccion": v["direccion"], "rutas": ", ".join(sorted(v["rutas"])), "n_rutas": len(v["rutas"]),
                                      "en_comuna": comuna_g.contains(v["g"])}) for v in paradas.values()])

    guardar("red_ciclista", [feat(shape(f["geometry"]), {k: f["properties"].get(k) for k in ("nombre_ciclorruta", "tipologia_redciclista", "estado", "anio_construido")})
                             for f in leer("red_ciclista")])
    guardar("red_peatonal_pot", [feat(shape(f["geometry"]), {"tipo": f["properties"].get("tipo_redpeatonal"), "estado": f["properties"].get("estado"),
                                                               "jerarquia": f["properties"].get("jerarquia_via")})
                                 for f in leer("red_peatonal_pot") if proy(shape(f["geometry"]), A_M).distance(comuna_m) < 400])
    guardar("escaleras_osm", [feat(shape(f["geometry"]), {"tipo": f["properties"].get("subclase")})
                              for f in leer("osm_caminos") if f["properties"].get("subclase") in ("steps", "footway", "path", "pedestrian")
                              and proy(shape(f["geometry"]), A_M).distance(comuna_m) < 300])

    # Validación de pendiente: modelo de elevación frente a la pendiente oficial de calzadas
    elev = Elevacion(); difs = []
    for f in leer("calzadas"):
        of = f["properties"].get("pendiente")
        if of is None:
            continue
        gm = proy(shape(f["geometry"]), A_M)
        if gm.length < 30 or not comuna_m.intersects(gm):
            continue
        a = elev.altura(*A_G(*gm.coords[0])); b = elev.altura(*A_G(*gm.coords[-1]))
        difs.append(abs(abs(b - a) / gm.length * 100 - abs(of)))

    # Resumen
    ciclo_km = sum(proy(shape(f["geometry"]), A_M).intersection(comuna_m.buffer(50)).length for f in leer("red_ciclista")) / 1000
    filas = []
    for n, _ in b_geo:
        s_ = por_b[n]
        filas.append({"barrio": n, "andenes_km": round(s_["m"] / 1000, 2), "andenes_tramos": s_["tramos"],
                      "ancho_mediano_m": round(statistics.median(s_["anchos"]), 2) if s_["anchos"] else None,
                      "andenes_angostos_pct": round(100 * s_["angosto"] / s_["m"], 1) if s_["m"] else None,
                      "tramos_con_obstaculo": s_["obst"]})
    tot_m = sum(s_["m"] for s_ in por_b.values()); tot_ang = sum(s_["angosto"] for s_ in por_b.values())
    anchos = [a for s_ in por_b.values() for a in s_["anchos"]]
    infra = {
        "andenes": {"km": round(tot_m / 1000, 1), "tramos": len(andenes), "ancho_mediano_m": round(statistics.median(anchos), 2) if anchos else None,
                    "angostos_pct": round(100 * tot_ang / tot_m, 1) if tot_m else None, "umbral_angosto_m": 1.2, "barrios": filas},
        "paradas_en_comuna": sum(1 for v in paradas.values() if comuna_g.contains(v["g"])),
        "ciclorrutas_km_en_comuna": round(ciclo_km, 2),
        "puentes_peatonales_entorno": sum(1 for f in leer("puentes") if f["properties"].get("tipo_puente") == "Peatonal"),
        "validacion_pendiente": {"tramos_comparados": len(difs),
                                 "diferencia_mediana_puntos_pct": round(statistics.median(difs), 1) if difs else None,
                                 "explicacion": "Diferencia absoluta entre la pendiente calculada con el modelo de elevación y la pendiente registrada en el inventario oficial de calzadas, en puntos porcentuales"},
    }
    ind_path = WEB / "indicadores.json"
    ind = json.loads(ind_path.read_text(encoding="utf-8"))
    ind["infraestructura"] = infra
    ind_path.write_text(json.dumps(ind, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Andenes: {infra['andenes']['km']} km, ancho mediano {infra['andenes']['ancho_mediano_m']} m, "
          f"{infra['andenes']['angostos_pct']} % más angostos que 1,2 m. Pendiente: diferencia mediana "
          f"{infra['validacion_pendiente']['diferencia_mediana_puntos_pct']} puntos en {len(difs)} calzadas")


if __name__ == "__main__":
    main()
    infraestructura()
