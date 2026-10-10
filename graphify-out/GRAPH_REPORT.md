# Graph Report - observatorio-santa-cruz  (2026-10-10)

## Corpus Check
- 65 files · ~141,785 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 612 nodes · 1455 edges · 33 communities (25 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Indicadores.tsx
- Mapa.tsx
- PanelRuteo.tsx
- package.json
- main.py
- procesar.py
- MapaVivo.tsx
- red.py
- json
- App.tsx
- compilerOptions
- Observatorio Inmobiliario y Territorial Santa Cruz
- Fase 1. Diseño técnico
- navegador.mjs
- Corredor49.tsx
- useDatos
- Datos.tsx
- 03_modelo_de_datos.sql
- capas.ts
- eje49.py
- ControlesMapa.tsx
- PanelCapas.tsx
- fuentes.py
- Plan: rediseño de la página de Inicio
- Plan: rutas por la Carrera 49, más datos, problemáticas reales y escalado al Valle de Aburrá
- Leyenda.tsx
- Plan: mapa inmersivo definitivo
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `num()` - 34 edges
2. `useDatos()` - 33 edges
3. `react` - 28 edges
4. `Mapa()` - 26 edges
5. `main()` - 23 edges
6. `dec()` - 22 edges
7. `Relacionados()` - 19 edges
8. `MapaVivo()` - 19 edges
9. `Revelar()` - 18 edges
10. `IconoNav()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Decisiones` --references--> `MapaVivo()`  [INFERRED]
  plans/mapa-inmersivo-definitivo.md → frontend/src/components/mapa/MapaVivo.tsx
- `Dónde está cada cosa (índice de código)` --references--> `DibujoComuna()`  [INFERRED]
  plans/inicio-ux-revamp.md → frontend/src/pages/Inicio.tsx
- `Detalle por fuente` --references--> `barrios()`  [INFERRED]
  docs/02_fuentes_de_datos.md → backend/app/main.py
- `4. Diseño inicial de la base de datos` --references--> `barrio()`  [INFERRED]
  docs/01_diseno_tecnico.md → backend/app/main.py
- `Fase 0. Lo que hay hoy (análisis con graph-indexer)` --references--> `TemaCuadro()`  [INFERRED]
  plans/mapa-inmersivo-definitivo.md → frontend/src/pages/Mapa.tsx

## Import Cycles
- None detected.

## Communities (33 total, 8 thin omitted)

### Community 0 - "Indicadores.tsx"
Cohesion: 0.17
Nodes (21): Barra(), Dato(), FichaBarrio(), Seccion(), senales(), cop(), dec2(), nf (+13 more)

### Community 1 - "Mapa.tsx"
Cohesion: 0.27
Nodes (15): ErrorCarga(), HoraSol(), Icono(), PanelCapas(), capaPorId(), horaColombia(), BotonTema(), Chulo() (+7 more)

### Community 2 - "PanelRuteo.tsx"
Cohesion: 0.11
Nodes (31): Detalle(), minutos(), PanelRuteo(), fecha(), metros(), distanciaM(), enAnillo(), enPoligono() (+23 more)

### Community 3 - "package.json"
Cohesion: 0.04
Nodes (43): dependencies, leaflet, maplibre-gl, react, react-dom, react-leaflet, react-router-dom, recharts (+35 more)

### Community 4 - "main.py"
Cohesion: 0.06
Nodes (24): accesibilidad(), barrio(), barrios(), calidad(), _capas_disponibles(), corredor_49(), fuentes(), indicadores() (+16 more)

### Community 5 - "procesar.py"
Cohesion: 0.13
Nodes (22): a_feature(), fecha_ms(), grupo_equipamiento(), guardar(), ha(), leer(), limpio(), main() (+14 more)

### Community 6 - "MapaVivo.tsx"
Cohesion: 0.12
Nodes (27): ALTURA(), aplicarFiltroSiniestros(), aplicarNocheEdificios(), aplicarOpacidad(), aplicarSol(), cajaDe(), Capa, casar() (+19 more)

### Community 7 - "red.py"
Cohesion: 0.10
Nodes (8): Elevacion, h(), infraestructura(), leer(), main(), enganchar(), tiempos_desde(), tobler_kmh()

### Community 8 - "json"
Cohesion: 0.26
Nodes (8): caja_comuna(), walk(), descargar_ecv(), descargar_fuente(), descargar_osm_caminos(), _get_json(), main(), parametros_espaciales()

### Community 9 - "App.tsx"
Cohesion: 0.13
Nodes (25): Accesibilidad, App(), Barrio, Corredor49, Datos, Fuentes, Indicadores, Mapa (+17 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 11 - "Observatorio Inmobiliario y Territorial Santa Cruz"
Cohesion: 0.17
Nodes (11): 1. Ver la plataforma (lo más rápido), 2. Volver a descargar y procesar los datos, 3. API (opcional en esta fase), 4. Pruebas, Cómo correrlo, Estado, Estructura, Fuentes principales (+3 more)

### Community 12 - "Fase 1. Diseño técnico"
Cohesion: 0.18
Nodes (10): 1. Cómo va a funcionar la plataforma, 2. Arquitectura técnica recomendada, 3. Estructura de carpetas, 4. Diseño inicial de la base de datos, 5. Fuentes oficiales que se deben comprobar, 6. Qué se puede hacer desde ya y qué depende de más datos, 7. Plan de desarrollo por pasos, Fase 1. Diseño técnico (+2 more)

### Community 19 - "Corredor49.tsx"
Cohesion: 0.07
Nodes (74): Cuenta(), Revelar(), useVisto(), ConDatos(), IconoNav(), TRAZOS, Layout(), LetraTamano() (+66 more)

### Community 20 - "useDatos"
Cohesion: 0.10
Nodes (33): ESTILO_TIPO, EtiquetaTipo(), NOMBRE_TIPO, FichaElemento(), Buscador(), Fuente, FUENTES_BUSQUEDA, normalizar() (+25 more)

### Community 21 - "Datos.tsx"
Cohesion: 0.14
Nodes (23): coleccionMisDatos(), ConjuntoPropio, guardarConjuntos(), leerConjuntos(), leerCSV(), leerGeoJSON(), LIMITE_BYTES, NOMBRES_LAT (+15 more)

### Community 22 - "03_modelo_de_datos.sql"
Cohesion: 0.28
Nodes (16): apoyo_intervencion, barrio, comuna, equipamiento, espacio_publico, estacion_transporte, estado_reporte_historial, fuente (+8 more)

### Community 23 - "capas.ts"
Cohesion: 0.14
Nodes (12): TRAZOS, AMENAZA, COLOR, ESCALA_ALERTA, Formato, Geometria, GRUPOS_EQUIPAMIENTO, LINEAS_METRO (+4 more)

### Community 24 - "eje49.py"
Cohesion: 0.18
Nodes (4): cargar(), main(), cerca(), metros()

### Community 25 - "ControlesMapa.tsx"
Cohesion: 0.26
Nodes (9): BotonesCamara(), Brujula(), capturarFoto(), fechaArchivo(), ICONOS, Joystick(), useCamara(), textoHora() (+1 more)

### Community 26 - "PanelCapas.tsx"
Cohesion: 0.32
Nodes (7): FiltroSiniestros, Modo, ANIOS, Props, CAPAS, COLORES_BARRIO, TEMAS

### Community 28 - "Plan: rediseño de la página de Inicio"
Cohesion: 0.29
Nodes (6): Archivos a tocar, Cifras: se usan las reales, Decisiones, Dónde está cada cosa (índice de código), Plan: rediseño de la página de Inicio, Verificación

### Community 29 - "Plan: rutas por la Carrera 49, más datos, problemáticas reales y escalado al Valle de Aburrá"
Cohesion: 0.29
Nodes (6): Lo que ya se sabe (verificado en los datos), Plan: rutas por la Carrera 49, más datos, problemáticas reales y escalado al Valle de Aburrá, Prompts de trabajo (los que se ejecutaron), Qué se construye, Ronda 3: Accesibilidad, backend de Inicio, armonía, Verificación

### Community 30 - "Leyenda.tsx"
Cohesion: 0.60
Nodes (4): BloqueLeyenda, Leyenda(), Muestra(), ItemLeyenda

### Community 31 - "Plan: mapa inmersivo definitivo"
Cohesion: 0.40
Nodes (4): Archivos a tocar, Decisiones, Plan: mapa inmersivo definitivo, Verificación

## Knowledge Gaps
- **8 isolated node(s):** `@types/geojson`, `@types/leaflet`, `@types/react`, `@types/react-dom`, `autoprefixer` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 229 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useDatos` to `Indicadores.tsx`, `Mapa.tsx`, `PanelRuteo.tsx`, `package.json`, `MapaVivo.tsx`, `App.tsx`, `Corredor49.tsx`, `Datos.tsx`, `ControlesMapa.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `@types/geojson`, `@types/leaflet`, `@types/react` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PanelRuteo.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `num()` connect `Corredor49.tsx` to `Indicadores.tsx`, `Mapa.tsx`, `PanelRuteo.tsx`, `App.tsx`, `useDatos`, `Datos.tsx`, `capas.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04440333024976873 - nodes in this community are weakly interconnected._
- **Why does `useDatos()` connect `useDatos` to `Indicadores.tsx`, `Mapa.tsx`, `PanelRuteo.tsx`, `App.tsx`, `Corredor49.tsx`, `Datos.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `main.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06448979591836734 - nodes in this community are weakly interconnected._