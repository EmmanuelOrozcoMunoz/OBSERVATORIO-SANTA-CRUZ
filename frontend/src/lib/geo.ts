import type { Geometry, Position } from "geojson";

function enAnillo(x: number, y: number, anillo: Position[]) {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function enPoligono(x: number, y: number, anillos: Position[][]) {
  if (!anillos.length || !enAnillo(x, y, anillos[0])) return false;
  return !anillos.slice(1).some((hueco) => enAnillo(x, y, hueco));
}

/** ¿El punto (lon, lat) cae dentro del polígono o multipolígono? */
export function puntoEn(lon: number, lat: number, g: Geometry) {
  if (g.type === "Polygon") return enPoligono(lon, lat, g.coordinates);
  if (g.type === "MultiPolygon") return g.coordinates.some((p) => enPoligono(lon, lat, p));
  return false;
}

/** Distancia aproximada en metros entre dos puntos (fórmula del haversine). */
export function distanciaM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
