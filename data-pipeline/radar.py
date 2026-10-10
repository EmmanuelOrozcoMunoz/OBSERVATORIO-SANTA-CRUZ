"""
Radar de la comuna: titulares de noticias sobre Santa Cruz (Comuna 2) y sus barrios.

Fuente: Google News (RSS público). Solo se guarda titular, medio, fecha y enlace;
no se copia el contenido de los artículos. La clasificación por tema y la detección
del barrio son por palabras clave sobre el titular, así que puede equivocarse:
la página lo dice. No se recolecta nada de redes sociales (ver docs y /propuesta).

Correr:  python radar.py        (escribe frontend/public/data/radar.json)
"""
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

SALIDA = Path(__file__).resolve().parents[1] / "frontend" / "public" / "data" / "radar.json"

BARRIOS = {
    "La Isla": ["la isla"],
    "Playón de Los Comuneros": ["playon de los comuneros", "el playon", "los comuneros"],
    "Pablo VI": ["pablo vi"],
    "La Frontera": ["la frontera"],
    "La Francia": ["la francia"],
    "Andalucía": ["andalucia"],
    "Villa del Socorro": ["villa del socorro"],
    "Villa Niza": ["villa niza"],
    "Moscú No.1": ["moscu"],
    "Santa Cruz": ["barrio santa cruz", "santa cruz"],
    "La Rosa": ["la rosa"],
}

CONSULTAS = [
    '"comuna 2" Santa Cruz Medellín',
    'barrio "Santa Cruz" Medellín',
    '"Santa Cruz" Medellín Metrocable Línea K',
    '"Santa Cruz" Medellín cierre vial',
    '"Santa Cruz" Medellín seguridad',
    '"Santa Cruz" Medellín obras andenes',
    '"Santa Cruz" Medellín basuras',
    '"Santa Cruz" Medellín deslizamiento riesgo',
    '"La Rosa" Medellín comuna 2',
    '"Moscú" Medellín comuna 2',
    '"Villa del Socorro" Medellín',
    '"La Francia" Medellín comuna 2',
    '"Andalucía" Medellín comuna 2',
    '"Pablo VI" Medellín comuna 2',
    '"Playón de los Comuneros" Medellín',
    '"La Isla" Medellín comuna 2',
    '"Villa Niza" Medellín',
]

TEMAS = {
    "Basuras y aseo": ["basura", "residuos", "escombro", "aseo", "emvarias", "reciclaje", "relleno"],
    "Vías y huecos": ["hueco", "bache", "pavimento", "cierre vial", "vía ", "via ", "calle", "carrera", "obra vial", "desvío", "desvio", "tapar"],
    "Andenes y escaleras": ["andén", "anden", "escalera", "peatonal", "acera", "puente peatonal", "caminar"],
    "Movilidad y transporte": ["metro", "metrocable", "cable", "bus", "ruta", "movilidad", "tránsito", "transito", "tráfico", "trafico", "moto", "accidente", "siniestro", "atropell", "peatón", "peatones", "embisti"],
    "Seguridad": ["hurto", "robo", "extorsi", "banda", "disparo", "policía", "policia", "cámaras", "camaras", "riña", "rina", "seguridad", "convivencia"],
    "Riesgo y clima": ["deslizamiento", "derrumbe", "lluvia", "inundaci", "creciente", "riesgo", "emergencia", "damnificad", "temblor", "sismo"],
    "Servicios públicos": ["agua", "acueducto", "epm", "energía", "energia", "apagón", "apagon", "tubo", "alcantarillado", "gas"],
    "Espacio público y comunidad": ["parque", "cancha", "biblioteca", "colegio", "jardín", "jardin", "cultura", "festival", "comunidad", "presupuesto participativo", "unidad deportiva", "espacio público", "espacio publico"],
}

LOCALES = ["colombiano", "telemedellín", "telemedellin", "minuto30", "teleantioquia", "alcaldía de medellín", "alcaldia de medellin", "telemedellin", "caracol", "rcn", "el tiempo", "blu radio", "noticias caracol", "metro de medellín", "citytv", "semana", "infobae", "publimetro", "medellín cómo vamos", "30minutos"]


