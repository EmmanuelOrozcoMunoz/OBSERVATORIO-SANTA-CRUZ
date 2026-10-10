# Plan: rediseño de la página de Inicio

Fecha: 10 de octubre de 2026. Meta: que cualquier persona de la Comuna 2 entienda en 5 segundos qué es esto, y que un diseñador lo vea como una plataforma de 2026, sin perder lo técnico.

## Dónde está cada cosa (índice de código)

| Pieza | Archivo |
|---|---|
| Página de Inicio, mapa pequeño (`DibujoComuna`) y lista de módulos (`MODULOS`) | `frontend/src/pages/Inicio.tsx` |
| Barra lateral, barra del celular y botón "Letra más grande" | `frontend/src/components/Layout.tsx` |
| Fuentes, interlineado, utilidades CSS | `frontend/index.html`, `frontend/tailwind.config.js`, `frontend/src/index.css` |
| Cifras de la comuna y de cada barrio | `frontend/public/data/indicadores.json` |

## Cifras: se usan las reales

Los números salen de `indicadores.json`, no del texto del encargo. Dos diferencias que se avisan en la entrega:

- Área: **219,6 ha** (no 219,8). Densidad: **493 hab/ha** (no 469). 108.252 ÷ 219,6 = 493.
- Fuente de población: el **DANE es del Censo 2018**, no 2024. El pie de página dice "DANE (Censo 2018)". Lo de 2024 es el índice de calidad de vida de la Alcaldía.
- Atropellos: 985 (suma de los barrios), de 5.606 siniestros. Espacio público: 0,85 m² por habitante contra 15 m² de referencia.

## Decisiones

1. **Sin librerías nuevas.** Aparecer al hacer scroll y los contadores se hacen con `IntersectionObserver` y CSS. Respeta "reducir movimiento" del sistema.
2. **Mapa vivo del hero.** Se queda como SVG (carga al instante, sirve en celulares viejos). Cada barrio se enciende en verde al pasar el mouse y muestra su nombre, población y densidad. Estaciones con pulso y líneas del Metrocable con un flujo de rayitas que entra y sale (cada línea en sentido contrario a la anterior).
3. **Fondo del hero.** Curvas de nivel generadas por código (no es una foto), al 4 % de opacidad, sobre un degradado radial verde claro.
4. **Título.** "¿Qué tan bien conectada está" en 48 px light y "Santa Cruz?" en 64 px bold #1a4d2e con un trazo curvo amarillo que se dibuja solo.
5. **Tarjetas de datos.**
   - Población: 108.252 personas, 493 por hectárea en grande, y una hectárea dibujada con 493 puntos (un punto = una persona).
   - Espacio público: dos barras, 0,85 contra 15, la roja casi invisible junto a la verde.
   - Atropellos: 985 en rojo y un mini mapa de los barrios pintado por cantidad de atropellos.
6. **Lista de módulos.** Pasa de tabla a filas con ícono grande, título, una línea, insignia verde "Disponible" con punto que late. Al pasar el mouse la fila se pone verde claro y aparece "Explorar →". Participación lleva insignia amarilla "Próximamente".
7. **Íconos.** Un solo juego de íconos de contorno (`IconosNav.tsx`) para la barra lateral y la lista.
8. **Barra lateral.** Se puede colapsar a solo íconos grandes (se recuerda en el navegador). En el mapa no se anima el ancho para no redibujar el mapa en cada cuadro.
9. **Letra.** Pasa de un interruptor a A− / A+ (4 niveles), flotante abajo a la derecha. En el mapa, donde esa esquina tiene el joystick, queda dentro de la barra lateral.
10. **Tipografía.** Inter en toda la plataforma, interlineado 1,6 en texto corrido.
11. **Cierre.** "Fuentes y calidad" como cita con borde izquierdo verde de 4 px y fondo #f0f7f0. Pie de página chico. Espacio entre secciones al doble.

## Archivos a tocar

`Inicio.tsx` (reescrito), `Layout.tsx`, `IconosNav.tsx` (nuevo), `index.css`, `tailwind.config.js`, `index.html`, `Mapa.tsx` (solo para que "Explora los 11 barrios en 3D" abra el mapa ya en 3D con `?3d=1`).

## Verificación

`tsc`, `build`, capturas en computador y celular (arriba, a mitad de scroll, barra colapsada), hover de barrio, contadores, A− / A+ y revisión de que el mapa y las demás páginas no se rompen con la nueva tipografía.
