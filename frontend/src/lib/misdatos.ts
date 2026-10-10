/**
 * "Mis datos": archivos que la persona sube (CSV con coordenadas o GeoJSON).
 * Todo se lee y se guarda en el navegador: no se envía a ningún servidor.
 */
import type { Feature, FeatureCollection, Geometry } from "geojson";

const CLAVE = "observatorio-santa-cruz:mis-datos";
export const LIMITE_BYTES = 3_000_000;

export interface ConjuntoPropio {
  id: string;
  nombre: string;
  creado: string;
  filas: number;
  campos: string[];
  geojson: FeatureCollection;
}

export function leerConjuntos(): ConjuntoPropio[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function guardarConjuntos(c: ConjuntoPropio[]): boolean {
  try {
    const txt = JSON.stringify(c);
    if (txt.length > LIMITE_BYTES) return false;
    localStorage.setItem(CLAVE, txt);
    window.dispatchEvent(new Event("mis-datos"));
    return true;
  } catch {
    return false;
  }
}

/** Todos los conjuntos propios como una sola capa para el mapa; cada elemento lleva el nombre de su archivo. */
export function coleccionMisDatos(): FeatureCollection {
  const features: Feature<Geometry>[] = [];
  for (const c of leerConjuntos())
    for (const f of c.geojson.features) features.push({ ...f, properties: { ...(f.properties ?? {}), archivo: c.nombre } });
  return { type: "FeatureCollection", features };
}

// ------------------------------------------------------------------ lectura de archivos
const NOMBRES_LAT = ["lat", "latitud", "latitude", "y"];
const NOMBRES_LON = ["lon", "lng", "long", "longitud", "longitude", "x"];

/** Parte una línea CSV respetando comillas. */
function partir(linea: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < linea.length; i++) {
    const ch = linea[i];
    if (ch === '"') {
      if (q && linea[i + 1] === '"') { cur += '"'; i++; } else q = !q;
    } else if (ch === sep && !q) { out.push(cur); cur = ""; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function leerCSV(texto: string): { geojson: FeatureCollection; campos: string[]; descartadas: number } {
  const lineas = texto.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lineas.length < 2) throw new Error("El CSV necesita una fila de títulos y al menos una fila de datos.");
  const sep = [";", "\t", ","].map((s) => [s, lineas[0].split(s).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const cab = partir(lineas[0], sep);
  const bajo = cab.map((c) => c.toLowerCase());
  const iLat = bajo.findIndex((c) => NOMBRES_LAT.includes(c));
  const iLon = bajo.findIndex((c) => NOMBRES_LON.includes(c));
  if (iLat < 0 || iLon < 0) throw new Error(`No encontré columnas de coordenadas. Ponles de título "lat" y "lon" (o latitud y longitud). Títulos que leí: ${cab.join(", ")}.`);
  const features: Feature[] = [];
  let descartadas = 0;
  for (const l of lineas.slice(1)) {
    const c = partir(l, sep);
    const lat = Number(c[iLat].replace(",", "."));
    const lon = Number(c[iLon].replace(",", "."));
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || (lat === 0 && lon === 0)) { descartadas++; continue; }
    const props: Record<string, string | number> = {};
    cab.forEach((t, i) => {
      if (i === iLat || i === iLon) return;
      const v = c[i] ?? "";
      props[t] = v !== "" && isFinite(Number(v.replace(",", "."))) && !/^0\d/.test(v) ? Number(v.replace(",", ".")) : v;
    });
    features.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [lon, lat] } });
  }
  if (!features.length) throw new Error("Ninguna fila tenía coordenadas válidas.");
  return { geojson: { type: "FeatureCollection", features }, campos: cab.filter((_, i) => i !== iLat && i !== iLon), descartadas };
}

export function leerGeoJSON(texto: string): { geojson: FeatureCollection; campos: string[]; descartadas: number } {
  let v: unknown;
  try { v = JSON.parse(texto); } catch { throw new Error("El archivo no es un JSON válido."); }
  const o = v as { type?: string; features?: Feature[]; geometry?: Geometry; coordinates?: unknown };
  let features: Feature[] = [];
  if (o.type === "FeatureCollection" && Array.isArray(o.features)) features = o.features;
  else if (o.type === "Feature") features = [o as unknown as Feature];
  else if (o.type && o.coordinates) features = [{ type: "Feature", properties: {}, geometry: o as unknown as Geometry }];
  else if (Array.isArray(v)) {
    // lista de objetos con lat y lon
    features = (v as Record<string, unknown>[]).flatMap((r) => {
      const k = Object.keys(r);
      const la = k.find((x) => NOMBRES_LAT.includes(x.toLowerCase())), lo = k.find((x) => NOMBRES_LON.includes(x.toLowerCase()));
      if (!la || !lo || !isFinite(Number(r[la])) || !isFinite(Number(r[lo]))) return [];
      const { [la]: _a, [lo]: _b, ...resto } = r;
      void _a; void _b;
      return [{ type: "Feature" as const, properties: resto as Record<string, unknown>, geometry: { type: "Point" as const, coordinates: [Number(r[lo]), Number(r[la])] } }];
    });
  }
  const validas = features.filter((f) => f && f.geometry && (f.geometry as { coordinates?: unknown }).coordinates);
  if (!validas.length) throw new Error("No encontré elementos con geometría en el archivo.");
  const campos = [...new Set(validas.slice(0, 200).flatMap((f) => Object.keys(f.properties ?? {})))];
  return { geojson: { type: "FeatureCollection", features: validas.map((f) => ({ type: "Feature", properties: f.properties ?? {}, geometry: f.geometry })) }, campos, descartadas: features.length - validas.length };
}

/** Caja que encierra todo, en grados. */
export function cajaDe(col: FeatureCollection): [number, number, number, number] {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  const ver = (c: unknown) => {
    if (Array.isArray(c) && typeof c[0] === "number") {
      const [x, y] = c as number[];
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    } else if (Array.isArray(c)) c.forEach(ver);
  };
  col.features.forEach((f) => ver((f.geometry as { coordinates: unknown }).coordinates));
  return [x0, y0, x1, y1];
}