def norm(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")


def bajar(consulta: str) -> list[dict]:
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": consulta + " when:2y", "hl": "es-419", "gl": "CO", "ceid": "CO:es-419"})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 ObservatorioSantaCruz (proyecto academico)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        raiz = ET.fromstring(r.read())
    salida = []
    for it in raiz.iter("item"):
        titulo = (it.findtext("title") or "").strip()
        medio = (it.findtext("source") or "").strip()
        if medio and titulo.endswith(" - " + medio):
            titulo = titulo[: -len(medio) - 3]
        try:
            fecha = parsedate_to_datetime(it.findtext("pubDate") or "").astimezone(timezone.utc).date().isoformat()
        except Exception:
            fecha = None
        salida.append({"titulo": titulo, "medio": medio, "fecha": fecha, "enlace": (it.findtext("link") or "").strip()})
    return salida


def relevante(titulo: str, medio: str) -> tuple[bool, list[str]]:
    t = norm(titulo)
    if EXCLUIR.search(t):
        return False, []
    barrios = [b for b, claves in BARRIOS.items() if any(c in t for c in claves)]
    comuna = "comuna 2" in t or "comuna dos" in t
    medellin = "medell" in t or "antioquia" in t
    # "La Rosa", "La Isla", "Moscú"... solos son ambiguos: se exige que el titular hable de Medellín o de la comuna 2
    if barrios and (medellin or comuna):
        return True, barrios
    if comuna and medellin:
        return True, barrios
    # "Santa Cruz" solo vale si el titular o el medio apuntan a Medellín (hay Santa Cruz en Bolivia, España, etc.)
    if "santa cruz" in t and (medellin or any(l in norm(medio) for l in LOCALES)) and "bolivia" not in t and "tenerife" not in t and "california" not in t:
        return True, barrios or ["Santa Cruz"]
    return False, []


def _rx(claves):
    # palabra completa (con plural o terminación corta): evita que "acera" salte con "balacera" o "bus" con "buscado"
    return re.compile(r"\b(?:" + "|".join(re.escape(norm(c).strip()) for c in claves) + r")\w{0,3}\b")


TEMAS_RX = {n: _rx(c) for n, c in TEMAS.items()}
# Noticias de víctimas o crímenes individuales: no se listan (se cuentan aparte) por respeto a las víctimas y sus familias.
SENSIBLE = _rx(["asesin", "mataron", "mató", "mato", "homicidio", "muerte violenta", "puñal", "suicid", "balacera", "capturado", "capturan", "sicari", "feminicidio", "violaci", "abuso sexual"])
EXCLUIR = re.compile(r"itag[uü]i|bello|envigado|sabaneta|bolivia|tenerife|california|argentina|espa[nñ]a")


def temas(titulo: str) -> list[str]:
    t = norm(titulo)
    return [n for n, rx in TEMAS_RX.items() if rx.search(t)] or ["Otros"]


def es_sensible(titulo: str) -> bool:
    return bool(SENSIBLE.search(norm(titulo)))


def main():
    vistos: dict[str, dict | None] = {}
    ocultas: list[dict] = []
    for q in CONSULTAS:
        try:
            items = bajar(q)
        except Exception as e:  # una consulta caída no tumba el resto
            print(f"  ! {q}: {e}")
            continue
        n = 0
        for it in items:
            ok, barrios = relevante(it["titulo"], it["medio"])
            clave = norm(re.sub(r"\W+", " ", it["titulo"]))[:90]
            if not ok or clave in vistos:
                continue
            it["barrios"] = barrios
            it["temas"] = temas(it["titulo"])
            if es_sensible(it["titulo"]):
                ocultas.append({"fecha": it["fecha"], "barrios": barrios})
                vistos[clave] = None  # se recuerda para no contarla dos veces
                continue
            vistos[clave] = it
            n += 1
        print(f"  {q}: {len(items)} resultados, {n} nuevos relevantes")
        time.sleep(1.2)
    lista = sorted((v for v in vistos.values() if v), key=lambda x: x["fecha"] or "", reverse=True)
    por_tema: dict[str, int] = {}
    por_barrio: dict[str, int] = {}
    for it in lista:
        for t in it["temas"]:
            por_tema[t] = por_tema.get(t, 0) + 1
        for b in it["barrios"]:
            por_barrio[b] = por_barrio.get(b, 0) + 1
    SALIDA.write_text(json.dumps({
        "generado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "fuente": "Google News (RSS público). Solo titular, medio, fecha y enlace.",
        "aviso": "El tema y el barrio se asignan por palabras clave del titular y pueden estar mal. Revise siempre la noticia original.",
        "consultas": CONSULTAS,
        "total": len(lista),
        "por_tema": dict(sorted(por_tema.items(), key=lambda x: -x[1])),
        "por_barrio": dict(sorted(por_barrio.items(), key=lambda x: -x[1])),
        "no_listadas_por_respeto": {"total": len(ocultas), "nota": "Noticias sobre crímenes o víctimas individuales: se cuentan pero no se muestran sus titulares ni nombres."},
        "noticias": lista,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"no listadas por sensibles: {len(ocultas)}")
    print(f"radar.json: {len(lista)} noticias relevantes")


if __name__ == "__main__":
    main()
