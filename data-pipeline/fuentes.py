"""
Catálogo de fuentes de datos del Observatorio.

Cada entrada describe UNA capa que se descarga de un servicio público.
Si una fuente no se ha podido comprobar, no se agrega aquí: se documenta en
docs/02_fuentes_de_datos.md como "por verificar".

Tipos de dato (campo `tipo`):
  - oficial:       publicada por una entidad pública (Alcaldía, DANE, etc.)
  - tercero:       datos abiertos de terceros (OpenStreetMap, portales, etc.)
  - campo:         levantada por el equipo en recorridos
  - demostrativo:  inventada para probar la interfaz (siempre etiquetada)
"""

MEDELLIN = "https://www.medellin.gov.co/servidormapas/rest/services"
DANE = "https://geoportal.dane.gov.co/mparcgis/rest/services"

ALCALDIA = "Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS)"
LICENCIA_MED = "Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir."
LICENCIA_DANE = "Geoportal DANE. Uso con cita de la fuente; confirmar condiciones antes de redistribuir."

# Filtros espaciales:
#   "comuna"      -> se queda con lo que toca el polígono oficial de la Comuna 2
#   "entorno"     -> comuna + 1,2 km alrededor (destinos que la gente usa aunque estén afuera)
#   "atributo"    -> filtro por un campo (where)
FUENTES = [
    {
        "id": "comuna",
        "nombre": "Límite de la Comuna 2 Santa Cruz",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 10,
        "where": "codigo='02'",
        "filtro": "atributo",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["codigo", "nombre", "identificacion", "fecha_actualizacion"],
    },
    {
        "id": "barrios",
        "nombre": "Barrios de la Comuna 2",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 9,
        "where": "limitecomunacorregimientoid='02'",
        "filtro": "atributo",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["codigo", "nombre", "fecha_actualizacion"],
    },
    {
        "id": "estaciones",
        "nombre": "Estaciones de Metro, Metrocable y Metroplús",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 1,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "linea", "tipo_est", "estado"],
    },
    {
        "id": "lineas_transporte",
        "nombre": "Líneas del sistema Metro (trazado)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 3,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "linea", "tipo", "estado"],
    },
    {
        "id": "rutas_bus",
        "nombre": "Rutas de transporte público colectivo",
        "entidad": "Alcaldía de Medellín, Secretaría de Movilidad",
        "servicio": f"{MEDELLIN}/transporte/VM_Transporte/MapServer",
        "capa": 4,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        # El campo "sistema" rompe la consulta en el servidor, por eso no se pide.
        # Es una capa de consulta (query layer) con identificadores inestables:
        # se descarga con una consulta directa en vez de por objectIds.
        "campos": ["nombre", "codigo", "tipo", "empresa", "recorrido"],
        "consulta_directa": True,
    },
    {
        "id": "vias",
        "nombre": "Malla vial de Medellín (ejes de vía)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 14,
        "filtro": "entorno",  # el entorno hace falta para llegar caminando a estaciones fuera de la comuna
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["tipo_via", "nombre_comun", "label", "jerarquia_via", "importancia", "longitud"],
    },
    {
        "id": "jerarquia_vial_pot",
        "nombre": "Jerarquización vial del POT (Acuerdo 48 de 2014)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_17_Jerarquizacion_Vial/MapServer",
        "capa": 1,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "label", "jerarquizacion_via", "clasificacion_via", "estado", "fecha_adopcion"],
    },
    {
        "id": "equipamientos",
        "nombre": "Equipamientos colectivos (cartografía base)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 18,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "tipo", "categoria", "nivel", "orden", "cod_barrio", "cod_comuna", "nom_barrio", "fecha_actualizacion"],
    },
    {
        "id": "sedes_educativas",
        "nombre": "Sedes educativas",
        "entidad": "Alcaldía de Medellín, Secretaría de Educación",
        "servicio": f"{MEDELLIN}/educacion/VC_sedes_educativas_p/MapServer",
        "capa": 0,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre_est", "sede_educa", "servicio", "sector", "direccion", "estado", "vigencia"],
    },
    {
        "id": "escenarios_deportivos",
        "nombre": "Escenarios deportivos y recreativos (INDER)",
        "entidad": "INDER Medellín",
        "servicio": f"{MEDELLIN}/deporte_recreac/VM_INDER/MapServer",
        "capa": 40,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "nombre_equipamiento", "tipologia_escenario", "tipologia_pot48", "direccion", "cod_barrio", "cod_comuna"],
    },
    {
        "id": "bibliotecas",
        "nombre": "Red de Bibliotecas de Medellín",
        "entidad": "Alcaldía de Medellín, Secretaría de Cultura Ciudadana",
        "servicio": f"{MEDELLIN}/cultura/VM_Red_Bibliotecas/MapServer",
        "capa": 0,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "tipo", "ubicacion", "comuna", "barrio", "horario"],
    },
    {
        "id": "espacio_publico",
        "nombre": "Espacio público existente",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer",
        "capa": 17,
        "filtro": "entorno",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "categoria", "subcategoria", "funcion", "nivel", "orden", "cod_barrio", "cod_comuna", "nom_barrio", "fecha_actualizacion"],
    },
    {
        "id": "espacio_publico_proyectado",
        "nombre": "Espacio público proyectado por el POT",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_12_Subs_Espacio_Publico_Esparcimiento_Encuentro_Proy/MapServer",
        "capa": 3,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nombre", "categoria", "subcategoria", "funcion", "nivel", "localizacion", "fecha_adopcion"],
    },
    {
        "id": "tratamientos",
        "nombre": "Tratamientos urbanísticos del POT (Acuerdo 48 de 2014)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_22_Tratamientos_Urbanos/MapServer",
        "capa": 0,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["codigo_tramiento", "tratamiento", "categoria_tratamiento", "identificador", "densidadmax",
                   "indiceconstruccmax", "alturanormativa", "zona", "fecha_adopcion", "fecha_actualizacion"],
    },
    {
        "id": "instrumentos",
        "nombre": "Instrumentos de planificación complementaria del POT",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_33_Instrumentos_Planificacion/MapServer",
        "capa": 3,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["nivel", "instrumento", "codigo_tratamiento", "categoria", "areaplanificacion", "fecha_adopcion"],
    },
    {
        "id": "amenaza_movimiento_masa",
        "nombre": "Amenaza por movimientos en masa (POT)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_05_Amenazas_Movimientos_Masa/MapServer",
        "capa": 2,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["codigo", "categoria", "grado_amenaza", "fecha_adopcion", "fecha_actualizacion"],
    },
    {
        "id": "riesgo_no_mitigable",
        "nombre": "Zonas con condición de riesgo alto no mitigable por movimientos en masa (POT)",
        "entidad": ALCALDIA,
        "servicio": f"{MEDELLIN}/ordenamiento_ter/VM_08_Zona_Condicion_Riego_Alto_Riesgo_NM/MapServer",
        "capa": 4,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["codigo", "nombre", "riesgo", "descripcion", "tipo_amenaza", "fecha_adopcion"],
    },
    {
        "id": "siniestros_viales",
        "nombre": "Siniestros viales registrados en la Comuna 2",
        "entidad": "Alcaldía de Medellín, Secretaría de Movilidad",
        "servicio": f"{MEDELLIN}/transporte/VM_Accidentes/MapServer",
        "capa": 0,
        "where": "nom_comuna='Santa Cruz'",
        "filtro": "atributo",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        "campos": ["fecha_siniestro", "anio", "clase_siniestro", "gravedad_siniestro", "barrio"],
    },
    {
        "id": "manzanas_censo",
        "nombre": "Manzanas con población del Censo Nacional de Población y Vivienda 2018",
        "entidad": "DANE, Marco Geoestadístico Nacional (MGN) integrado con CNPV 2018",
        "servicio": f"{DANE}/Hosted/MGN_INTEGRADO_CNPV2018_gdb/FeatureServer",
        "capa": 2,
        "filtro": "comuna",
        "tipo": "oficial",
        "licencia": LICENCIA_DANE,
        "campos": ["cod_dane_a", "tp27_perso", "tvivienda", "tp16_hog",
                   "tp34_1_eda", "tp34_2_eda", "tp34_3_eda", "tp34_4_eda", "tp34_5_eda",
                   "tp34_6_eda", "tp34_7_eda", "tp34_8_eda", "tp34_9_eda"],
    },
    {
        "id": "oferta_inmobiliaria",
        "nombre": "Oferta inmobiliaria publicada en internet (Observatorio Inmobiliario de Medellín, OIME)",
        "entidad": "Alcaldía de Medellín, Subsecretaría de Catastro (OIME), a partir de portales inmobiliarios",
        "servicio": f"{MEDELLIN}/vivienda_ciudad_terri/VM_Oferta_Comercial_Oime/MapServer",
        "capa": 1,
        "where": "codigo_comuna='02'",
        "filtro": "atributo",
        "tipo": "oficial",
        "licencia": LICENCIA_MED,
        # Sin teléfono, inmobiliaria ni descripción: no se necesitan y pueden tener datos personales.
        "campos": ["tipo_comercio", "tipo_inmueble", "category", "status", "price", "private_area_m2",
                   "total_area_m2", "stratum", "age", "bedrooms_number", "year", "neighborhood_calculated",
                   "codigo_barrio", "link"],
    },
]


