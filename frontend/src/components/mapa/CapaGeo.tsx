import { useEffect, useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import L, { type PathOptions } from "leaflet";
import type { DefCapa } from "../../lib/capas";
import { useDatos } from "../../lib/datos";
import type { Coleccion, Elemento, Props } from "../../lib/tipos";

interface Opciones {
  def: DefCapa;
  onSeleccionar: (capa: string, elemento: Elemento) => void;
  onEstado: (capa: string, estado: "cargando" | "listo" | "error", mensaje?: string) => void;
  filtro?: (p: Props) => boolean;
  claveFiltro?: string;
  estiloExtra?: (p: Props) => PathOptions | null;
  claveEstilo?: string;
}

/** Carga una capa bajo demanda (solo cuando se activa) y la dibuja. */
export default function CapaGeo({ def, onSeleccionar, onEstado, filtro, claveFiltro, estiloExtra, claveEstilo }: Opciones) {
  const estado = useDatos<Coleccion>(`${def.id}.geojson`);

  useEffect(() => {
    if (estado.estado === "error") onEstado(def.id, "error", estado.error);
    else onEstado(def.id, estado.estado);
  }, [estado, def.id, onEstado]);

  const datos = useMemo(() => {
    if (estado.estado !== "listo") return null;
    if (!filtro) return estado.datos;
    return { ...estado.datos, features: estado.datos.features.filter((f) => filtro(f.properties ?? {})) };
  }, [estado, filtro]);

  if (!datos) return null;

  const estilo = (f?: Elemento) => {
    const p = f?.properties ?? {};
    return { ...def.estilo(p), ...(estiloExtra?.(p) ?? {}) };
  };

  return (
    <GeoJSON
      key={`${def.id}-${claveFiltro ?? ""}-${claveEstilo ?? ""}`}
      data={datos}
      pane={def.pane}
      style={estilo as L.StyleFunction}
      pointToLayer={(f, latlng) =>
        L.circleMarker(latlng, { ...estilo(f as Elemento), radius: def.radio?.((f.properties ?? {}) as Props) ?? 5, pane: def.pane })
      }
      onEachFeature={(f, layer) => {
        const p = (f.properties ?? {}) as Props;
        layer.bindTooltip(def.titulo(p), { sticky: true, direction: "top", className: "tooltip-mapa" });
        layer.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          onSeleccionar(def.id, f as Elemento);
        });
        if (def.geometria === "poligono" && "setStyle" in layer) {
          const capa = layer as L.Path;
          layer.on("mouseover", () => capa.setStyle({ weight: (estilo(f as Elemento).weight ?? 1) + 1.5 }));
          layer.on("mouseout", () => capa.setStyle(estilo(f as Elemento)));
        }
      }}
    />
  );
}
