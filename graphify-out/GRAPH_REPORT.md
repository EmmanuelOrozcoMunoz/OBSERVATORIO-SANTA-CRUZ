# Graph Report - observatorio-santa-cruz  (2026-10-10)

## Corpus Check
- 48 files · ~121,203 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 2, .css 1)

## Summary
- 456 nodes · 974 edges · 19 communities (13 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.9)
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

## God Nodes (most connected - your core abstractions)
1. `Mapa()` - 26 edges
2. `num()` - 23 edges
3. `main()` - 22 edges
4. `useDatos()` - 19 edges
5. `react` - 18 edges
6. `MapaVivo()` - 18 edges
7. `main()` - 16 edges
8. `dec2()` - 16 edges
9. `compilerOptions` - 16 edges
10. `procesar_ciudad()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Detalle por fuente` --references--> `barrios()`  [INFERRED]
  docs/02_fuentes_de_datos.md → backend/app/main.py
- `Decisiones` --references--> `MapaVivo()`  [INFERRED]
  plans/mapa-inmersivo-definitivo.md → frontend/src/components/mapa/MapaVivo.tsx
- `Fase 0. Lo que hay hoy (análisis con graph-indexer)` --references--> `TemaCuadro()`  [INFERRED]
  plans/mapa-inmersivo-definitivo.md → frontend/src/pages/Mapa.tsx
- `4. Diseño inicial de la base de datos` --references--> `barrio()`  [INFERRED]
  docs/01_diseno_tecnico.md → backend/app/main.py
- `Fase 0. Lo que hay hoy (análisis con graph-indexer)` --references--> `mascara()`  [INFERRED]
  plans/mapa-inmersivo-definitivo.md → frontend/src/components/mapa/MapaVivo.tsx

## Import Cycles
- None detected.

## Communities (19 total, 6 thin omitted)

### Community 0 - "Indicadores.tsx"
Cohesion: 0.06
Nodes (70): Cargando(), ConDatos(), ErrorCarga(), ESTILO_TIPO, EtiquetaTipo(), NOMBRE_TIPO, Barra(), Dato() (+62 more)

### Community 1 - "Mapa.tsx"
Cohesion: 0.08
Nodes (45): BotonesCamara(), Brujula(), capturarFoto(), fechaArchivo(), HoraSol(), ICONOS, Joystick(), useCamara() (+37 more)

### Community 2 - "PanelRuteo.tsx"
Cohesion: 0.08
Nodes (41): Buscador(), Fuente, FUENTES_BUSQUEDA, normalizar(), Resultado, Opciones, Detalle(), minutos() (+33 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (40): dependencies, leaflet, maplibre-gl, react, react-dom, react-leaflet, react-router-dom, recharts (+32 more)

### Community 4 - "main.py"
Cohesion: 0.08
Nodes (18): barrio(), barrios(), calidad(), _capas_disponibles(), fuentes(), indicadores(), _leer(), listar_capas() (+10 more)

### Community 5 - "procesar.py"
Cohesion: 0.11
Nodes (22): a_feature(), fecha_ms(), grupo_equipamiento(), guardar(), ha(), leer(), limpio(), main() (+14 more)

### Community 6 - "MapaVivo.tsx"
Cohesion: 0.10
Nodes (31): ALTURA(), aplicarFiltroSiniestros(), aplicarNocheEdificios(), aplicarOpacidad(), aplicarSol(), cajaDe(), Capa, casar() (+23 more)

### Community 7 - "red.py"
Cohesion: 0.10
Nodes (8): Elevacion, h(), infraestructura(), leer(), main(), enganchar(), tiempos_desde(), tobler_kmh()

### Community 8 - "json"
Cohesion: 0.16
Nodes (9): caja_comuna(), walk(), descargar_ecv(), descargar_fuente(), descargar_osm_caminos(), _get_json(), main(), parametros_espaciales() (+1 more)

### Community 9 - "App.tsx"
Cohesion: 0.17
Nodes (17): Accesibilidad, App(), Fuentes, Indicadores, Mapa, NoEncontrada(), Participacion, Prioridades (+9 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 11 - "Observatorio Inmobiliario y Territorial Santa Cruz"
Cohesion: 0.17
Nodes (11): 1. Ver la plataforma (lo más rápido), 2. Volver a descargar y procesar los datos, 3. API (opcional en esta fase), 4. Pruebas, Cómo correrlo, Estado, Estructura, Fuentes principales (+3 more)

### Community 12 - "Fase 1. Diseño técnico"
Cohesion: 0.20
Nodes (9): 1. Cómo va a funcionar la plataforma, 2. Arquitectura técnica recomendada, 3. Estructura de carpetas, 5. Fuentes oficiales que se deben comprobar, 6. Qué se puede hacer desde ya y qué depende de más datos, 7. Plan de desarrollo por pasos, Fase 1. Diseño técnico, Fórmulas previstas para la Fase 3 (+1 more)

## Knowledge Gaps
- **8 isolated node(s):** `@types/geojson`, `@types/leaflet`, `@types/react`, `@types/react-dom`, `autoprefixer` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 177 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `Indicadores.tsx`, `Mapa.tsx`, `PanelRuteo.tsx`, `package.json`, `MapaVivo.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `@types/geojson`, `@types/leaflet`, `@types/react` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Indicadores.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0644384221619994 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `App.tsx` to `Indicadores.tsx`, `Mapa.tsx`, `package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `Mapa.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07617051013277429 - nodes in this community are weakly interconnected._
- **Should `PanelRuteo.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.04878048780487805 - nodes in this community are weakly interconnected._