# ---------------------------------------------------------------------------
# Capas de toda la ciudad (modo "Toda Medellín" del mapa). Mismos servicios,
# sin recorte espacial, para que las otras comunas se vean con los mismos ítems.
def _ciudad(base_id, nuevo_id, nombre, where="1=1"):
    base = next(f for f in FUENTES if f["id"] == base_id)
    return {**base, "id": nuevo_id, "nombre": nombre, "where": where, "filtro": "atributo"}


FUENTES += [
    _ciudad("comuna", "comunas_ciudad", "Comunas y corregimientos de Medellín", "1=1"),
    _ciudad("barrios", "barrios_ciudad", "Barrios urbanos de Medellín", "subtipo_barriovereda=1"),
    _ciudad("estaciones", "estaciones_ciudad", "Estaciones del sistema Metro en Medellín"),
    _ciudad("lineas_transporte", "lineas_ciudad", "Líneas del sistema Metro en Medellín"),
    _ciudad("equipamientos", "equipamientos_ciudad", "Equipamientos colectivos de Medellín"),
    _ciudad("sedes_educativas", "sedes_educativas_ciudad", "Sedes educativas de Medellín"),
    _ciudad("escenarios_deportivos", "escenarios_deportivos_ciudad", "Escenarios deportivos de Medellín (INDER)"),
    _ciudad("bibliotecas", "bibliotecas_ciudad", "Red de Bibliotecas de Medellín"),
    _ciudad("espacio_publico", "espacio_publico_ciudad", "Espacio público existente en Medellín"),
]
for _f in FUENTES[-9:]:
    _f["campos"] = list(dict.fromkeys(_f["campos"] + (["limitecomunacorregimientoid"] if _f["id"] == "barrios_ciudad" else [])))


