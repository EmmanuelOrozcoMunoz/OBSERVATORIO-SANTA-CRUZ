# Plan: mapa inmersivo definitivo

Fecha: 10 de octubre de 2026. Alcance: módulo Mapa territorial del Observatorio Santa Cruz.

## Fase 0. Lo que hay hoy (análisis con graph-indexer)

| Pieza | Dónde está |
|---|---|
| Mapa 3D (MapLibre 4.7) | `frontend/src/components/mapa/MapaVivo.tsx`. Se crea en la línea 186, las capas base en el `load` (206), los estilos de capas de datos en `estilos()` (84) y los edificios del catastro (`edificios-comuna`, 446) |
| Borde de la comuna | capas `comuna-halo` (276) y `comuna-borde` (278), negro de 3,2 px |
| Nombres de barrio | capa `barrios-nombre` (279), letra Noto Sans Bold de las teselas |
| Niebla de afuera | capas `mascara` y `mascara-difuminado` (261, 262), gris #e8ebe4 |
| Topbar | `pages/Mapa.tsx` 319 a 370: Santa Cruz / Toda Medellín, buscador, ¿Cómo llego?, Ver en 3D / Ver en plano, Recorrido |
| Panel "¿Qué quiere ver?" | `pages/Mapa.tsx` 373 a 397 (computador) y 400 a 409 (celular). Tarjetas en `TemaCuadro` (104) con el circulito gris |
| Sidebar | `components/Layout.tsx`, aside 104 y header de celular 122 |
| Estado de filtros | Todo en `useState` de `Mapa.tsx` (134 a 161): modo, activas, vista3d, colorBarrios, filtroSin, seleccion, ruteo… No hay contexto ni store global |
| Controles de cámara | No hay brújula, zoom ni joystick. Solo atribución y escala |
| Fuentes | Archivo (Google Fonts) en index.html; el mapa usa Noto Sans de las teselas |

## Decisiones

1. **Estado global.** No existe un store, así que el modo Solo Mapa se guarda en `Mapa.tsx` y se avisa al Layout con un atributo en `<html>` (`data-solo-mapa`), igual a como ya funciona "Letra más grande". El CSS esconde el sidebar con transición de 300 ms. Los filtros no se tocan: los paneles se esconden pero no se desmontan, así que al salir todo queda como estaba.
2. **Acceso al mapa desde la página.** `MapaVivo` expone la instancia con `onMapa`. Los controles nuevos viven en un componente aparte (`ControlesMapa.tsx`) para no inflar más `MapaVivo`.
3. **Sombras.** MapLibre no tiene shadow map. Se hace en dos partes: (a) luz direccional con `setLight` según la posición real del sol en Medellín para la hora elegida, y (b) sombras proyectadas: copias de las huellas de los edificios en el piso, desplazadas con `fill-translate` en la dirección contraria al sol y con largo = altura / tan(altura del sol). Se agrupan por pisos para que cada grupo tenga su largo.
4. **Fondo.** El fondo gris de la base se vuelve transparente y el contenedor lleva el degradado #f8f6f1 a #e8f0e8. La niebla de afuera de la comuna toma ese mismo tono.
5. **Borde de la comuna.** Glow exterior de 12 px (línea difuminada) + línea blanca de separación + línea interior #1a4d2e de 3 px.
6. **Edificios.** 1 piso #d1e7d1, 2 pisos #4a8c6f, 3 o más #1a4d2e. Se agrega el código del barrio a cada edificio en el pipeline (`procesar.py`, propiedad `b`) para poder levantar los del barrio bajo el mouse.
7. **Etiquetas.** Los nombres de barrio pasan a marcadores HTML con Inter 600 y halo blanco. Se ocultan con zoom menor a 13,2 (60 % del zoom máximo de 22) y aparecen con fundido.
8. **Niebla y viñeta.** Capa CSS encima del canvas, sin capturar clics. En 3D además `setSky` con niebla de horizonte.
9. **Foto HD.** Se sube el pixel ratio para que el canvas mida 2560 px de ancho, se espera a que el mapa termine de dibujar, se compone en un canvas 2D (degradado + mapa + viñeta + nombres de barrio + créditos) y se descarga `santa-cruz-mapa-AAAA-MM-DD.png`.
10. **Joystick.** Base circular abajo a la derecha. Horizontal = giro continuo de 360°, vertical = inclinación de 0° a 60°. Doble clic vuelve al norte. También con flechas del teclado.
11. **Día y noche.** De noche se recolorean las capas de la base (guardando los colores originales para volver), cambia la luz, se apagan las sombras y los edificios usan un patrón con ventanas amarillas encendidas.
12. **Celular.** En Solo Mapa todo se esconde. Para entrar: botón o deslizar hacia arriba sobre la fila de temas. Para salir: botón X o deslizar hacia abajo desde el borde superior.

## Archivos a tocar

- `data-pipeline/procesar.py` (código de barrio en edificios) y `frontend/public/data/edificios.geojson` (regenerado)
- `frontend/index.html` (Inter)
- `frontend/src/index.css` (modo solo, niebla, etiquetas, tarjetas)
- `frontend/src/components/Layout.tsx` (marcar sidebar y header)
- `frontend/src/components/mapa/MapaVivo.tsx` (visual, sombras, noche, hover, etiquetas, opacidad, resize)
- `frontend/src/components/mapa/ControlesMapa.tsx` (nuevo: zoom, brújula, foto, joystick, día/noche, hora)
- `frontend/src/lib/sol.ts` (nuevo: posición del sol)
- `frontend/src/pages/Mapa.tsx` (botón Solo Mapa, panel colapsable, slider de opacidad, tarjetas, swipe)

## Verificación

`tsc --noEmit`, `npm run build`, capturas antes y después con Playwright (modo normal, Solo Mapa, 3D, noche, foto descargada) y revisión de que los filtros quedan iguales al salir de Solo Mapa.
