# Plan: rutas por la Carrera 49, más datos, problemáticas reales y escalado al Valle de Aburrá

Fecha: 10 de octubre de 2026. Meta: que el Observatorio sea útil de verdad para la Comuna 2 y se pueda vender a otras comunas y municipios.

## Lo que ya se sabe (verificado en los datos)

- En el POT la avenida se llama **"Venezuela (Carrera 49)"**, vía colectora existente. Las calles 49A, 49B y 49C son otras calles (también colectoras). En el inventario de direcciones la "CR 49" sola suma apenas 236 m, por eso el eje se arma con el trazado del POT y no con los nombres de direcciones.
- La red de caminata (`red.json`, 12.963 nodos) permite medir con tiempos de Tobler. Ahí la comparación es a pie. Para bus o carro no hay red con sentidos ni velocidades, y no se inventa.
- El servidor de la Alcaldía responde desde el computador del usuario pero bloquea el contenedor. Las descargas nuevas se hacen en Windows y se pasan al contenedor.

## Prompts de trabajo (los que se ejecutaron)

**P1. Explorador de datos.** "Lista las capas del geoportal de Medellín que sirvan para movilidad peatonal, seguridad vial, norma urbana (densidad, altura, índice de construcción) y seguridad. Por cada una: servicio, id de capa, qué trae, año, y si se puede bajar con filtro por caja. Descarta lo que no se pueda comprobar."
Resultado: 14 capas nuevas probadas desde el PC (ver `fuentes.py`).

**P2. Analista del corredor 49.** "Con la red peatonal y las manzanas del censo, mide para cada manzana el tiempo al destino más cercano (estación, parada, colegio, salud) por la ruta más rápida y por una ruta que obligue a pasar por el eje de la Carrera 49. Reporta diferencia en minutos, ponderada por personas, y en qué zonas conviene el eje. No afirmes nada que los datos no muestren."

**P3. Voz de la comuna.** "Con los indicadores reales arma la lista de problemáticas ordenada por magnitud: qué pasa, cuánta gente, dónde, con qué dato y qué capa del mapa lo muestra. Cada una amarrada a la pregunta del reto. Sin cifras sin fuente."

**P4. Escalado.** "Explica el POT de Medellín (Acuerdo 48 de 2014 y su revisión de mediano plazo 2026) y diseña cómo replicar el Observatorio en los 10 municipios del Valle de Aburrá con la data que hay o se puede bajar. Marca como 'por verificar' lo que no se haya comprobado."

**P5. Diseñador.** "Haz que todo lo que se baje o se suba se vea: catálogo con estado, y arrastrar un archivo propio (CSV con lat/lon o GeoJSON) y verlo al instante en el mapa y en una tabla."

## Qué se construye

| Pieza | Archivos |
|---|---|
| Capas nuevas del POT, semáforos, red caminera, cámaras, hurto y homicidio | `data-pipeline/fuentes.py`, `procesar.py` |
| Análisis del eje 49 | `data-pipeline/eje49.py` (nuevo, un solo script) |
| Página "Corredor Carrera 49" | `frontend/src/pages/Corredor49.tsx` |
| Página "Problemáticas" | `frontend/src/pages/Problematicas.tsx` |
| Página "Mis datos" (catálogo + subir archivos + Valle de Aburrá) | `frontend/src/pages/Datos.tsx` |
| Menú y rutas | `Layout.tsx`, `App.tsx` |

## Verificación

`tsc`, build, Playwright (escritorio y celular), cifras de las páginas contra los JSON, y prueba de subir un CSV y un GeoJSON de ejemplo.

## Ronda 3: Accesibilidad, backend de Inicio, armonía
- Accesibilidad: causa = procesar.py reescribía indicadores.json sin accesibilidad/infraestructura. Arreglado (conserva las llaves) y red.py corrido de nuevo.
- Sistema visual común en components/Pagina.tsx: Cabecera (banda con curvas de nivel), Seccion, Relacionados (enlaces cruzados entre módulos), Kpi.
- Accesibilidad compacta: KPIs pequeños, selector de destino con barras por barrio, tablas dentro de details, calculadora a un lado.
- Backend Inicio: GET /api/inicio (resumen desde indicadores, seguridad, eje49) y frontend lo intenta y cae al JSON estático.
- Enlaces cruzados: cada página termina con "Sigue por aquí" a 3 módulos relacionados.
- Hecho: Accesibilidad, Pagina.tsx, /api/inicio, PulsoComuna, Mi barrio (/barrios/:codigo), buscador Ctrl+K, transición de página.

## Ronda 4: Radar y propuesta de valor
- Radar de noticias (data-pipeline/radar.py): Google News RSS (público, solo titular, fuente, fecha y enlace; no se copia el artículo), consultas por comuna y por barrio, filtro de relevancia (menciona Medellín/Antioquia y el barrio o la comuna), clasificación por palabras clave en 7 temas, barrios detectados. Salida frontend/public/data/radar.json.
- Redes sociales: no se hace scraping de TikTok/Facebook (términos de servicio y Ley 1581 de datos personales). Alternativas documentadas: reportes ciudadanos con foto, ReportesMED, imágenes a nivel de calle (por verificar), APIs oficiales para investigación (por verificar).
- Páginas nuevas: /radar y /propuesta (necesidades, qué existe, qué falta, qué lo hace distinto, quién pagaría, datos, cómo detectamos aceras/huecos/basura, qué NO afirmamos).