# Indicadores de la Encuesta de Calidad de Vida, publicados por comuna (sin geometría aquí).
INDICADORES_ECV = {
    "servicio": f"{MEDELLIN}/estadisticas/VC_Indicadores_ECV/MapServer",
    "entidad": "Alcaldía de Medellín, DAP, Encuesta de Calidad de Vida",
    "capas": {
        "imcv": {"capa": 2, "nombre": "Índice Multidimensional de Condiciones de Vida (IMCV)", "mejor": "alto"},
        "ipm": {"capa": 1, "nombre": "Índice de Pobreza Multidimensional (IPM)", "mejor": "bajo"},
        "idh": {"capa": 3, "nombre": "Índice de Desarrollo Humano (IDH)", "mejor": "alto"},
        "desempleo": {"capa": 4, "nombre": "Tasa de desempleo (%)", "mejor": "bajo"},
    },
}


# Edificaciones de la Comuna 2 con número de pisos, para la maqueta 3D.
CONSTRUCCIONES = {
    "id": "construcciones", "nombre": "Construcciones de la Comuna 2 con número de pisos",
    "entidad": ALCALDIA, "servicio": f"{MEDELLIN}/ServiciosCiudad/CartografiaBase/MapServer", "capa": 15,
    "where": "cbml LIKE '02%'", "filtro": "atributo", "tipo": "oficial", "licencia": LICENCIA_MED,
    "campos": ["numero_pisos", "cbml"],
}

