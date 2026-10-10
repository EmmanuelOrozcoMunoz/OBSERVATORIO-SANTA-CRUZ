import { useMemo } from "react";
import type { Position } from "geojson";
import { useDatos } from "./datos";
import type { Coleccion } from "./tipos";

/** Proyección simple de los barrios al SVG (válida a esta escala). */
export function useProyeccion(ancho: number, alto: number, margen: number) {
  const barrios = useDatos<Coleccion>("barrios.geojson");
  return useMemo(() => {
    if (barrios.estado !== "listo") return null;
    const anillos = (g: Coleccion["features"][number]["geometry"]): Position[][] =>
      g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
    const pts = barrios.datos.features.flatMap((f) => anillos(f.geometry).flat());
    const lon = pts.map((p) => p[0]);
    const lat = pts.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...lon), Math.max(...lon), Math.min(...lat), Math.max(...lat)];
    const k = Math.cos(((y0 + y1) / 2) * (Math.PI / 180));
    const escala = Math.min((ancho - 2 * margen) / ((x1 - x0) * k), (alto - 2 * margen) / (y1 - y0));
    const ox = (ancho - (x1 - x0) * k * escala) / 2;
    const oy = (alto - (y1 - y0) * escala) / 2;
    const xy = (p: Position) => [ox + (p[0] - x0) * k * escala, oy + (y1 - p[1]) * escala] as const;
    const camino = (rs: Position[][]) => rs.map((r) => "M" + r.map((p) => xy(p).map((n) => n.toFixed(1)).join(",")).join("L") + "Z").join("");
    const items = barrios.datos.features.map((f) => {
      const rs = anillos(f.geometry);
      const mayor = rs.reduce((a, b) => (b.length > a.length ? b : a), rs[0]);
      const c = mayor.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map((v) => v / mayor.length);
      return { codigo: String(f.properties?.codigo), nombre: String(f.properties?.nombre), d: camino(rs), centro: xy(c as Position) };
    });
    return { items, xy };
  }, [barrios, ancho, alto, margen]);
}

