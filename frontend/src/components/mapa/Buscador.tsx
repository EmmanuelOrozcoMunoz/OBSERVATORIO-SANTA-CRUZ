import { useEffect, useMemo, useRef, useState } from "react";
import { cargar } from "../../lib/datos";
import type { Coleccion, Elemento } from "../../lib/tipos";

export interface Resultado {
  capa: string;
  tipo: string;
  nombre: string;
  detalle: string;
  elemento: Elemento;
}

type Fuente = { capa: string; archivo: string; tipo: string; soloComuna: boolean };
const FUENTES_BUSQUEDA: Record<"comuna" | "ciudad", Fuente[]> = {
  comuna: [
    { capa: "barrios", archivo: "barrios", tipo: "Barrio", soloComuna: false },
    { capa: "estaciones", archivo: "estaciones", tipo: "Estación", soloComuna: false },
    { capa: "equipamientos", archivo: "equipamientos", tipo: "Equipamiento", soloComuna: true },
    { capa: "sedes_educativas", archivo: "sedes_educativas", tipo: "Colegio", soloComuna: true },
    { capa: "escenarios_deportivos", archivo: "escenarios_deportivos", tipo: "Escenario deportivo", soloComuna: true },
    { capa: "bibliotecas", archivo: "bibliotecas", tipo: "Biblioteca", soloComuna: false },
  ],
  ciudad: [
    { capa: "comunas", archivo: "comunas_ciudad", tipo: "Comuna", soloComuna: false },
    { capa: "barrios", archivo: "barrios", tipo: "Barrio de Santa Cruz", soloComuna: false },
    { capa: "estaciones", archivo: "estaciones_ciudad", tipo: "Estación", soloComuna: false },
    { capa: "equipamientos", archivo: "equipamientos_ciudad", tipo: "Equipamiento", soloComuna: false },
    { capa: "sedes_educativas", archivo: "sedes_educativas_ciudad", tipo: "Colegio", soloComuna: false },
    { capa: "bibliotecas", archivo: "bibliotecas_ciudad", tipo: "Biblioteca", soloComuna: false },
  ],
};

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function Buscador({ onElegir, modo = "comuna" }: { onElegir: (r: Resultado) => void; modo?: "comuna" | "ciudad" }) {
  const [indice, setIndice] = useState<Resultado[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consulta, setConsulta] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIndice(null);
    Promise.all(FUENTES_BUSQUEDA[modo].map((f) => cargar<Coleccion>(`${f.archivo}.geojson`).then((c) => ({ f, c }))))
      .then((partes) => {
        const res: Resultado[] = [];
        for (const { f, c } of partes) {
          for (const e of c.features) {
            const p = e.properties ?? {};
            if (f.soloComuna && !p.en_comuna) continue;
            const nombre = String(p.nombre ?? "");
            if (!nombre || nombre.startsWith("Sin nombre")) continue;
            const detalle =
              f.capa === "estaciones" ? String(p.linea ?? "") : String(p.barrio ?? p.comuna ?? (f.capa === "barrios" ? "Comuna 2" : ""));
            res.push({ capa: f.capa, tipo: f.tipo, nombre, detalle, elemento: e });
          }
        }
        setIndice(res);
      })
      .catch((e: Error) => setError(e.message));
  }, [modo]);

  useEffect(() => {
    const cerrar = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const resultados = useMemo(() => {
    if (!indice || consulta.trim().length < 2) return [];
    const q = normalizar(consulta);
    return indice
      .filter((r) => normalizar(r.nombre).includes(q))
      .sort((a, b) => Number(!normalizar(a.nombre).startsWith(q)) - Number(!normalizar(b.nombre).startsWith(q)))
      .slice(0, 8);
  }, [indice, consulta]);

  const elegir = (r: Resultado) => {
    onElegir(r);
    setConsulta(r.nombre);
    setAbierto(false);
  };

  return (
    <div ref={caja} className="relative">
      <label htmlFor="buscar" className="sr-only">
        Buscar barrio, equipamiento o estación
      </label>
      <input
        id="buscar"
        type="search"
        role="combobox"
        aria-expanded={abierto && resultados.length > 0}
        aria-controls="resultados-busqueda"
        aria-autocomplete="list"
        placeholder={indice ? "Buscar un barrio, colegio o estación" : "Preparando la búsqueda…"}
        disabled={!indice}
        value={consulta}
        onChange={(e) => {
          setConsulta(e.target.value);
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setActivo((i) => Math.min(i + 1, resultados.length - 1));
          if (e.key === "ArrowUp") setActivo((i) => Math.max(i - 1, 0));
          if (e.key === "Enter" && resultados[activo]) elegir(resultados[activo]);
          if (e.key === "Escape") setAbierto(false);
        }}
        className="w-full rounded-2xl border border-nivel bg-superficie/95 px-4 py-3 text-base shadow-lg backdrop-blur placeholder:text-tinta-tenue"
      />
      {error && <p className="mt-1 text-xs text-ladrillo">La búsqueda no está disponible: {error}</p>}
      {abierto && consulta.trim().length >= 2 && indice && (
        <ul
          id="resultados-busqueda"
          role="listbox"
          className="absolute z-[1200] mt-1 max-h-80 w-full overflow-auto rounded-2xl border border-nivel bg-superficie py-1 shadow-xl"
        >
          {resultados.length === 0 && <li className="px-3 py-2 text-sm text-tinta-suave">No hay resultados en la comuna.</li>}
          {resultados.map((r, i) => (
            <li
              key={`${r.capa}-${r.nombre}-${i}`}
              role="option"
              aria-selected={i === activo}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir(r)}
              className={`cursor-pointer px-4 py-2.5 text-base ${i === activo ? "bg-ladera-claro" : ""}`}
            >
              <span className="block">{r.nombre}</span>
              <span className="block text-sm text-tinta-suave">
                {r.tipo}
                {r.detalle ? `, ${r.detalle}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