FUENTES.append(CONSTRUCCIONES)

# ---------------------------------------------------------------------------
# Infraestructura peatonal, ciclista y de transporte (Secretaría de Movilidad /
# Secretaría de Infraestructura Física). Base del análisis de accesibilidad por red.
MOVILIDAD = f"{MEDELLIN}/transporte/VC_Infraest_Gestion_Transporte/MapServer"
SECRETARIA_MOV = "Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal)"
FUENTES += [
    {"id": "andenes", "nombre": "Inventario de andenes (sidewalks)", "entidad": SECRETARIA_MOV,
     "servicio": MOVILIDAD, "capa": 10, "filtro": "comuna", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["codigo", "id_segmento", "ancho", "altura", "longitud", "estado", "obstaculo", "material"]},
    {"id": "calzadas", "nombre": "Inventario de calzadas con pendiente", "entidad": SECRETARIA_MOV,
     "servicio": MOVILIDAD, "capa": 15, "filtro": "comuna", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["codigo", "id_op", "ancho_calzada", "longitud_calzada", "pendiente"]},
    {"id": "paradas", "nombre": "Paradas de transporte público colectivo", "entidad": SECRETARIA_MOV,
     "servicio": MOVILIDAD, "capa": 0, "filtro": "entorno", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["id_paradero", "direccion", "tipo_parada", "codigo_ruta", "nombre_ruta", "sistema_ruta", "estado"]},
    {"id": "red_peatonal_pot", "nombre": "Red peatonal del POT (existente y proyectada)", "entidad": ALCALDIA,
     "servicio": MOVILIDAD, "capa": 4, "filtro": "entorno", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["tipo_redpeatonal", "estado", "jerarquia_via", "fecha_adopcion"]},
    {"id": "red_ciclista", "nombre": "Red ciclista (ciclorrutas)", "entidad": SECRETARIA_MOV,
     "servicio": MOVILIDAD, "capa": 13, "filtro": "entorno", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["corredor", "estado", "anio_construido", "tipo", "nombre_ciclorruta", "tipologia_redciclista", "longitud"]},
    {"id": "puentes", "nombre": "Puentes vehiculares y peatonales", "entidad": SECRETARIA_MOV,
     "servicio": MOVILIDAD, "capa": 14, "filtro": "entorno", "tipo": "oficial", "licencia": LICENCIA_MED,
     "campos": ["nombre", "tipo_puente", "obstaculo_salva", "direccion", "longitudlargo", "longitudancho", "fechaultimoinventario"]},
]

# ---------------------------------------------------------------------------
# Capas añadidas el 10 de octubre de 2026 (capas y servicios comprobados desde el
# computador del equipo; el servidor de la Alcaldía no responde desde algunos entornos de nube).
ORDEN = f"{MEDELLIN}/ordenamiento_ter"
SEG = f"{MEDELLIN}/seguridad_defensa"
def _nueva(id_, nombre, servicio, capa, entidad=ALCALDIA, filtro="comuna"):
    return {"id": id_, "nombre": nombre, "entidad": entidad, "servicio": servicio, "capa": capa,
            "filtro": filtro, "tipo": "oficial", "licencia": LICENCIA_MED, "campos": ["*"]}

