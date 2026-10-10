# Fuentes, indicadores y trazabilidad

Este archivo se genera con `data-pipeline/documentar_fuentes.py` a partir de lo que realmente se descargó y calculó. No se edita a mano.

Clases de dato: **dato oficial publicado** (se usa tal cual), **dato descargado y procesado** (recortado o transformado), **cálculo derivado** (fórmula sobre datos) y **estimación** (depende de supuestos, como velocidades de caminata o precios).

## Fuentes

| Fuente | Entidad | Tipo | Registros | Unidad espacial | Periodo de referencia | Descargada | Estado |
|---|---|---|---|---|---|---|---|
| [Límite de la Comuna 2 Santa Cruz](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/10) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 1 | Polígono de comuna | Límite vigente (actualización registrada en la capa: 2014) | 2026-10-09 | ok |
| [Barrios de la Comuna 2](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/9) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 11 | Polígono de barrio | Límites vigentes (actualización 2014) | 2026-10-09 | ok |
| [Estaciones de Metro, Metrocable y Metroplús](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/1) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 13 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Líneas del sistema Metro (trazado)](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/3) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 7 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Rutas de transporte público colectivo](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VM_Transporte/MapServer/4) | Alcaldía de Medellín, Secretaría de Movilidad | oficial | 39 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Malla vial de Medellín (ejes de vía)](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/14) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 8099 | Eje de vía (línea) | Vigente | 2026-10-10 | ok |
| [Jerarquización vial del POT (Acuerdo 48 de 2014)](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_17_Jerarquizacion_Vial/MapServer/1) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 35 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Equipamientos colectivos (cartografía base)](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/18) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 383 | Polígono de equipamiento | Actualización 2014 en la capa | 2026-10-09 | ok |
| [Sedes educativas](https://www.medellin.gov.co/servidormapas/rest/services/educacion/VC_sedes_educativas_p/MapServer/0) | Alcaldía de Medellín, Secretaría de Educación | oficial | 139 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Escenarios deportivos y recreativos (INDER)](https://www.medellin.gov.co/servidormapas/rest/services/deporte_recreac/VM_INDER/MapServer/40) | INDER Medellín | oficial | 182 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Red de Bibliotecas de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/cultura/VM_Red_Bibliotecas/MapServer/0) | Alcaldía de Medellín, Secretaría de Cultura Ciudadana | oficial | 5 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Espacio público existente](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/17) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 589 | Polígono | Sin fecha de corte publicada (actualización 2014 en algunos registros) | 2026-10-09 | ok |
| [Espacio público proyectado por el POT](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_12_Subs_Espacio_Publico_Esparcimiento_Encuentro_Proy/MapServer/3) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 29 | Polígono | POT Acuerdo 48 de 2014 | 2026-10-09 | ok |
| [Tratamientos urbanísticos del POT (Acuerdo 48 de 2014)](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_22_Tratamientos_Urbanos/MapServer/0) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 25 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Instrumentos de planificación complementaria del POT](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_33_Instrumentos_Planificacion/MapServer/3) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 12 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Amenaza por movimientos en masa (POT)](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_05_Amenazas_Movimientos_Masa/MapServer/2) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 154 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Zonas con condición de riesgo alto no mitigable por movimientos en masa (POT)](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_08_Zona_Condicion_Riego_Alto_Riesgo_NM/MapServer/4) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 49 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Siniestros viales registrados en la Comuna 2](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VM_Accidentes/MapServer/0) | Alcaldía de Medellín, Secretaría de Movilidad | oficial | 5606 | Punto (siniestro) | 2019 a 2025 | 2026-10-09 | ok |
| [Manzanas con población del Censo Nacional de Población y Vivienda 2018](https://geoportal.dane.gov.co/mparcgis/rest/services/Hosted/MGN_INTEGRADO_CNPV2018_gdb/FeatureServer/2) | DANE, Marco Geoestadístico Nacional (MGN) integrado con CNPV 2018 | oficial | 1172 | Manzana censal | Censo Nacional de Población y Vivienda 2018 | 2026-10-09 | ok |
| [Oferta inmobiliaria publicada en internet (Observatorio Inmobiliario de Medellín, OIME)](https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VM_Oferta_Comercial_Oime/MapServer/1) | Alcaldía de Medellín, Subsecretaría de Catastro (OIME), a partir de portales inmobiliarios | oficial | 41 | Punto (anuncio) | 2023 | 2026-10-09 | ok |
| [Comunas y corregimientos de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/10) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 23 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Barrios urbanos de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/9) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 271 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Estaciones del sistema Metro en Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/1) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 81 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Líneas del sistema Metro en Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/3) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 14 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Equipamientos colectivos de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/18) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 2139 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Sedes educativas de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/educacion/VC_sedes_educativas_p/MapServer/0) | Alcaldía de Medellín, Secretaría de Educación | oficial | 779 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Escenarios deportivos de Medellín (INDER)](https://www.medellin.gov.co/servidormapas/rest/services/deporte_recreac/VM_INDER/MapServer/40) | INDER Medellín | oficial | 967 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Red de Bibliotecas de Medellín](https://www.medellin.gov.co/servidormapas/rest/services/cultura/VM_Red_Bibliotecas/MapServer/0) | Alcaldía de Medellín, Secretaría de Cultura Ciudadana | oficial | 32 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Espacio público existente en Medellín](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/17) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 3743 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Construcciones de la Comuna 2 con número de pisos](https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/15) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 43977 | Polígono de edificación | Catastro vigente | 2026-10-10 | ok |
| [Inventario de andenes (sidewalks)](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/10) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 2266 | Tramo de andén (línea) | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Inventario de calzadas con pendiente](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/15) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 1370 | Tramo de calzada (línea) | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Paradas de transporte público colectivo](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/0) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 978 | Punto (parada por ruta) | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Red peatonal del POT (existente y proyectada)](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/4) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 156 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Red ciclista (ciclorrutas)](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/13) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 10 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [Puentes vehiculares y peatonales](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/14) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 287 | Según la capa | Sin fecha de corte publicada | 2026-10-10 | ok |
| [POT: centralidades urbanas](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_20_Subs_Centralidades/MapServer/1) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [POT: corredores de transporte de pasajeros](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_20_Subs_Centralidades/MapServer/7) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [POT: áreas de intervención estratégica](https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_21_Prioridad_Intervencion_Subs_Habitacional/MapServer/6) | Alcaldía de Medellín, Departamento Administrativo de Planeación (Geoportal / MAPGIS) | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Cruces semaforizados](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VA_SIGMOV_Semaforos/MapServer/0) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Mortalidad en siniestros viales](https://www.medellin.gov.co/servidormapas/rest/services/transporte/VM_Mortalidad/MapServer/0) | Alcaldía de Medellín, Secretaría de Movilidad e Infraestructura (Geoportal) | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Cámaras de vigilancia (CCTV)](https://www.medellin.gov.co/servidormapas/rest/services/seguridad_defensa/VM_Policia_MAP5/MapServer/0) | Alcaldía de Medellín, Secretaría de Seguridad | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Cuadrantes de Policía](https://www.medellin.gov.co/servidormapas/rest/services/seguridad_defensa/VM_Policia_MAP5/MapServer/2) | Alcaldía de Medellín, Secretaría de Seguridad | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Hurto 2017 (indicador de seguridad)](https://www.medellin.gov.co/servidormapas/rest/services/seguridad_defensa/VM_Indicador_Seguridad/MapServer/2) | Alcaldía de Medellín, Secretaría de Seguridad | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Homicidio 2017 (indicador de seguridad)](https://www.medellin.gov.co/servidormapas/rest/services/seguridad_defensa/VM_Indicador_Seguridad/MapServer/8) | Alcaldía de Medellín, Secretaría de Seguridad | oficial | 0 | Según la capa | Sin fecha de corte publicada |  | sin descargar |
| [Indicadores de la Encuesta de Calidad de Vida por comuna](https://www.medellin.gov.co/servidormapas/rest/services/estadisticas/VC_Indicadores_ECV/MapServer) | Alcaldía de Medellín, DAP, Encuesta de Calidad de Vida | oficial | 84 | Según la capa | Sin fecha de corte publicada | 2026-10-09 | ok |
| [Senderos, escaleras y vías peatonales de OpenStreetMap](https://tiles.openfreemap.org/planet) | Colaboradores de OpenStreetMap, servido por OpenFreeMap (esquema OpenMapTiles) | tercero | 3470 | Línea (camino) | Edición de las teselas indicada en la URL de consulta | 2026-10-10 | ok |
| [Modelo digital de elevación (Terrain Tiles, formato Terrarium)](https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png) | Mapzen / AWS Open Data (fuentes base: SRTM y otras) | tercero | 0 | Píxel de ~9,5 m | Varias épocas según la fuente base |  | ok |

### Detalle por fuente

**Límite de la Comuna 2 Santa Cruz** (`comuna`)  
Cobertura: Filtro: codigo='02'. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, nombre, identificacion, fecha_actualizacion.  
Transformaciones: Simplificación para la web; área en EPSG:9377.  
Limitaciones: Incluye el corredor del río dentro del límite oficial. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/10/query?where=codigo%3D%2702%27&f=geojson`

**Barrios de la Comuna 2** (`barrios`)  
Cobertura: Filtro: limitecomunacorregimientoid='02'. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, nombre, fecha_actualizacion.  
Transformaciones: Simplificación; áreas en EPSG:9377; base de todas las fichas.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/9/query?where=limitecomunacorregimientoid%3D%2702%27&f=geojson`

**Estaciones de Metro, Metrocable y Metroplús** (`estaciones`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, linea, tipo_est, estado.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/1/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Líneas del sistema Metro (trazado)** (`lineas_transporte`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, linea, tipo, estado.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/3/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Rutas de transporte público colectivo** (`rutas_bus`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, codigo, tipo, empresa, recorrido.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VM_Transporte/MapServer/4/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Malla vial de Medellín (ejes de vía)** (`vias`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: tipo_via, nombre_comun, label, jerarquia_via, importancia, longitud.  
Transformaciones: Base de la red de caminata: las líneas se cortan en sus cruces.  
Limitaciones: Se asume que en cada cruce de líneas se puede pasar; no hay barreras. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/14/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Jerarquización vial del POT (Acuerdo 48 de 2014)** (`jerarquia_vial_pot`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, label, jerarquizacion_via, clasificacion_via, estado, fecha_adopcion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_17_Jerarquizacion_Vial/MapServer/1/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Equipamientos colectivos (cartografía base)** (`equipamientos`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, tipo, categoria, nivel, orden, cod_barrio, cod_comuna, nom_barrio, fecha_actualizacion.  
Transformaciones: Grupo asignado con reglas por palabras del nombre (procesar.py).  
Limitaciones: Faltan tipos en muchos registros; pocos de salud y primera infancia. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/18/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Sedes educativas** (`sedes_educativas`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre_est, sede_educa, servicio, sector, direccion, estado, vigencia.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/educacion/VC_sedes_educativas_p/MapServer/0/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Escenarios deportivos y recreativos (INDER)** (`escenarios_deportivos`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, nombre_equipamiento, tipologia_escenario, tipologia_pot48, direccion, cod_barrio, cod_comuna.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/deporte_recreac/VM_INDER/MapServer/40/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Red de Bibliotecas de Medellín** (`bibliotecas`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, tipo, ubicacion, comuna, barrio, horario.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/cultura/VM_Red_Bibliotecas/MapServer/0/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Espacio público existente** (`espacio_publico`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, categoria, subcategoria, funcion, nivel, orden, cod_barrio, cod_comuna, nom_barrio, fecha_actualizacion.  
Transformaciones: Se suman todas las categorías existentes; área en EPSG:9377.  
Limitaciones: No es el indicador oficial de espacio público efectivo. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/17/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Espacio público proyectado por el POT** (`espacio_publico_proyectado`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, categoria, subcategoria, funcion, nivel, localizacion, fecha_adopcion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: Es una proyección del plan, no espacio construido. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_12_Subs_Espacio_Publico_Esparcimiento_Encuentro_Proy/MapServer/3/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Tratamientos urbanísticos del POT (Acuerdo 48 de 2014)** (`tratamientos`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo_tramiento, tratamiento, categoria_tratamiento, identificador, densidadmax, indiceconstruccmax, alturanormativa, zona, fecha_adopcion, fecha_actualizacion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_22_Tratamientos_Urbanos/MapServer/0/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Instrumentos de planificación complementaria del POT** (`instrumentos`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nivel, instrumento, codigo_tratamiento, categoria, areaplanificacion, fecha_adopcion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_33_Instrumentos_Planificacion/MapServer/3/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Amenaza por movimientos en masa (POT)** (`amenaza_movimiento_masa`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, categoria, grado_amenaza, fecha_adopcion, fecha_actualizacion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_05_Amenazas_Movimientos_Masa/MapServer/2/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Zonas con condición de riesgo alto no mitigable por movimientos en masa (POT)** (`riesgo_no_mitigable`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, nombre, riesgo, descripcion, tipo_amenaza, fecha_adopcion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ordenamiento_ter/VM_08_Zona_Condicion_Riego_Alto_Riesgo_NM/MapServer/4/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Siniestros viales registrados en la Comuna 2** (`siniestros_viales`)  
Cobertura: Filtro: nom_comuna='Santa Cruz'. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: fecha_siniestro, anio, clase_siniestro, gravedad_siniestro, barrio.  
Transformaciones: Filtro por comuna; barrio por punto en polígono.  
Limitaciones: La clasificación cambia entre años; 2025 puede estar incompleto. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VM_Accidentes/MapServer/0/query?where=nom_comuna%3D%27Santa+Cruz%27&f=geojson`

**Manzanas con población del Censo Nacional de Población y Vivienda 2018** (`manzanas_censo`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: cod_dane_a, tp27_perso, tvivienda, tp16_hog, tp34_1_eda, tp34_2_eda, tp34_3_eda, tp34_4_eda, tp34_5_eda, tp34_6_eda, tp34_7_eda, tp34_8_eda, tp34_9_eda.  
Transformaciones: Cada manzana se asigna al barrio que contiene su punto interior; densidad = personas ÷ área.  
Limitaciones: Dato de 2018; posible subconteo censal. Licencia: Geoportal DANE. Uso con cita de la fuente; confirmar condiciones antes de redistribuir..  
Consulta exacta: `https://geoportal.dane.gov.co/mparcgis/rest/services/Hosted/MGN_INTEGRADO_CNPV2018_gdb/FeatureServer/2/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Oferta inmobiliaria publicada en internet (Observatorio Inmobiliario de Medellín, OIME)** (`oferta_inmobiliaria`)  
Cobertura: Filtro: codigo_comuna='02'. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: tipo_comercio, tipo_inmueble, category, status, price, private_area_m2, total_area_m2, stratum, age, bedrooms_number, year, neighborhood_calculated, codigo_barrio, link.  
Transformaciones: Se quitan teléfono, inmobiliaria y descripción; precio por m² = precio ÷ área.  
Limitaciones: Precios pedidos, no avalúos; pocos registros. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VM_Oferta_Comercial_Oime/MapServer/1/query?where=codigo_comuna%3D%2702%27&f=geojson`

**Comunas y corregimientos de Medellín** (`comunas_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, nombre, identificacion, fecha_actualizacion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/10/query?where=1%3D1&f=geojson`

**Barrios urbanos de Medellín** (`barrios_ciudad`)  
Cobertura: Filtro: subtipo_barriovereda=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, nombre, fecha_actualizacion, limitecomunacorregimientoid.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/9/query?where=subtipo_barriovereda%3D1&f=geojson`

**Estaciones del sistema Metro en Medellín** (`estaciones_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, linea, tipo_est, estado.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/1/query?where=1%3D1&f=geojson`

**Líneas del sistema Metro en Medellín** (`lineas_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, linea, tipo, estado.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/3/query?where=1%3D1&f=geojson`

**Equipamientos colectivos de Medellín** (`equipamientos_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, tipo, categoria, nivel, orden, cod_barrio, cod_comuna, nom_barrio, fecha_actualizacion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/18/query?where=1%3D1&f=geojson`

**Sedes educativas de Medellín** (`sedes_educativas_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre_est, sede_educa, servicio, sector, direccion, estado, vigencia.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/educacion/VC_sedes_educativas_p/MapServer/0/query?where=1%3D1&f=geojson`

**Escenarios deportivos de Medellín (INDER)** (`escenarios_deportivos_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, nombre_equipamiento, tipologia_escenario, tipologia_pot48, direccion, cod_barrio, cod_comuna.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/deporte_recreac/VM_INDER/MapServer/40/query?where=1%3D1&f=geojson`

**Red de Bibliotecas de Medellín** (`bibliotecas_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, tipo, ubicacion, comuna, barrio, horario.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/cultura/VM_Red_Bibliotecas/MapServer/0/query?where=1%3D1&f=geojson`

**Espacio público existente en Medellín** (`espacio_publico_ciudad`)  
Cobertura: Filtro: 1=1. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, categoria, subcategoria, funcion, nivel, orden, cod_barrio, cod_comuna, nom_barrio, fecha_actualizacion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/17/query?where=1%3D1&f=geojson`

**Construcciones de la Comuna 2 con número de pisos** (`construcciones`)  
Cobertura: Filtro: cbml LIKE '02%'. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: numero_pisos, cbml.  
Transformaciones: Solo número de pisos; altura en 3D = pisos × 3 m.  
Limitaciones: 3 m por piso es un supuesto. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/ServiciosCiudad/CartografiaBase/MapServer/15/query?where=cbml+LIKE+%2702%25%27&f=geojson`

**Inventario de andenes (sidewalks)** (`andenes`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, id_segmento, ancho, altura, longitud, estado, obstaculo, material.  
Transformaciones: Recorte a la comuna; indicadores de ancho por barrio.  
Limitaciones: Códigos de estado y material sin diccionario publicado. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/10/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Inventario de calzadas con pendiente** (`calzadas`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: codigo, id_op, ancho_calzada, longitud_calzada, pendiente.  
Transformaciones: Su pendiente (%) se asigna a los tramos de calle que coinciden a menos de 8 m.  
Limitaciones: La pendiente no indica sentido; el sentido sale del modelo de elevación. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/15/query?where=1%3D1&geometry=-75.56333422254316%2C6.288913383262578%2C-75.5442003106312%2C6.310168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Paradas de transporte público colectivo** (`paradas`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: id_paradero, direccion, tipo_parada, codigo_ruta, nombre_ruta, sistema_ruta, estado.  
Transformaciones: Se agrupan por paradero y se listan sus rutas.  
Limitaciones: Campo de estado vacío. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/0/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Red peatonal del POT (existente y proyectada)** (`red_peatonal_pot`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: tipo_redpeatonal, estado, jerarquia_via, fecha_adopcion.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/4/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Red ciclista (ciclorrutas)** (`red_ciclista`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: corredor, estado, anio_construido, tipo, nombre_ciclorruta, tipologia_redciclista, longitud.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/13/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**Puentes vehiculares y peatonales** (`puentes`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: nombre, tipo_puente, obstaculo_salva, direccion, longitudlargo, longitudancho, fechaultimoinventario.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/transporte/VC_Infraest_Gestion_Transporte/MapServer/14/query?where=1%3D1&geometry=-75.57433422254316%2C6.277913383262578%2C-75.5332003106312%2C6.321168223938658&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&f=geojson`

**POT: centralidades urbanas** (`pot_centralidades`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**POT: corredores de transporte de pasajeros** (`pot_corredores_transporte`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**POT: áreas de intervención estratégica** (`pot_intervencion_estrategica`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Cruces semaforizados** (`semaforos`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Mortalidad en siniestros viales** (`mortalidad_vial`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Cámaras de vigilancia (CCTV)** (`cctv_camaras`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Cuadrantes de Policía** (`cuadrantes_policia`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Hurto 2017 (indicador de seguridad)** (`hurto_2017`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Homicidio 2017 (indicador de seguridad)** (`homicidio_2017`)  
Cobertura: Comuna 2 (polígono oficial). Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: *.  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  

**Indicadores de la Encuesta de Calidad de Vida por comuna** (`indicadores_ecv`)  
Cobertura: 16 comunas y 5 corregimientos. Sistema de coordenadas: Origen en el servicio (MAGNA-SIRGAS); se consulta en WGS84, EPSG:4326 (outSR=4326). Áreas y distancias en EPSG:9377.  
Campos usados: Todos (indicadores por comuna).  
Transformaciones: Descarga por caja; recorte al polígono oficial de la comuna (o 1,2 km alrededor) con shapely; simplificación de ~0,5 m para la web.  
Limitaciones: —. Licencia: Publicada en el Geoportal de la Alcaldía de Medellín. Condiciones de uso por confirmar con el DAP antes de redistribuir..  
Consulta exacta: `https://www.medellin.gov.co/servidormapas/rest/services/estadisticas/VC_Indicadores_ECV/MapServer`

**Senderos, escaleras y vías peatonales de OpenStreetMap** (`osm_caminos`)  
Cobertura: Comuna 2 y 1,2 km alrededor. Sistema de coordenadas: EPSG:4326 (Web Mercator en las teselas).  
Campos usados: class, subclass, surface, brunnel.  
Transformaciones: Decodificación MVT a GeoJSON; se usan footway, path, steps, pedestrian y cycleway.  
Limitaciones: Mapeo voluntario: puede estar incompleto o desactualizado. Licencia: ODbL 1.0 (© colaboradores de OpenStreetMap).  
Consulta exacta: `https://tiles.openfreemap.org/planet/20261004_113936_pt/{z}/{x}/{y}.pbf (z14, capa transportation, clase path)`

**Modelo digital de elevación (Terrain Tiles, formato Terrarium)** (`dem_terrarium`)  
Cobertura: Comuna 2 y 1,3 km alrededor. Sistema de coordenadas: EPSG:4326 (Web Mercator en las teselas).  
Campos usados: Altura codificada en RGB.  
Transformaciones: Altura = R·256 + G + B/256 − 32768, interpolación bilineal, muestreo cada 20 m.  
Limitaciones: Resolución gruesa para calles empinadas; difiere de la pendiente oficial (ver validación). Licencia: Uso abierto con atribución (documentación de AWS Terrain Tiles).  

## Indicadores

| Indicador | Término (EE. UU.) | Fórmula | Unidad | Año | Clase | Limitaciones |
|---|---|---|---|---|---|---|
| Población residente | Resident population | Σ personas de las manzanas del barrio o la comuna | personas | 2018 | Dato descargado y procesado | Censo 2018; posible subconteo |
| Densidad de población | Population density | Población ÷ área (ha) | hab/ha | 2018 | Cálculo derivado | La comuna incluye el corredor del río, que baja la densidad |
| A. Espacio público por habitante | Public open space per capita | Área total de espacio público existente (m²) ÷ población residente | m²/persona | Espacio: sin fecha de corte; población: 2018 | Cálculo derivado | No es el indicador oficial de espacio público efectivo |
| B. Costo de intervención por metro cuadrado | Cost per square meter | Costo total estimado (COP) ÷ área de intervención (m²) | COP/m² | Según el precio registrado | Estimación | Pendiente de datos: no hay precios públicos confiables |
| C. Inversión por persona beneficiada | Cost per beneficiary | Costo total estimado (COP) ÷ personas beneficiadas estimadas | COP/persona | Según el precio registrado | Estimación | Pendiente de datos; los beneficiarios son estimaciones |
| D. Presupuesto total de intervención | Total project cost | Cantidad de obra × precio unitario × (1 + % costos indirectos) | COP | Según el precio registrado | Estimación | Pendiente de datos; no incluye diseños, predios ni interventoría salvo que el % los cubra |
| Tiempo de caminata al destino más cercano | Network-based walking time | Σ (largo del tramo ÷ velocidad de Tobler según su pendiente) por la ruta más rápida | minutos | Datos vigentes a la descarga | Estimación | Velocidad teórica; no hay barreras, semáforos ni seguridad; red posiblemente incompleta |
| Población dentro del umbral de acceso | Population within access threshold | Personas de manzanas con tiempo ≤ umbral ÷ personas del barrio × 100 | % | 2018 (población) | Estimación | Hereda los supuestos del tiempo de caminata |
| Índice de rodeo a la estación | Route directness (detour) index | Distancia por la red ÷ distancia en línea recta a la estación más cercana | veces | Vigente | Cálculo derivado | — |
| Andén más angosto que 1,2 m | Share of narrow sidewalks | Largo de andén con ancho < 1,2 m ÷ largo total de andén × 100 | % del largo | Sin fecha de corte | Cálculo derivado | Solo tramos con ancho registrado |
| Ancho mediano de andén | Median sidewalk width | Mediana del campo ancho de los tramos | m | Sin fecha de corte | Cálculo derivado | — |
| Atropellos por cada mil habitantes | Pedestrian crashes per 1,000 residents | Atropellos 2019–2025 en el barrio ÷ población 2018 × 1.000 | por mil habitantes (7 años) | 2019–2025 | Cálculo derivado | Población de 2018; 2025 posiblemente incompleto |
| Área en amenaza alta por movimientos en masa | High landslide hazard area share | Área en amenaza alta ÷ área del barrio × 100 | % | POT 2014 (actualización 2026 en la capa) | Cálculo derivado | — |
| Necesidad territorial (modelo) | Territorial need score | Σ peso × criterio normalizado (0–1) ÷ Σ pesos, solo criterios de necesidad | puntaje 0–100 | Varios | Cálculo derivado | Pesos propuestos por el equipo, no oficiales |
| Viabilidad económica preliminar (modelo) | Preliminary economic feasibility score | 1 − costo por beneficiario normalizado | puntaje 0–100 | Según el precio registrado | Estimación | Pendiente de datos |
| Prioridad calculada por el modelo | Model-based priority score | Σ peso × criterio normalizado ÷ Σ pesos (necesidad y viabilidad) | puntaje 0–100 | Varios | Cálculo derivado | No prueba causalidad ni es una decisión oficial |
| Índice Multidimensional de Condiciones de Vida | Multidimensional Living Conditions Index | Publicado por la Alcaldía (Encuesta de Calidad de Vida) | puntos (0–100) | 2014–2024 | Dato oficial publicado | — |
| Mediana del precio pedido por m² | Median asking price per square meter | Mediana de precio ÷ área de anuncios de venta de vivienda | COP/m² | 2023 | Cálculo derivado | Precios pedidos, no avalúos |

## Glosario

- Espacio público abierto: *Public open space*
- Equipamientos públicos: *Public facilities*
- Accesibilidad peatonal: *Pedestrian accessibility*
- Andenes: *Sidewalks*
- Escaleras peatonales: *Pedestrian stairs*
- Ciclorrutas y vías ciclistas: *Bicycle lanes and bikeways*
- Accesibilidad al transporte público: *Public transit accessibility*
- Análisis de accesibilidad basado en redes: *Network-based accessibility analysis*
- Costo por metro cuadrado: *Cost per square meter*
- Costo por habitante beneficiado: *Cost per beneficiary*
- Espacio público por habitante: *Public open space per capita*
- Priorización de proyectos de infraestructura: *Infrastructure project prioritization*
- Índice de rodeo: *Route directness index*

## Fuentes por verificar

| Fuente | Dónde | Para qué | Estado |
|---|---|---|---|
| OpenStreetMap vía Overpass API | https://overpass-api.de/api/interpreter | Atributos completos de los caminos (iluminación, rampas, barandas) | Sin conexión desde el entorno de trabajo ni desde el equipo del proyecto. Se usaron las teselas de OpenFreeMap, que traen menos atributos. |
| Diccionario de códigos del inventario de andenes | Secretaría de Infraestructura Física / Movilidad | Saber qué significan los códigos de estado y material | No publicado en el servicio. Solicitarlo a la Alcaldía. |
| Sedes de Buen Comienzo / hogares infantiles | Por identificar (Secretaría de Educación, ICBF) | Destinos de primera infancia | La capa de equipamientos solo registra 1 en la comuna. |
| Red de salud (Metrosalud e IPS) | Por identificar (Secretaría de Salud, REPS) | Destinos de salud completos | La capa de equipamientos registra pocos en la comuna. |
| Precios unitarios de obra | Por identificar (licitaciones de la Alcaldía, SIF, EDU) | Costos B, C y D | No se encontró una fuente pública confiable; la plataforma permite registrarlos con su fuente. |
| Licencias de construcción | https://www.medellin.gov.co/servidormapas/rest/services/vivienda_ciudad_terri/VM_Licencias/MapServer | Cambios en el territorio | La consulta espacial respondió con error. |
| Avalúos catastrales por predio | Subsecretaría de Catastro | Valor oficial del suelo | No son públicos por predio. |

## Notas de calidad

- **Población:** Censo Nacional de Población y Vivienda 2018 (DANE), el último dato oficial por manzana. Cada manzana se asigna al barrio que contiene su punto interior.
- **Equipamientos:** La capa oficial no trae el tipo de muchos equipamientos. El grupo (Educación, Salud, etc.) se asigna con una regla por palabras del nombre (procesar.py). Es una clasificación del equipo.
- **Espacio público:** Se suman todas las categorías de espacio público existente. No es el indicador oficial de espacio público efectivo.
- **Andenes:** El inventario oficial de andenes trae el ancho de cada tramo (unos 78 km en la comuna). Sus códigos de estado y material no tienen diccionario publicado, por eso no se usan.
- **Tiempos de caminata:** Son estimaciones con la velocidad de Tobler sobre la red de calles oficiales, caminos de OpenStreetMap y puentes peatonales. No se modelan semáforos, rejas ni seguridad.
- **Pendiente:** Donde hay calzada inventariada se usa la pendiente oficial; en el resto, un modelo de elevación de ~10 m que difiere de la oficial (ver la validación en Accesibilidad).
- **Siniestros viales:** La clasificación cambia entre años y 2025 puede estar incompleto.
- **Oferta inmobiliaria (OIME):** Precios pedidos en internet en 2023, no avalúos. Se excluyen teléfono, inmobiliaria y descripción.
- **Costos:** Ningún precio viene precargado. Los costos solo aparecen si alguien registra un precio unitario con su fuente.
- **Primera infancia y salud:** La capa de equipamientos registra muy pocos jardines infantiles y centros de salud en la comuna.

**Condiciones de uso:** los geoportales de la Alcaldía de Medellín y del DANE son públicos, pero antes de publicar la plataforma en internet hay que confirmar con cada entidad las condiciones para redistribuir sus datos.
