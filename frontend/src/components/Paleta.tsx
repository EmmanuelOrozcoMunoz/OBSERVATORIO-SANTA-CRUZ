import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cargar } from "../lib/datos";
import type { Indicadores } from "../lib/tipos";
import IconoNav from "./IconosNav";

type Opcion = { id: string; nombre: string; detalle: string; icono: string; ruta: string };

const FIJAS: Opcion[] = [
  { id: "inicio", nombre: "Inicio", detalle: "Portada", icono: "inicio", ruta: "/" },
  { id: "mapa", nombre: "Mapa territorial", detalle: "Todas las capas", icono: "mapa", ruta: "/mapa" },
  { id: "problematicas", nombre: "Problemáticas", detalle: "Ocho problemas con datos", icono: "alerta", ruta: "/problematicas" },
  { id: "corredor", nombre: "Corredor Carrera 49", detalle: "¿Conviene ir por la 49?", icono: "corredor", ruta: "/corredor-49" },
  { id: "indicadores", nombre: "Indicadores", detalle: "Cifras por barrio", icono: "indicadores", ruta: "/indicadores" },
  { id: "accesibilidad", nombre: "Accesibilidad", detalle: "Minutos caminando", icono: "accesibilidad", ruta: "/accesibilidad" },
  { id: "prioridades", nombre: "Prioridad de obras", detalle: "Dónde intervenir primero", icono: "prioridades", ruta: "/prioridades" },
  { id: "radar", nombre: "Radar de noticias", detalle: "Lo que dicen los medios", icono: "radar", ruta: "/radar" },
  { id: "propuesta", nombre: "Propuesta de valor", detalle: "Por qué existe el observatorio", icono: "corazon", ruta: "/propuesta" },
  { id: "identidad", nombre: "Manual de identidad", detalle: "Colores, letras, voz y reglas", icono: "paleta", ruta: "/identidad" },
  { id: "datos", nombre: "Mis datos", detalle: "Sube y mira tus datos", icono: "subir", ruta: "/datos" },
  { id: "fuentes", nombre: "Fuentes y calidad", detalle: "De dónde sale cada dato", icono: "fuentes", ruta: "/fuentes" },
  { id: "m-seg", nombre: "Mapa: seguridad", detalle: "Atajo a las capas de seguridad", icono: "mapa", ruta: "/mapa?capas=mortalidad_vial,camaras_cctv,semaforos" },
  { id: "m-49", nombre: "Mapa: eje de la Carrera 49", detalle: "Atajo a la capa del eje", icono: "mapa", ruta: "/mapa?capas=eje49" },
];

const sin = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Buscador rápido (Ctrl + K): saltar a cualquier módulo o barrio sin recorrer el menú. */
export default function Paleta({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [barrios, setBarrios] = useState<Opcion[]>([]);
  const ir = useNavigate();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierta) return;
    setQ("");
    setSel(0);
    setTimeout(() => input.current?.focus(), 30);
    cargar<Indicadores>("indicadores.json")
      .then((d) => setBarrios(d.barrios.map((b) => ({ id: `b-${b.codigo}`, nombre: b.nombre, detalle: "Ficha del barrio", icono: "personas", ruta: `/barrios/${b.codigo}` }))))
      .catch(() => undefined);
  }, [abierta]);

  const lista = useMemo(() => {
    const t = sin(q.trim());
    const todas = [...FIJAS, ...barrios];
    return t ? todas.filter((o) => sin(`${o.nombre} ${o.detalle}`).includes(t)) : todas.slice(0, 9);
  }, [q, barrios]);

  if (!abierta) return null;
  const abrir = (o: Opcion | undefined) => {
    if (!o) return;
    onCerrar();
    ir(o.ruta);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-start justify-center bg-[#0f2a1a]/45 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onCerrar} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Buscar en el observatorio" className="w-full max-w-lg overflow-hidden rounded-2xl bg-superficie shadow-2xl ring-1 ring-black/10" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={input}
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onCerrar();
            else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(lista.length - 1, s + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
            else if (e.key === "Enter") abrir(lista[sel]);
          }}
          placeholder="Ir a un módulo o un barrio…"
          aria-label="Buscar"
          className="w-full border-b border-nivel px-5 py-4 text-lg outline-none"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {lista.length === 0 && <li className="px-3 py-6 text-center text-tinta-suave">No hay nada con ese nombre.</li>}
          {lista.map((o, i) => (
            <li key={o.id}>
              <button type="button" onMouseEnter={() => setSel(i)} onClick={() => abrir(o)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === sel ? "bg-menta" : ""}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#1a4d2e]/10 text-marca"><IconoNav nombre={o.icono} className="h-5 w-5" trazo={1.8} /></span>
                <span className="min-w-0"><span className="block font-semibold leading-tight">{o.nombre}</span><span className="block text-sm text-tinta-suave">{o.detalle}</span></span>
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-nivel bg-papel px-4 py-2 text-xs text-tinta-tenue">↑ ↓ para moverte, Enter para abrir, Esc para cerrar</p>
      </div>
    </div>
  );
}