FUENTES += [
    _nueva("pot_centralidades", "POT: centralidades urbanas", f"{ORDEN}/VM_20_Subs_Centralidades/MapServer", 1),
    _nueva("pot_corredores_transporte", "POT: corredores de transporte de pasajeros", f"{ORDEN}/VM_20_Subs_Centralidades/MapServer", 7, filtro="entorno"),
    _nueva("pot_intervencion_estrategica", "POT: áreas de intervención estratégica", f"{ORDEN}/VM_21_Prioridad_Intervencion_Subs_Habitacional/MapServer", 6),
    _nueva("semaforos", "Cruces semaforizados", f"{MEDELLIN}/transporte/VA_SIGMOV_Semaforos/MapServer", 0, SECRETARIA_MOV),
    _nueva("mortalidad_vial", "Mortalidad en siniestros viales", f"{MEDELLIN}/transporte/VM_Mortalidad/MapServer", 0, SECRETARIA_MOV),
    _nueva("cctv_camaras", "Cámaras de vigilancia (CCTV)", f"{SEG}/VM_Policia_MAP5/MapServer", 0, "Alcaldía de Medellín, Secretaría de Seguridad"),
    _nueva("cuadrantes_policia", "Cuadrantes de Policía", f"{SEG}/VM_Policia_MAP5/MapServer", 2, "Alcaldía de Medellín, Secretaría de Seguridad"),
    _nueva("hurto_2017", "Hurto 2017 (indicador de seguridad)", f"{SEG}/VM_Indicador_Seguridad/MapServer", 2, "Alcaldía de Medellín, Secretaría de Seguridad"),
    _nueva("homicidio_2017", "Homicidio 2017 (indicador de seguridad)", f"{SEG}/VM_Indicador_Seguridad/MapServer", 8, "Alcaldía de Medellín, Secretaría de Seguridad"),
]

# ---------------------------------------------------------------------------
# Trazabilidad: metadatos de cada fuente que no vienen en el servicio.
# unidad: unidad espacial; periodo: fecha o periodo de referencia de los datos;
# transformaciones: lo que se le hace en el pipeline; limitaciones: lo que se sabe que falla.
_RECORTE = "Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web"
METADATOS = {
    "comuna": {"unidad": "Polígono de comuna", "periodo": "Límite vigente (actualización registrada en la capa: 2014)", "transformaciones": "Simplificación para la web; área en EPSG:9377", "limitaciones": "Incluye el corredor del río dentro del límite oficial"},
    "barrios": {"unidad": "Polígono de barrio", "periodo": "Límites vigentes (actualización 2014)", "transformaciones": "Simplificación; áreas en EPSG:9377; base de todas las fichas", "limitaciones": "—"},
    "manzanas_censo": {"unidad": "Manzana censal", "periodo": "Censo Nacional de Población y Vivienda 2018", "transformaciones": "Cada manzana se asigna al barrio que contiene su punto interior; densidad = personas ÷ área", "limitaciones": "Dato de 2018; posible subconteo censal"},
    "espacio_publico": {"unidad": "Polígono", "periodo": "Sin fecha de corte publicada (actualización 2014 en algunos registros)", "transformaciones": "Se suman todas las categorías existentes; área en EPSG:9377", "limitaciones": "No es el indicador oficial de espacio público efectivo"},
    "espacio_publico_proyectado": {"unidad": "Polígono", "periodo": "POT Acuerdo 48 de 2014", "transformaciones": _RECORTE, "limitaciones": "Es una proyección del plan, no espacio construido"},
    "equipamientos": {"unidad": "Polígono de equipamiento", "periodo": "Actualización 2014 en la capa", "transformaciones": "Grupo asignado con reglas por palabras del nombre (procesar.py)", "limitaciones": "Faltan tipos en muchos registros; pocos de salud y primera infancia"},
    "siniestros_viales": {"unidad": "Punto (siniestro)", "periodo": "2019 a 2025", "transformaciones": "Filtro por comuna; barrio por punto en polígono", "limitaciones": "La clasificación cambia entre años; 2025 puede estar incompleto"},
    "oferta_inmobiliaria": {"unidad": "Punto (anuncio)", "periodo": "2023", "transformaciones": "Se quitan teléfono, inmobiliaria y descripción; precio por m² = precio ÷ área", "limitaciones": "Precios pedidos, no avalúos; pocos registros"},
    "andenes": {"unidad": "Tramo de andén (línea)", "periodo": "Sin fecha de corte publicada", "transformaciones": "Recorte a la comuna; indicadores de ancho por barrio", "limitaciones": "Códigos de estado y material sin diccionario publicado"},
    "calzadas": {"unidad": "Tramo de calzada (línea)", "periodo": "Sin fecha de corte publicada", "transformaciones": "Su pendiente (%) se asigna a los tramos de calle que coinciden a menos de 8 m", "limitaciones": "La pendiente no indica sentido; el sentido sale del modelo de elevación"},
    "paradas": {"unidad": "Punto (parada por ruta)", "periodo": "Sin fecha de corte publicada", "transformaciones": "Se agrupan por paradero y se listan sus rutas", "limitaciones": "Campo de estado vacío"},
    "vias": {"unidad": "Eje de vía (línea)", "periodo": "Vigente", "transformaciones": "Base de la red de caminata: las líneas se cortan en sus cruces", "limitaciones": "Se asume que en cada cruce de líneas se puede pasar; no hay barreras"},
    "construcciones": {"unidad": "Polígono de edificación", "periodo": "Catastro vigente", "transformaciones": "Solo número de pisos; altura en 3D = pisos × 3 m", "limitaciones": "3 m por piso es un supuesto"},
}
METADATOS_DEFECTO = {"unidad": "Según la capa", "periodo": "Sin fecha de corte publicada", "transformaciones": _RECORTE, "limitaciones": "—"}

# Fuentes que no son capas ArcGIS (se documentan igual)
FUENTES_EXTRA = [
    {"id": "osm_caminos", "nombre": "Senderos, escaleras y vías peatonales de OpenStreetMap",
     "entidad": "Colaboradores de OpenStreetMap, servido por OpenFreeMap (esquema OpenMapTiles)", "tipo": "tercero",
     "url_servicio": "https://tiles.openfreemap.org/planet", "formato_origen": "Teselas vectoriales (MVT) z14, capa transportation, clase path",
     "cobertura": "Comuna 2 y 1,2 km alrededor", "licencia": "ODbL 1.0 (© colaboradores de OpenStreetMap)",
     "unidad": "Línea (camino)", "periodo": "Edición de las teselas indicada en la URL de consulta",
     "transformaciones": "Decodificación MVT a GeoJSON; se usan footway, path, steps, pedestrian y cycleway",
     "limitaciones": "Mapeo voluntario: puede estar incompleto o desactualizado"},
    {"id": "dem_terrarium", "nombre": "Modelo digital de elevación (Terrain Tiles, formato Terrarium)",
     "entidad": "Mapzen / AWS Open Data (fuentes base: SRTM y otras)", "tipo": "tercero",
     "url_servicio": "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png", "formato_origen": "PNG con altura codificada en RGB, z14",
     "cobertura": "Comuna 2 y 1,3 km alrededor", "licencia": "Uso abierto con atribución (documentación de AWS Terrain Tiles)",
     "unidad": "Píxel de ~9,5 m", "periodo": "Varias épocas según la fuente base",
     "transformaciones": "Altura = R·256 + G + B/256 − 32768, interpolación bilineal, muestreo cada 20 m",
     "limitaciones": "Resolución gruesa para calles empinadas; difiere de la pendiente oficial (ver validación)"},
]
